# North Star Review (2026-02-03)

## Scope
- In scope: Internal-launch product direction for a local-first productized-service cockpit (lead pipeline, onboarding/activation, profitability insights).
- Out of scope: Backend/production integrations, new runtime dependencies, pricing/GTMS.

## Inputs received
- Initiative: internal-launch (Owner: Rick).
- Summary: Help a productized-service business owner capture/convert leads, onboard/activate customers, and surface the most profitable segment via LTV:CAC insights.
- Phase focus: Strategy (agile, but strategy is primary focus for the next 4–6 weeks).
- Constraints: Launch by 2026-02-10; local-only, existing stack; no compliance/security constraints; unlimited AI agents.

## Evidence sources
- `docs/agent/start.md`
- `README.md`
- `docs/PLAN.md`

## Executive summary
- The initiative is now focused on a local-first cockpit for productized-service business owners to manage lead conversion, customer activation, and profitability insights.
- Feb 10 internal launch is committed, with beta by March 17 and paid launch by June 30.
- Critical path is centered on locking the data model, building the decision engine ("brain"), and clarifying the UI flows.

## Scorecard (12 questions)
1) Target audience
- Current answer: Business owner of a productized service (1–10 employees) focused on lead conversion, onboarding/activation, retention, and LTV:CAC optimization.
- Status: Answered
- Gap: None noted.
- Impact if missing: Diluted UX prioritization and GTM messaging.

2) Value proposition
- Current answer: Identify the most profitable segment using LTV:CAC to guide focus and marketing.
- Status: Partial
- Gap: Confirm secondary KPIs tied to revenue/retention (e.g., activation rate, retention rate).
- Impact if missing: Harder to justify investment and measure impact.

3) Resources committed
- Current answer: Rick + AI agents across business/market analysis, design/FE, and product/BE roles.
- Status: Answered
- Gap: None noted.
- Impact if missing: Schedule risk and scope thrash.

4) When results expected
- Current answer: Internal launch by 2026-02-10; beta by 2026-03-17; paid public launch by 2026-06-30.
- Status: Answered
- Gap: None noted.
- Impact if missing: No aligned delivery expectations.

5) What exactly are we building
- Current answer: Lead capture + conversion flow; onboarding/activation milestones; analytics with LTV:CAC + segment focus; local data import; executive UI that highlights the single most important priority.
- Status: Answered
- Gap: None noted.
- Impact if missing: Ambiguous scope boundaries.

6) How will we bring this to life
- Current answer: Lead lifecycle flow (Lead → Qualified → Proposal → Won → Onboarded → Activated → Retained) with next steps and milestones; analytics view for LTV:CAC and segment profitability.
- Status: Partial
- Gap: Confirm explicit data flows and object schema for Lead, Company, Contact, Deal, Milestone, Activation Task, Health Score, LTV, CAC.
- Impact if missing: Design and engineering divergence.

7) When can we deliver
- Current answer: Feb 3–10 sprint plan with daily milestones; no external dependencies.
- Status: Answered
- Gap: None noted.
- Impact if missing: Unreliable delivery forecast.

8) Who do we need on our team
- Current answer: Business-owner/market-analyst, designer/FE, product-manager/BE (all covered by Rick + AI agents).
- Status: Answered
- Gap: None noted.
- Impact if missing: Hidden dependencies delay execution.

9) Critical path
- Current answer: Lock data model → build decision engine ("brain") → finalize intuitive UI for capture/import + insights.
- Status: Answered
- Gap: None noted.
- Impact if missing: Late-stage blockers and rework.

10) Sprint goals
- Current answer: Lock data model, build the brain, lock major flows/components.
- Status: Answered
- Gap: None noted.
- Impact if missing: Low velocity and misaligned effort.

11) Risks
- Current answer: None identified; no external dependencies.
- Status: Answered
- Gap: Consider tracking scope/time risk as an internal signal.
- Impact if missing: Surprises late in delivery.

12) Are we on track
- Current answer: One milestone per day, 3 days for iteration, 1 day for final polish; if a milestone slips, reduce scope.
- Status: Answered
- Gap: None noted.
- Impact if missing: Misalignment and late corrections.

## Top risks + mitigations
- Scope creep within a 1-week window -> Mitigate with strict scope triage and daily milestone checks.
- Data model churn -> Mitigate by locking core objects early and deferring optional fields.

## Decisions needed (suggested owners)
- Confirm secondary KPIs beyond LTV:CAC (Owner: Rick).
- Lock lead lifecycle schema and import format (Owner: Rick).

## Next 7 days action plan
- Lock lead lifecycle schema and import format.
- Implement the decision engine for next steps and priority focus.
- Ship the core capture → activation → insights flow with a polished executive summary.
