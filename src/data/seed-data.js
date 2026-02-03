const toDate = (year, month, day) =>
  `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

const addMonths = (year, month, add) => {
  const date = new Date(Date.UTC(year, month - 1 + add, 1));
  return { year: date.getUTCFullYear(), month: date.getUTCMonth() + 1 };
};

const getLifecycleStage = (account) => {
  if (account.health_score >= 75) return "Retained";
  if (account.health_score >= 60) return "Activated";
  return "Onboarded";
};

const getActivationStatus = (account) => {
  if (account.renewal_risk_score >= 65) return "At risk";
  if (account.health_score >= 70) return "On track";
  return "In progress";
};

const teamMembers = [
  {
    team_member_id: "tm_001",
    name: "Avery Chen",
    role: "Engagement Lead",
    practice_area: "Product Strategy",
    location: "NYC",
    active_flag: true,
  },
  {
    team_member_id: "tm_002",
    name: "Luca Rossi",
    role: "Delivery Manager",
    practice_area: "Engineering Operations",
    location: "London",
    active_flag: true,
  },
  {
    team_member_id: "tm_003",
    name: "Marisol Vega",
    role: "Program Manager",
    practice_area: "Product & Engineering",
    location: "Austin",
    active_flag: true,
  },
  {
    team_member_id: "tm_004",
    name: "Diego Park",
    role: "Portfolio Director",
    practice_area: "Growth & Retention",
    location: "Toronto",
    active_flag: true,
  },
];

const accountProfiles = [
  {
    account_id: "acct_nova",
    account_name: "Nova Commerce Co.",
    industry: "Ecommerce",
    region: "North America",
    segment_tag: "Growth",
    health_score: 62,
    renewal_risk_score: 50,
    total_contract_value_to_date: 720000,
    estimated_ltv: 2400000,
    customer_acquisition_cost: 300000,
    avg_monthly_revenue: 85000,
    gross_margin_pct: 55,
    created_date: "2023-05-12",
    success_criteria:
      "Increase activation by 20% and cut release cycle time by 30%.",
    sponsor: {
      name: "Priya Singh",
      email: "priya.singh@nova.com",
      title: "Chief Product Officer",
      last_contacted_at: "2024-11-05",
      sentiment_score: 0.68,
    },
    owner: {
      name: "Jonas Petrov",
      email: "jonas.petrov@nova.com",
      title: "VP Engineering",
      last_contacted_at: "2024-11-02",
      sentiment_score: 0.6,
    },
    start_date: "2024-07-01",
    end_date: "2025-06-30",
    renewal_date: "2025-06-30",
    governance_cadence: "Weekly",
  },
  {
    account_id: "acct_orbit",
    account_name: "Orbit Logistics",
    industry: "Logistics",
    region: "EMEA",
    segment_tag: "Growth",
    health_score: 60,
    renewal_risk_score: 58,
    total_contract_value_to_date: 650000,
    estimated_ltv: 2000000,
    customer_acquisition_cost: 260000,
    avg_monthly_revenue: 75000,
    gross_margin_pct: 52,
    created_date: "2024-01-12",
    success_criteria:
      "Improve on-time delivery by 12% and reduce cost-to-serve by 8%.",
    sponsor: {
      name: "Hannah Lee",
      email: "hannah.lee@orbit.com",
      title: "CTO",
      last_contacted_at: "2024-10-22",
      sentiment_score: 0.46,
    },
    owner: {
      name: "Mateo Cruz",
      email: "mateo.cruz@orbit.com",
      title: "Director of Operations",
      last_contacted_at: "2024-10-18",
      sentiment_score: 0.52,
    },
    start_date: "2024-05-10",
    end_date: "2025-02-28",
    renewal_date: "2025-03-01",
    governance_cadence: "Weekly",
  },
  {
    account_id: "acct_summit",
    account_name: "Summit Fintech",
    industry: "Fintech",
    region: "North America",
    segment_tag: "Strategic",
    health_score: 82,
    renewal_risk_score: 28,
    total_contract_value_to_date: 2700000,
    estimated_ltv: 7500000,
    customer_acquisition_cost: 520000,
    avg_monthly_revenue: 210000,
    gross_margin_pct: 68,
    created_date: "2022-11-04",
    success_criteria:
      "Drive enterprise activation and improve expansion revenue by 15%.",
    sponsor: {
      name: "Elliot Brooks",
      email: "elliot.brooks@summitfin.com",
      title: "Chief Revenue Officer",
      last_contacted_at: "2024-11-01",
      sentiment_score: 0.74,
    },
    owner: {
      name: "Wen Li",
      email: "wen.li@summitfin.com",
      title: "SVP Product",
      last_contacted_at: "2024-10-27",
      sentiment_score: 0.69,
    },
    start_date: "2024-02-01",
    end_date: "2025-01-31",
    renewal_date: "2025-02-01",
    governance_cadence: "Bi-weekly",
  },
  {
    account_id: "acct_helios",
    account_name: "Helios Health Network",
    industry: "Healthcare",
    region: "North America",
    segment_tag: "Strategic",
    health_score: 76,
    renewal_risk_score: 40,
    total_contract_value_to_date: 2100000,
    estimated_ltv: 6200000,
    customer_acquisition_cost: 480000,
    avg_monthly_revenue: 190000,
    gross_margin_pct: 65,
    created_date: "2023-02-18",
    success_criteria:
      "Reduce care cycle time by 18% and improve patient onboarding.",
    sponsor: {
      name: "Camila Torres",
      email: "camila.torres@helioshealth.com",
      title: "Chief Digital Officer",
      last_contacted_at: "2024-10-28",
      sentiment_score: 0.64,
    },
    owner: {
      name: "Noah Kim",
      email: "noah.kim@helioshealth.com",
      title: "VP Product",
      last_contacted_at: "2024-10-25",
      sentiment_score: 0.58,
    },
    start_date: "2024-01-15",
    end_date: "2024-12-31",
    renewal_date: "2025-01-15",
    governance_cadence: "Monthly",
  },
  {
    account_id: "acct_atlas",
    account_name: "Atlas Marketplace",
    industry: "Marketplace",
    region: "EMEA",
    segment_tag: "Strategic",
    health_score: 70,
    renewal_risk_score: 55,
    total_contract_value_to_date: 1800000,
    estimated_ltv: 5400000,
    customer_acquisition_cost: 410000,
    avg_monthly_revenue: 160000,
    gross_margin_pct: 61,
    created_date: "2023-06-09",
    success_criteria:
      "Increase liquidity by 12% and retention by 8% for top cohorts.",
    sponsor: {
      name: "Olivia Park",
      email: "olivia.park@atlasmarket.com",
      title: "Chief Growth Officer",
      last_contacted_at: "2024-10-30",
      sentiment_score: 0.6,
    },
    owner: {
      name: "Ravi Shah",
      email: "ravi.shah@atlasmarket.com",
      title: "Director of Product",
      last_contacted_at: "2024-10-26",
      sentiment_score: 0.57,
    },
    start_date: "2024-03-05",
    end_date: "2025-03-04",
    renewal_date: "2025-03-05",
    governance_cadence: "Bi-weekly",
  },
  {
    account_id: "acct_pulse",
    account_name: "Pulse Commerce",
    industry: "Retail",
    region: "North America",
    segment_tag: "Scale",
    health_score: 74,
    renewal_risk_score: 32,
    total_contract_value_to_date: 1050000,
    estimated_ltv: 3200000,
    customer_acquisition_cost: 180000,
    avg_monthly_revenue: 120000,
    gross_margin_pct: 62,
    created_date: "2023-08-22",
    success_criteria:
      "Increase repeat purchase rate and reduce roadmap churn delays.",
    sponsor: {
      name: "Sienna Harper",
      email: "sienna.harper@pulsecommerce.com",
      title: "Chief Operating Officer",
      last_contacted_at: "2024-10-23",
      sentiment_score: 0.66,
    },
    owner: {
      name: "Victor Ng",
      email: "victor.ng@pulsecommerce.com",
      title: "Head of Product",
      last_contacted_at: "2024-10-24",
      sentiment_score: 0.62,
    },
    start_date: "2024-04-01",
    end_date: "2025-03-31",
    renewal_date: "2025-04-01",
    governance_cadence: "Monthly",
  },
  {
    account_id: "acct_brightops",
    account_name: "BrightOps Manufacturing",
    industry: "Manufacturing",
    region: "North America",
    segment_tag: "Scale",
    health_score: 68,
    renewal_risk_score: 46,
    total_contract_value_to_date: 900000,
    estimated_ltv: 2800000,
    customer_acquisition_cost: 210000,
    avg_monthly_revenue: 105000,
    gross_margin_pct: 58,
    created_date: "2023-03-14",
    success_criteria:
      "Improve throughput visibility and cut planning lead time by 15%.",
    sponsor: {
      name: "Kara Boyd",
      email: "kara.boyd@brightops.com",
      title: "VP Operations",
      last_contacted_at: "2024-10-19",
      sentiment_score: 0.53,
    },
    owner: {
      name: "Imran Qureshi",
      email: "imran.qureshi@brightops.com",
      title: "Director of Engineering",
      last_contacted_at: "2024-10-17",
      sentiment_score: 0.49,
    },
    start_date: "2024-03-20",
    end_date: "2025-03-19",
    renewal_date: "2025-03-20",
    governance_cadence: "Monthly",
  },
  {
    account_id: "acct_clearview",
    account_name: "Clearview SaaS",
    industry: "SaaS",
    region: "EMEA",
    segment_tag: "Scale",
    health_score: 64,
    renewal_risk_score: 52,
    total_contract_value_to_date: 820000,
    estimated_ltv: 2600000,
    customer_acquisition_cost: 240000,
    avg_monthly_revenue: 95000,
    gross_margin_pct: 60,
    created_date: "2023-10-02",
    success_criteria:
      "Improve onboarding completion and reduce trial-to-paid drop-off.",
    sponsor: {
      name: "Louise Meyer",
      email: "louise.meyer@clearview.io",
      title: "Chief Customer Officer",
      last_contacted_at: "2024-10-21",
      sentiment_score: 0.55,
    },
    owner: {
      name: "Evan Cho",
      email: "evan.cho@clearview.io",
      title: "VP Engineering",
      last_contacted_at: "2024-10-20",
      sentiment_score: 0.51,
    },
    start_date: "2024-06-01",
    end_date: "2025-05-31",
    renewal_date: "2025-06-01",
    governance_cadence: "Monthly",
  },
  {
    account_id: "acct_axiom",
    account_name: "Axiom Workforce",
    industry: "HR Tech",
    region: "North America",
    segment_tag: "Scale",
    health_score: 71,
    renewal_risk_score: 38,
    total_contract_value_to_date: 980000,
    estimated_ltv: 3000000,
    customer_acquisition_cost: 200000,
    avg_monthly_revenue: 110000,
    gross_margin_pct: 63,
    created_date: "2022-09-30",
    success_criteria:
      "Increase activation and improve enterprise rollout velocity.",
    sponsor: {
      name: "Grace Lin",
      email: "grace.lin@axiomworkforce.com",
      title: "SVP Product",
      last_contacted_at: "2024-10-29",
      sentiment_score: 0.67,
    },
    owner: {
      name: "Peter Lawson",
      email: "peter.lawson@axiomworkforce.com",
      title: "Director of Delivery",
      last_contacted_at: "2024-10-23",
      sentiment_score: 0.61,
    },
    start_date: "2024-02-20",
    end_date: "2025-02-19",
    renewal_date: "2025-02-20",
    governance_cadence: "Monthly",
  },
  {
    account_id: "acct_quarry",
    account_name: "Quarry AI Labs",
    industry: "AI/ML",
    region: "APAC",
    segment_tag: "Growth",
    health_score: 58,
    renewal_risk_score: 62,
    total_contract_value_to_date: 540000,
    estimated_ltv: 1800000,
    customer_acquisition_cost: 230000,
    avg_monthly_revenue: 70000,
    gross_margin_pct: 50,
    created_date: "2024-02-12",
    success_criteria:
      "Reduce model iteration time and improve activation for new workflows.",
    sponsor: {
      name: "Aditi Rao",
      email: "aditi.rao@quarry.ai",
      title: "Chief Technology Officer",
      last_contacted_at: "2024-10-18",
      sentiment_score: 0.44,
    },
    owner: {
      name: "Miles Decker",
      email: "miles.decker@quarry.ai",
      title: "VP Product",
      last_contacted_at: "2024-10-19",
      sentiment_score: 0.49,
    },
    start_date: "2024-06-15",
    end_date: "2025-03-31",
    renewal_date: "2025-04-01",
    governance_cadence: "Weekly",
  },
  {
    account_id: "acct_signalgrid",
    account_name: "SignalGrid Energy",
    industry: "Energy",
    region: "North America",
    segment_tag: "Growth",
    health_score: 55,
    renewal_risk_score: 70,
    total_contract_value_to_date: 480000,
    estimated_ltv: 1600000,
    customer_acquisition_cost: 250000,
    avg_monthly_revenue: 60000,
    gross_margin_pct: 48,
    created_date: "2023-12-05",
    success_criteria:
      "Reduce incident response time and improve platform reliability.",
    sponsor: {
      name: "Jordan Blake",
      email: "jordan.blake@signalgrid.com",
      title: "Chief Operations Officer",
      last_contacted_at: "2024-10-16",
      sentiment_score: 0.42,
    },
    owner: {
      name: "Tanya Feld",
      email: "tanya.feld@signalgrid.com",
      title: "Director of Engineering",
      last_contacted_at: "2024-10-15",
      sentiment_score: 0.38,
    },
    start_date: "2024-05-01",
    end_date: "2025-01-31",
    renewal_date: "2025-02-01",
    governance_cadence: "Weekly",
  },
  {
    account_id: "acct_pebble",
    account_name: "PebbleHR",
    industry: "HR Tech",
    region: "North America",
    segment_tag: "Founder-led",
    health_score: 80,
    renewal_risk_score: 30,
    total_contract_value_to_date: 300000,
    estimated_ltv: 900000,
    customer_acquisition_cost: 90000,
    avg_monthly_revenue: 35000,
    gross_margin_pct: 70,
    created_date: "2024-03-01",
    success_criteria:
      "Improve onboarding completion and first-value time by 20%.",
    sponsor: {
      name: "Harper Reed",
      email: "harper.reed@pebblehr.com",
      title: "Founder & CEO",
      last_contacted_at: "2024-10-20",
      sentiment_score: 0.75,
    },
    owner: {
      name: "Lexi Vaughn",
      email: "lexi.vaughn@pebblehr.com",
      title: "Head of Product",
      last_contacted_at: "2024-10-20",
      sentiment_score: 0.71,
    },
    start_date: "2024-06-01",
    end_date: "2024-12-31",
    renewal_date: "2025-01-01",
    governance_cadence: "Bi-weekly",
  },
  {
    account_id: "acct_tinypulse",
    account_name: "TinyPulse Studio",
    industry: "SaaS",
    region: "EMEA",
    segment_tag: "Founder-led",
    health_score: 72,
    renewal_risk_score: 42,
    total_contract_value_to_date: 200000,
    estimated_ltv: 650000,
    customer_acquisition_cost: 110000,
    avg_monthly_revenue: 28000,
    gross_margin_pct: 65,
    created_date: "2024-04-18",
    success_criteria:
      "Increase trial-to-paid conversion and streamline release cadence.",
    sponsor: {
      name: "Samir Patel",
      email: "samir.patel@tinypulse.io",
      title: "Founder & CTO",
      last_contacted_at: "2024-10-12",
      sentiment_score: 0.59,
    },
    owner: {
      name: "Isla Morgan",
      email: "isla.morgan@tinypulse.io",
      title: "Product Lead",
      last_contacted_at: "2024-10-12",
      sentiment_score: 0.56,
    },
    start_date: "2024-07-10",
    end_date: "2025-01-31",
    renewal_date: "2025-02-10",
    governance_cadence: "Monthly",
  },
  {
    account_id: "acct_forge",
    account_name: "Forge Insurance",
    industry: "Insurance",
    region: "North America",
    segment_tag: "Turnaround",
    health_score: 48,
    renewal_risk_score: 78,
    total_contract_value_to_date: 420000,
    estimated_ltv: 1200000,
    customer_acquisition_cost: 220000,
    avg_monthly_revenue: 50000,
    gross_margin_pct: 45,
    created_date: "2023-01-20",
    success_criteria:
      "Reduce release risk and stabilize incident response within 90 days.",
    sponsor: {
      name: "Teresa Wolfe",
      email: "teresa.wolfe@forgeins.com",
      title: "Chief Risk Officer",
      last_contacted_at: "2024-10-14",
      sentiment_score: 0.35,
    },
    owner: {
      name: "Cole Spencer",
      email: "cole.spencer@forgeins.com",
      title: "Director of Engineering",
      last_contacted_at: "2024-10-14",
      sentiment_score: 0.4,
    },
    start_date: "2024-05-20",
    end_date: "2024-12-31",
    renewal_date: "2025-01-20",
    governance_cadence: "Weekly",
  },
  {
    account_id: "acct_mariner",
    account_name: "Mariner Logistics",
    industry: "Logistics",
    region: "LATAM",
    segment_tag: "Turnaround",
    health_score: 45,
    renewal_risk_score: 82,
    total_contract_value_to_date: 380000,
    estimated_ltv: 1000000,
    customer_acquisition_cost: 200000,
    avg_monthly_revenue: 45000,
    gross_margin_pct: 44,
    created_date: "2023-07-07",
    success_criteria:
      "Reduce delivery incidents and stabilize service operations.",
    sponsor: {
      name: "Luciana Ortiz",
      email: "luciana.ortiz@marinerlogistics.com",
      title: "Chief Operations Officer",
      last_contacted_at: "2024-10-13",
      sentiment_score: 0.32,
    },
    owner: {
      name: "Gabriel Ruiz",
      email: "gabriel.ruiz@marinerlogistics.com",
      title: "Head of Product",
      last_contacted_at: "2024-10-13",
      sentiment_score: 0.36,
    },
    start_date: "2024-06-05",
    end_date: "2025-03-31",
    renewal_date: "2025-04-05",
    governance_cadence: "Weekly",
  },
];

const outcomeTemplates = [
  {
    name: "Increase activation rate",
    description: "Improve first-value activation across key personas.",
    unit: "%",
    baseline: 22,
    target: 30,
    direction: "up",
    source: "Product Analytics",
  },
  {
    name: "Reduce release cycle time",
    description: "Shorten commit-to-prod cycle time.",
    unit: "days",
    baseline: 28,
    target: 18,
    direction: "down",
    source: "Engineering Analytics",
  },
  {
    name: "Improve retention rate",
    description: "Lift 90-day retention for core cohort.",
    unit: "%",
    baseline: 78,
    target: 88,
    direction: "up",
    source: "Product Analytics",
  },
  {
    name: "Increase NPS",
    description: "Improve customer sentiment with top segments.",
    unit: "score",
    baseline: 32,
    target: 45,
    direction: "up",
    source: "Customer Experience",
  },
  {
    name: "Reduce incident rate",
    description: "Lower Sev-1 incidents per month.",
    unit: "incidents",
    baseline: 14,
    target: 7,
    direction: "down",
    source: "Reliability Ops",
  },
  {
    name: "Increase onboarding completion",
    description: "Improve onboarding completion across new accounts.",
    unit: "%",
    baseline: 55,
    target: 75,
    direction: "up",
    source: "Product Analytics",
  },
  {
    name: "Reduce churn rate",
    description: "Reduce monthly churn for core cohort.",
    unit: "%",
    baseline: 8,
    target: 5,
    direction: "down",
    source: "Revenue Analytics",
  },
  {
    name: "Increase expansion rate",
    description: "Grow expansion ARR in top segments.",
    unit: "%",
    baseline: 12,
    target: 20,
    direction: "up",
    source: "Revenue Analytics",
  },
];

const workstreamTemplates = {
  "Product Strategy": {
    milestone: {
      name: "Quarterly roadmap locked",
      description: "Align priorities, resourcing, and roadmap sequencing.",
      acceptance: "Executive sponsor sign-off.",
      signoff: true,
    },
  },
  "Delivery Engine": {
    milestone: {
      name: "Delivery operating model live",
      description: "Stand up rituals, staffing plan, and OKR cadence.",
      acceptance: "Operating model approved by leadership.",
      signoff: true,
    },
  },
  "Growth Experiments": {
    milestone: {
      name: "Growth experiment backlog",
      description: "Define experiment cadence and test backlog.",
      acceptance: "Backlog approved with owners.",
      signoff: true,
    },
  },
  "Platform Reliability": {
    milestone: {
      name: "Reliability baseline",
      description: "Baseline uptime, MTTR, and incident trends.",
      acceptance: "Baseline report delivered.",
      signoff: false,
    },
  },
};

const client_account = accountProfiles.map((account) => ({
  account_id: account.account_id,
  account_name: account.account_name,
  industry: account.industry,
  region: account.region,
  account_status: "Active",
  lifecycle_stage: getLifecycleStage(account),
  created_date: account.created_date,
  segment_tag: account.segment_tag,
  health_score: account.health_score,
  activation_status: getActivationStatus(account),
  renewal_risk_score: account.renewal_risk_score,
  total_contract_value_to_date: account.total_contract_value_to_date,
  estimated_ltv: account.estimated_ltv,
  customer_acquisition_cost: account.customer_acquisition_cost,
  avg_monthly_revenue: account.avg_monthly_revenue,
  gross_margin_pct: account.gross_margin_pct,
}));

const openLeads = [
  {
    lead_id: "lead_lumen",
    company_name: "Lumen Studio",
    contact_name: "Jade Martin",
    contact_email: "jade@lumen.studio",
    contact_title: "Founder",
    phone: "",
    source: "Inbound",
    stage: "Qualified",
    status: "Open",
    created_date: toDate(2024, 11, 12),
    last_contacted_at: toDate(2024, 11, 18),
    owner_team_member_id: teamMembers[0].team_member_id,
    next_step_summary: "Schedule discovery call",
    expected_value: 120000,
    segment_candidate: "Growth",
    notes: "Interested in fractional product leadership package.",
  },
  {
    lead_id: "lead_cascade",
    company_name: "Cascade Health",
    contact_name: "Rina Patel",
    contact_email: "rina@cascade.health",
    contact_title: "COO",
    phone: "",
    source: "Referral",
    stage: "Proposal",
    status: "Open",
    created_date: toDate(2024, 10, 28),
    last_contacted_at: toDate(2024, 11, 8),
    owner_team_member_id: teamMembers[1].team_member_id,
    next_step_summary: "Send activation plan proposal",
    expected_value: 180000,
    segment_candidate: "Strategic",
    notes: "Asked for onboarding + retention playbook.",
  },
  {
    lead_id: "lead_summitworks",
    company_name: "Summit Works",
    contact_name: "Luis Romero",
    contact_email: "luis@summitworks.io",
    contact_title: "CEO",
    phone: "",
    source: "Outbound",
    stage: "Negotiation",
    status: "Open",
    created_date: toDate(2024, 10, 5),
    last_contacted_at: toDate(2024, 11, 2),
    owner_team_member_id: teamMembers[2].team_member_id,
    next_step_summary: "Finalize scope and pricing",
    expected_value: 240000,
    segment_candidate: "Scale",
    notes: "Wants KPI-driven activation milestones.",
  },
  {
    lead_id: "lead_foundry",
    company_name: "Foundry Labs",
    contact_name: "Maya Chen",
    contact_email: "maya@foundrylabs.co",
    contact_title: "Head of Product",
    phone: "",
    source: "Inbound",
    stage: "Lead",
    status: "Open",
    created_date: toDate(2024, 11, 20),
    last_contacted_at: toDate(2024, 11, 22),
    owner_team_member_id: teamMembers[3].team_member_id,
    next_step_summary: "Qualify goals and timeline",
    expected_value: 90000,
    segment_candidate: "Growth",
    notes: "Early-stage productized service team.",
  },
];

const lead = [
  ...accountProfiles.map((account, index) => ({
    lead_id: `lead_${account.account_id}`,
    company_name: account.account_name,
    contact_name: account.sponsor.name,
    contact_email: account.sponsor.email,
    contact_title: account.sponsor.title,
    phone: "",
    source: index % 2 === 0 ? "Referral" : "Inbound",
    stage: "Won",
    status: "Converted",
    created_date: account.created_date,
    last_contacted_at: account.sponsor.last_contacted_at,
    owner_team_member_id: teamMembers[index % teamMembers.length].team_member_id,
    next_step_summary: "Kick off activation plan",
    expected_value: account.total_contract_value_to_date,
    segment_candidate: account.segment_tag,
    notes: "Converted to customer.",
  })),
  ...openLeads,
];

const deal = [
  ...accountProfiles.map((account) => ({
    deal_id: `deal_${account.account_id}`,
    lead_id: `lead_${account.account_id}`,
    account_id: account.account_id,
    deal_name: `${account.account_name} Retainer`,
    stage: "Closed Won",
    status: "Won",
    amount: account.total_contract_value_to_date,
    probability: 0.9,
    expected_close_date: account.start_date,
    closed_date: account.start_date,
    next_step_summary: "Finalize onboarding plan",
  })),
  ...openLeads.map((entry, index) => ({
    deal_id: `deal_${entry.lead_id}`,
    lead_id: entry.lead_id,
    account_id: "",
    deal_name: `${entry.company_name} Activation`,
    stage: entry.stage === "Proposal" ? "Proposal" : entry.stage === "Negotiation" ? "Negotiation" : "Discovery",
    status: "Open",
    amount: entry.expected_value,
    probability: 0.35 + (index * 0.1),
    expected_close_date: toDate(2024, 12, 15 + index),
    closed_date: "",
    next_step_summary: entry.next_step_summary,
  })),
];

const stakeholder = [];
const consulting_engagement = [];
const statement_of_work = [];
const workstream = [];
const milestone = [];
const deliverable = [];
const decision = [];
const risk_issue = [];
const change_request = [];
const outcome = [];
const kpi_metric = [];
const kpi_snapshot = [];
const task = [];
const meeting = [];
const invoice = [];
const payment = [];

accountProfiles.forEach((account, index) => {
  const execId = `stake_${account.account_id}_exec`;
  const ownerId = `stake_${account.account_id}_owner`;
  stakeholder.push(
    {
      stakeholder_id: execId,
      account_id: account.account_id,
      name: account.sponsor.name,
      email: account.sponsor.email,
      title: account.sponsor.title,
      role_type: "Executive Sponsor",
      influence_level: "High",
      is_exec_sponsor: true,
      is_day_to_day_owner: false,
      last_contacted_at: account.sponsor.last_contacted_at,
      sentiment_score: account.sponsor.sentiment_score,
    },
    {
      stakeholder_id: ownerId,
      account_id: account.account_id,
      name: account.owner.name,
      email: account.owner.email,
      title: account.owner.title,
      role_type: "Delivery Owner",
      influence_level: "Medium",
      is_exec_sponsor: false,
      is_day_to_day_owner: true,
      last_contacted_at: account.owner.last_contacted_at,
      sentiment_score: account.owner.sentiment_score,
    }
  );

  const engagementId = `eng_${account.account_id}`;
  consulting_engagement.push({
    engagement_id: engagementId,
    account_id: account.account_id,
    engagement_name: `${account.account_name} Fractional Product & Engineering Leadership`,
    status: "Active",
    start_date: account.start_date,
    end_date: account.end_date,
    engagement_value: Math.round(account.avg_monthly_revenue * 12),
    billing_model: "Monthly Retainer",
    renewal_date: account.renewal_date,
    success_criteria_summary: account.success_criteria,
    executive_sponsor_stakeholder_id: execId,
    engagement_lead_team_member_id: teamMembers[index % teamMembers.length].team_member_id,
    governance_cadence: account.governance_cadence,
    engagement_health_score: account.health_score,
  });

  statement_of_work.push({
    sow_id: `sow_${account.account_id}`,
    engagement_id: engagementId,
    effective_date: account.start_date,
    scope_summary:
      "Fractional product + engineering leadership, operating model, and roadmap execution.",
    assumptions:
      "Client provides access to product analytics, engineering delivery, and financial data.",
    out_of_scope_summary: "Full-time hiring, daily QA execution, and internal recruiting.",
    acceptance_process: "Monthly executive steering review sign-off.",
    version: "v1.0",
    status: "Active",
  });

  const workstreamNames =
    account.segment_tag === "Strategic" || account.segment_tag === "Scale"
      ? ["Product Strategy", "Delivery Engine"]
      : ["Growth Experiments", "Platform Reliability"];

  workstreamNames.forEach((name, wsIndex) => {
    const wsId = `ws_${account.account_id}_${wsIndex + 1}`;
    workstream.push({
      workstream_id: wsId,
      engagement_id: engagementId,
      name,
      owner_team_member_id:
        teamMembers[(index + wsIndex) % teamMembers.length].team_member_id,
      status:
        account.renewal_risk_score >= 70 && wsIndex === 1 ? "At Risk" : "On Track",
      priority: wsIndex === 0 ? "High" : "Medium",
    });

    const milestoneTemplate = workstreamTemplates[name].milestone;
    const milestoneId = `ms_${account.account_id}_${wsIndex + 1}`;
    const base = addMonths(2024, 6, index + wsIndex);
    const planned = toDate(base.year, base.month, 5);
    const due = toDate(base.year, base.month, 18);
    const completed = index % 3 === 0;
    const isAtRisk = account.renewal_risk_score >= 70 && wsIndex === 1;
    const status = completed ? "Completed" : isAtRisk ? "At Risk" : "In Progress";

    milestone.push({
      milestone_id: milestoneId,
      workstream_id: wsId,
      name: milestoneTemplate.name,
      description: milestoneTemplate.description,
      status,
      planned_date: planned,
      due_date: due,
      completed_date: completed ? toDate(base.year, base.month, 16) : "",
      acceptance_criteria: milestoneTemplate.acceptance,
      owner_team_member_id:
        teamMembers[(index + wsIndex) % teamMembers.length].team_member_id,
      client_signoff_required_flag: milestoneTemplate.signoff,
      client_signoff_date: completed ? toDate(base.year, base.month, 20) : "",
      confidence_level: isAtRisk ? "Low" : completed ? "High" : "Medium",
      blocker_summary: isAtRisk ? "Leadership bandwidth constraints." : "",
    });

    if (completed) {
      deliverable.push({
        deliverable_id: `del_${account.account_id}_${wsIndex + 1}`,
        milestone_id: milestoneId,
        deliverable_type: "Report",
        title: `${milestoneTemplate.name} Readout`,
        status: "Approved",
        submitted_at: toDate(base.year, base.month, 16),
        approved_at: toDate(base.year, base.month, 20),
        version: "v1",
        feedback_summary: "Clear priorities with next-step decisions.",
        quality_score: 0.9,
        evidence_link: "https://docs.example.com/exec-readout",
      });
    }
  });

  const outcomeTemplate = outcomeTemplates[index % outcomeTemplates.length];
  const outcomeId = `out_${account.account_id}`;
  outcome.push({
    outcome_id: outcomeId,
    engagement_id: engagementId,
    name: outcomeTemplate.name,
    description: outcomeTemplate.description,
    status: account.renewal_risk_score >= 70 ? "At Risk" : "On Track",
    target_date: account.renewal_date,
    value_hypothesis: `${outcomeTemplate.name} will support the next growth milestone.`,
    baseline_summary: `Baseline: ${outcomeTemplate.baseline}${outcomeTemplate.unit}.`,
    target_summary: `Target: ${outcomeTemplate.target}${outcomeTemplate.unit}.`,
    owner_stakeholder_id: ownerId,
  });

  const metricId = `metric_${account.account_id}`;
  kpi_metric.push({
    metric_id: metricId,
    outcome_id: outcomeId,
    name: outcomeTemplate.name,
    definition: outcomeTemplate.description,
    unit: outcomeTemplate.unit,
    data_source_system: outcomeTemplate.source,
    baseline_value: outcomeTemplate.baseline,
    target_value: outcomeTemplate.target,
    measurement_cadence: "Monthly",
  });

  const progressFactor = 0.35 + (index % 4) * 0.15;
  const delta = outcomeTemplate.target - outcomeTemplate.baseline;
  const snapshotValue =
    outcomeTemplate.direction === "up"
      ? outcomeTemplate.baseline + delta * progressFactor
      : outcomeTemplate.baseline - Math.abs(delta) * progressFactor;
  const snapshotDate = addMonths(2024, 9, index % 3);
  kpi_snapshot.push({
    snapshot_id: `snap_${account.account_id}`,
    metric_id: metricId,
    observed_at: toDate(snapshotDate.year, snapshotDate.month, 28),
    value: Number(snapshotValue.toFixed(1)),
    confidence_note: "Latest reporting cycle.",
    evidence_link: "https://bi.example.com/metric", 
  });

  task.push(
    {
      task_id: `task_${account.account_id}_1`,
      engagement_id: engagementId,
      name: "Finalize roadmap decisions",
      description: "Lock Q4 roadmap priorities with exec sponsor.",
      status: account.renewal_risk_score >= 70 ? "At Risk" : "In Progress",
      due_date: toDate(2024, 11, 12),
      owner_team_member_id: teamMembers[index % teamMembers.length].team_member_id,
      priority: "High",
      notes: "Awaiting leadership availability.",
    },
    {
      task_id: `task_${account.account_id}_2`,
      engagement_id: engagementId,
      name: "Update KPI reporting cadence",
      description: "Confirm monthly reporting owners and automation.",
      status: "Not Started",
      due_date: toDate(2024, 11, 22),
      owner_team_member_id:
        teamMembers[(index + 1) % teamMembers.length].team_member_id,
      priority: "Medium",
      notes: "Requires data instrumentation review.",
    }
  );

  meeting.push({
    meeting_id: `mtg_${account.account_id}`,
    engagement_id: engagementId,
    meeting_type: "Executive Steering",
    scheduled_at: toDate(2024, 11, 15),
    occurred_at: toDate(2024, 11, 15),
    owner_team_member_id: teamMembers[index % teamMembers.length].team_member_id,
    attendees_count: 8 + (index % 4),
    notes_link: "https://docs.example.com/exec-steering",
    action_items_count: 3 + (index % 3),
    sentiment_score: account.sponsor.sentiment_score,
  });

  if (account.renewal_risk_score >= 55) {
    risk_issue.push({
      risk_issue_id: `risk_${account.account_id}`,
      engagement_id: engagementId,
      type: "Risk",
      status: "Open",
      severity: account.renewal_risk_score >= 70 ? "High" : "Medium",
      likelihood: account.renewal_risk_score >= 70 ? "High" : "Medium",
      opened_at: toDate(2024, 10, 10),
      target_resolution_date: toDate(2024, 11, 20),
      resolved_at: "",
      owner_team_member_id: teamMembers[index % teamMembers.length].team_member_id,
      mitigation_plan: "Escalate staffing plan and unblock decision gates.",
      impact_summary: "Delivery timelines at risk without leadership alignment.",
    });
  }

  if (account.renewal_risk_score >= 70) {
    change_request.push({
      change_request_id: `cr_${account.account_id}`,
      sow_id: `sow_${account.account_id}`,
      requested_at: toDate(2024, 10, 22),
      requested_by_stakeholder_id: execId,
      description: "Add interim leadership coverage during org transition.",
      impact_on_scope: "Adds leadership coaching and delivery oversight.",
      impact_on_timeline: "+2 weeks",
      impact_on_fees: "+120k",
      status: "Proposed",
      approved_at: "",
    });
  }

  if (index % 4 === 0) {
    decision.push({
      decision_id: `dec_${account.account_id}`,
      engagement_id: engagementId,
      decision_date: toDate(2024, 10, 30),
      decision_title: "Approve Q4 product focus",
      decision_summary: "Sponsor approved new roadmap priorities and staffing plan.",
      decided_by_stakeholder_id: execId,
      decision_type: "Scope",
      impact_summary: "Capacity shifted toward retention initiatives.",
      evidence_link: "https://docs.example.com/steerco-decision",
    });
  }

  const invoiceId = `inv_${account.account_id}`;
  const isOverdue = account.renewal_risk_score >= 70;
  invoice.push({
    invoice_id: invoiceId,
    account_id: account.account_id,
    engagement_id: engagementId,
    invoice_date: toDate(2024, 10, 1),
    due_date: toDate(2024, 10, 31),
    amount_total: Math.round(account.avg_monthly_revenue),
    status: isOverdue ? "Overdue" : "Paid",
    days_past_due: isOverdue ? 18 + (index % 7) : 0,
  });

  if (!isOverdue) {
    payment.push({
      payment_id: `pay_${account.account_id}`,
      invoice_id: invoiceId,
      account_id: account.account_id,
      paid_at: toDate(2024, 10, 28),
      amount: Math.round(account.avg_monthly_revenue),
      status: "Succeeded",
      failure_reason: "",
    });
  }
});

export const seedInstances = {
  client_account,
  lead,
  deal,
  stakeholder,
  team_member: teamMembers,
  consulting_engagement,
  statement_of_work,
  workstream,
  milestone,
  deliverable,
  decision,
  risk_issue,
  change_request,
  outcome,
  kpi_metric,
  kpi_snapshot,
  task,
  meeting,
  invoice,
  payment,
};

let linkCounter = 1;
const seedLinks = [];
const addLink = (link_type, from_id, to_id) => {
  seedLinks.push({
    id: `lnk_${String(linkCounter).padStart(3, "0")}`,
    link_type,
    from_id,
    to_id,
  });
  linkCounter += 1;
};

accountProfiles.forEach((account) => {
  const execId = `stake_${account.account_id}_exec`;
  const ownerId = `stake_${account.account_id}_owner`;
  const engagementId = `eng_${account.account_id}`;
  const outcomeId = `out_${account.account_id}`;
  const metricId = `metric_${account.account_id}`;
  const snapshotId = `snap_${account.account_id}`;
  const leadId = `lead_${account.account_id}`;
  const dealId = `deal_${account.account_id}`;

  addLink("account_has_stakeholder", account.account_id, execId);
  addLink("account_has_stakeholder", account.account_id, ownerId);
  addLink("lead_converts_to_account", leadId, account.account_id);
  addLink("lead_has_deal", leadId, dealId);
  addLink("deal_converts_to_account", dealId, account.account_id);
  addLink("account_has_engagement", account.account_id, engagementId);
  addLink("outcome_measured_by_metric", outcomeId, metricId);
  addLink("metric_has_snapshot", metricId, snapshotId);

  addLink("outcome_has_task", outcomeId, `task_${account.account_id}_1`);
  addLink("outcome_has_task", outcomeId, `task_${account.account_id}_2`);

  if (account.renewal_risk_score >= 55) {
    addLink("engagement_has_risk_issue", engagementId, `risk_${account.account_id}`);
  }

  const wsNames =
    account.segment_tag === "Strategic" || account.segment_tag === "Scale"
      ? ["Product Strategy", "Delivery Engine"]
      : ["Growth Experiments", "Platform Reliability"];

  wsNames.forEach((_, wsIndex) => {
    const wsId = `ws_${account.account_id}_${wsIndex + 1}`;
    const milestoneId = `ms_${account.account_id}_${wsIndex + 1}`;
    addLink("engagement_has_workstream", engagementId, wsId);
    addLink("workstream_has_milestone", wsId, milestoneId);
    addLink("milestone_supports_outcome", milestoneId, outcomeId);

    const deliverableId = `del_${account.account_id}_${wsIndex + 1}`;
    const hasDeliverable = deliverable.some(
      (item) => item.deliverable_id === deliverableId
    );
    if (hasDeliverable) {
      addLink("milestone_produces_deliverable", milestoneId, deliverableId);
      addLink("deliverable_supports_outcome", deliverableId, outcomeId);
    }
  });
});

openLeads.forEach((leadItem) => {
  addLink("lead_has_deal", leadItem.lead_id, `deal_${leadItem.lead_id}`);
});

export { seedLinks };
