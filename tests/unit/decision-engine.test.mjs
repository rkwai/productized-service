import assert from "node:assert/strict";

import { buildDecisionEngine } from "../../src/lib/decision-engine.js";

const leads = [
  {
    lead_id: "lead_acme",
    company_name: "Acme Co",
    stage: "Qualified",
    status: "Open",
    expected_value: 120000,
    last_contacted_at: "2026-01-01",
    next_step_summary: "",
  },
];

const deals = [
  {
    deal_id: "deal_acme",
    deal_name: "Acme Retainer",
    stage: "Negotiation",
    status: "Open",
    amount: 200000,
    probability: 0.5,
    expected_close_date: "2026-02-10",
  },
];

const accounts = [
  {
    account_id: "acc_acme",
    account_name: "Acme Co",
    lifecycle_stage: "Onboarded",
    activation_status: "At risk",
    renewal_risk_score: 72,
  },
];

const derived = {
  client_account: {
    acc_acme: {
      ltv_at_risk: 250000,
      renewal_risk_score: 72,
      missing_data_fields: ["avg_monthly_revenue"],
    },
  },
};

const getDerivedValue = (objectType, objectId, field) =>
  derived[objectType]?.[objectId]?.[field] ?? null;

const engine = buildDecisionEngine({
  leads,
  deals,
  accounts,
  getDerivedValue,
  now: new Date("2026-02-03T00:00:00Z"),
});

assert.ok(engine.focus);
assert.equal(engine.focus.objectType, "client_account");
assert.equal(engine.focus.action, "Recover activation");
assert.ok(engine.nextSteps.length);

const leadStep = engine.queues.leads[0];
assert.equal(leadStep.objectType, "lead");
assert.equal(leadStep.action, "Define the next step");

const dealStep = engine.queues.deals[0];
assert.equal(dealStep.objectType, "deal");
assert.equal(dealStep.action, "Prepare close plan");

console.log("decision engine unit tests passed");
