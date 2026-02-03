const STALE_LEAD_DAYS = 14;
const CLOSE_SOON_DAYS = 14;
const LEAD_STAGE_WEIGHT = {
  Lead: 0.35,
  Qualified: 0.55,
  Proposal: 0.75,
  Negotiation: 0.9,
  Won: 0,
  Lost: 0,
};
const DEAL_STAGE_WEIGHT = {
  Discovery: 0.5,
  Proposal: 0.7,
  Negotiation: 0.85,
  "Closed Won": 0,
  "Closed Lost": 0,
};

const toNumber = (value) => (Number.isFinite(Number(value)) ? Number(value) : 0);

const parseDate = (value) => {
  if (!value) return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const daysBetween = (start, end) =>
  Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));

const daysSince = (value, now) => {
  const date = parseDate(value);
  if (!date) return null;
  return Math.max(0, daysBetween(date, now));
};

const daysUntil = (value, now) => {
  const date = parseDate(value);
  if (!date) return null;
  return Math.round((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
};

const normalizeStatus = (value) => String(value || "").trim().toLowerCase();

const buildLeadRecommendation = (lead, now) => {
  if (!lead) return null;
  const status = normalizeStatus(lead.status);
  if (status && status !== "open") return null;
  const expectedValue = toNumber(lead.expected_value);
  const stageWeight = LEAD_STAGE_WEIGHT[lead.stage] ?? 0.4;
  const staleDays = daysSince(lead.last_contacted_at, now);
  const hasNextStep = Boolean(lead.next_step_summary);

  let action = "Advance lead";
  if (!hasNextStep) {
    action = "Define the next step";
  } else if (staleDays != null && staleDays >= STALE_LEAD_DAYS) {
    action = "Re-engage the lead";
  } else if (["Proposal", "Negotiation"].includes(lead.stage)) {
    action = "Close the decision";
  } else if (lead.stage === "Lead") {
    action = "Qualify the lead";
  }

  const baseValue = expectedValue * stageWeight;
  const stalenessBoost = staleDays != null && staleDays >= STALE_LEAD_DAYS ? expectedValue * 0.15 : 0;
  const nextStepPenalty = hasNextStep ? 0 : expectedValue * 0.1;
  const score = Math.round(baseValue + stalenessBoost + nextStepPenalty);

  const urgency =
    staleDays != null && staleDays >= STALE_LEAD_DAYS ? `Last touch ${staleDays}d ago` : `Stage: ${lead.stage || "Lead"}`;

  return {
    objectType: "lead",
    objectId: lead.lead_id,
    title: lead.company_name || lead.lead_id,
    category: "Lead",
    action,
    reason: urgency,
    valueAtStake: expectedValue,
    score,
  };
};

const buildDealRecommendation = (deal, now) => {
  if (!deal) return null;
  const status = normalizeStatus(deal.status);
  if (status && status !== "open") return null;
  const amount = toNumber(deal.amount);
  const probability = toNumber(deal.probability) || 0.3;
  const stageWeight = DEAL_STAGE_WEIGHT[deal.stage] ?? 0.65;
  const closeInDays = daysUntil(deal.expected_close_date, now);
  const closeBoost = closeInDays != null && closeInDays <= CLOSE_SOON_DAYS ? 1.2 : 1;

  let action = "Advance the deal";
  if (closeInDays != null && closeInDays <= CLOSE_SOON_DAYS) {
    action = "Prepare close plan";
  } else if (probability < 0.4) {
    action = "Improve win odds";
  } else if (deal.stage === "Proposal") {
    action = "Lock proposal feedback";
  }

  const weightedValue = amount * probability * stageWeight;
  const score = Math.round(weightedValue * closeBoost);
  let urgency = `Stage: ${deal.stage || "Discovery"}`;
  if (closeInDays != null) {
    urgency = closeInDays >= 0 ? `Close in ${closeInDays}d` : `Overdue by ${Math.abs(closeInDays)}d`;
  }

  return {
    objectType: "deal",
    objectId: deal.deal_id,
    title: deal.deal_name || deal.deal_id,
    category: "Deal",
    action,
    reason: urgency,
    valueAtStake: amount * probability,
    score,
  };
};

const buildAccountRecommendation = (account, getDerivedValue) => {
  if (!account) return null;
  const activationStatus = normalizeStatus(account.activation_status);
  const lifecycleStage = String(account.lifecycle_stage || "");
  const ltvAtRisk = toNumber(getDerivedValue("client_account", account.account_id, "ltv_at_risk"));
  const renewalRisk =
    toNumber(getDerivedValue("client_account", account.account_id, "renewal_risk_score")) ||
    toNumber(account.renewal_risk_score);
  const missingFields =
    getDerivedValue("client_account", account.account_id, "missing_data_fields") || [];
  const missingCount = Array.isArray(missingFields) ? missingFields.length : 0;

  let action = "Maintain momentum";
  if (activationStatus === "at risk") {
    action = "Recover activation";
  } else if (lifecycleStage === "Onboarded") {
    action = "Drive activation milestones";
  } else if (renewalRisk >= 70) {
    action = "Run retention plan";
  } else if (missingCount > 0) {
    action = "Fill data gaps";
  }

  const riskBonus = renewalRisk * 1000;
  const dataPenalty = missingCount * 5000;
  const score = Math.round(ltvAtRisk + riskBonus + dataPenalty);

  let urgency = "Healthy";
  if (activationStatus === "at risk") {
    urgency = "Activation at risk";
  } else if (lifecycleStage) {
    urgency = `Lifecycle: ${lifecycleStage}`;
  } else if (missingCount > 0) {
    urgency = `${missingCount} data gaps`;
  }

  return {
    objectType: "client_account",
    objectId: account.account_id,
    title: account.account_name || account.account_id,
    category: "Customer",
    action,
    reason: urgency,
    valueAtStake: ltvAtRisk,
    score,
  };
};

export const buildDecisionEngine = ({
  leads = [],
  deals = [],
  accounts = [],
  getDerivedValue = () => null,
  now = new Date(),
} = {}) => {
  const leadSteps = leads
    .map((lead) => buildLeadRecommendation(lead, now))
    .filter(Boolean)
    .sort((a, b) => b.score - a.score);

  const dealSteps = deals
    .map((deal) => buildDealRecommendation(deal, now))
    .filter(Boolean)
    .sort((a, b) => b.score - a.score);

  const accountSteps = accounts
    .map((account) => buildAccountRecommendation(account, getDerivedValue))
    .filter(Boolean)
    .sort((a, b) => b.score - a.score);

  const nextSteps = [...accountSteps, ...dealSteps, ...leadSteps].sort((a, b) => b.score - a.score);
  const focus = nextSteps[0] || null;

  return {
    focus,
    nextSteps: nextSteps.slice(0, 6),
    queues: {
      accounts: accountSteps.slice(0, 6),
      deals: dealSteps.slice(0, 6),
      leads: leadSteps.slice(0, 6),
    },
  };
};
