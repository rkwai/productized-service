# Worklog

## 2026-02-03
- Outcome: Hid the empty-detail tip behind a hover tooltip trigger.
- Why: Reduce visual noise while keeping help discoverable.
- Key changes (files/areas): `src/App.jsx`, `src/index.css`.
- Tests: `npm test`.
- Metrics / instrumentation: None.
- Follow-ups: None.

## 2026-02-03
- Outcome: Moved object detail cards inline under selected table rows instead of a right-hand panel.
- Why: ICP expects row expansion for quick context without shifting focus.
- Key changes (files/areas): `src/App.jsx`, `src/index.css`, `docs/USER_GUIDE.md`.
- Tests: `npm test`.
- Metrics / instrumentation: None.
- Follow-ups: Consider reducing hover cursor for non-clickable summary tables.

## 2026-02-03
- Outcome: Added explicit workspace data controls to reload seed data or start with empty records.
- Why: ICP needs a fast way to switch between demo data and real data entry.
- Key changes (files/areas): `src/App.jsx`, `docs/USER_GUIDE.md`.
- Tests: `npm test`.
- Metrics / instrumentation: None.
- Follow-ups: Add a small banner when running with empty data to guide imports.

## 2026-02-03
- Outcome: Added lead attention filters and quick-add defaults to reduce capture friction.
- Why: ICP needs to find missing next steps or stale leads immediately and avoid blank records.
- Key changes (files/areas): `src/App.jsx`, `docs/USER_GUIDE.md`.
- Tests: `npm test`.
- Metrics / instrumentation: None.
- Follow-ups: Add a lead attention summary card with one-click filter chips.

## 2026-02-03
- Outcome: Clarified marketing focus as an action by showing the latest focus in Home’s ROI section.
- Why: Make the decision visible without treating it as a workflow.
- Key changes (files/areas): `src/App.jsx`, `docs/USER_GUIDE.md`.
- Tests: `npm test`.
- Metrics / instrumentation: None.
- Follow-ups: Consider a dedicated marketing focus history view if requested.

## 2026-02-03
- Outcome: Auto-created onboarding engagement/workstreams/milestones when converting a deal to a customer.
- Why: Ensure activation milestones appear immediately after conversion without manual setup.
- Key changes (files/areas): `src/App.jsx`, `docs/USER_GUIDE.md`.
- Tests: `npm test`.
- Metrics / instrumentation: None.
- Follow-ups: Add a configurable onboarding template in config.

## 2026-02-03
- Outcome: Added a marketing focus log action on the segment profitability table.
- Why: Make the “take action on most valuable segment” step explicit and traceable.
- Key changes (files/areas): `src/App.jsx`, `docs/USER_GUIDE.md`.
- Tests: `npm test`.
- Metrics / instrumentation: None.
- Follow-ups: Add a formal action type for marketing focus in config.

## 2026-02-03
- Outcome: Added customer quick actions for activation recovery, activation drive, retention plans, and data gap cleanup in the Customers table.
- Why: Activation and retention moves should be one click from the portfolio view, not hidden in action tabs.
- Key changes (files/areas): `src/App.jsx`, `docs/USER_GUIDE.md`.
- Tests: `npm test`.
- Metrics / instrumentation: None.
- Follow-ups: Add activation kickoff creation (engagement + milestones) when converting a deal.

## 2026-02-03
- Outcome: Added a deal → customer conversion action with auto-populated customer fields and linked records.
- Why: Reduce friction in onboarding by letting owners convert a won deal into an account from the pipeline view.
- Key changes (files/areas): `src/App.jsx`, `docs/USER_GUIDE.md`.
- Tests: `npm test`.
- Metrics / instrumentation: None.
- Follow-ups: Auto-create onboarding milestones/workstreams on conversion.

## 2026-02-03
- Outcome: Added a lead → deal conversion action with auto-filled deal fields and quick “view deal” buttons from the lead pipeline.
- Why: ICP needs to turn qualified leads into opportunities without detouring to Settings.
- Key changes (files/areas): `src/App.jsx`, `docs/USER_GUIDE.md`.
- Tests: `npm test`.
- Metrics / instrumentation: None.
- Follow-ups: Add deal → customer conversion and activation kickoff actions.

## 2026-02-03
- Outcome: Highlighted lead capture hygiene with KPIs, capture-gap badges, warn-row styling, and a lead quick-edit panel; added stage/status pills for leads and deals.
- Why: As an ICP, I needed to immediately see which leads were incomplete or stale before worrying about pipeline value.
- Key changes (files/areas): `src/App.jsx`, `src/index.css`, `docs/USER_GUIDE.md`.
- Tests: `npm test`.
- Metrics / instrumentation: None.
- Follow-ups: Add lead capture filters (gaps/stale) and a one-click convert-to-deal action.

## 2026-02-03
- Outcome: Added quick capture CTAs and page-level add/import actions for leads, deals, and customers.
- Why: As an ICP, the app felt dense with no obvious “start here”; quick capture makes the first action obvious.
- Key changes (files/areas): `src/App.jsx`, `docs/USER_GUIDE.md`.
- Tests: Not run (UI copy/CTA changes only).
- Metrics / instrumentation: None.
- Follow-ups: Consider onboarding checklist and empty-state guidance for first-time users.

## 2026-02-03
- Outcome: Updated the E2E happy-path test to align with the renamed navigation and KPI labels.
- Why: UI copy changes broke the Playwright selector expectations.
- Key changes (files/areas): `tests/happy-path.spec.js`.
- Tests: `npm run test:e2e`.
- Metrics / instrumentation: None.
- Follow-ups: None.

## 2026-02-03
- Outcome: Tuned the decision-engine scoring and mapped recommendations to workflow actions.
- Why: The “brain” now produces actionable workflows with buttons in Home and Next Steps.
- Key changes (files/areas): `src/lib/decision-engine.js`, `src/App.jsx`, `public/docs/ontology-map.json`, `docs/ontology-map.json`, `src/data/initial-data.js`, `tests/unit/decision-engine.test.mjs`, `docs/USER_GUIDE.md`, `docs/ARCHITECTURE.md`, `docs/agent/backlog.md`.
- Tests: `npm test`.
- Metrics / instrumentation: None.
- Follow-ups: Review action-type naming and consider adding workflow presets per persona.

## 2026-02-03
- Outcome: Implemented the decision engine to rank next steps and surface a priority focus for owners.
- Why: The internal launch needs a “brain” that highlights the most valuable action across leads, deals, and customers.
- Key changes (files/areas): `src/lib/decision-engine.js`, `src/App.jsx`, `tests/unit/decision-engine.test.mjs`, `docs/USER_GUIDE.md`, `docs/ARCHITECTURE.md`.
- Tests: `npm test`.
- Metrics / instrumentation: None (local-only).
- Follow-ups: Tune scoring weights and wire suggested actions to actual workflows when ready.

## 2026-02-03
- Outcome: Refactored the Customers (portfolio) view to surface lifecycle stage and activation status alongside health and ROI.
- Why: Align the account-focused UX with the lead → activation lifecycle and make activation progress visible.
- Key changes (files/areas): `src/App.jsx`, `docs/USER_GUIDE.md`, `docs/agent/backlog.md`.
- Tests: `npm test`.
- Metrics / instrumentation: None.
- Follow-ups: Consider adding activation-stage metrics to the executive summary once the decision engine lands.

## 2026-02-03
- Outcome: Locked the v1 data model and analytics definitions for the internal launch.
- Why: Make the schema and KPI formulas explicit before finishing the “brain” and UX polish.
- Key changes (files/areas): `docs/data-model.md`, `docs/agent/metrics.md`, `public/docs/ontology-map.json`, `docs/ontology-map.json`, `src/data/initial-data.js`, `docs/agent/backlog.md`.
- Tests: `npm test`.
- Metrics / instrumentation: Definitions documented; no new instrumentation.
- Follow-ups: Keep ontology config and fallback `initial-data` in sync as the schema evolves.

## 2026-02-03
- Outcome: Updated the unit test runner to execute every file in `tests/unit`.
- Why: `node tests/unit/*.mjs` only ran the first file, hiding later test failures.
- Key changes (files/areas): `tests/unit/run.mjs`, `package.json`.
- Tests: `npm test`.
- Metrics / instrumentation: None.
- Follow-ups: None.

## 2026-02-03
- Outcome: Added lead/deal import flow in Settings with CSV/JSON parsing, validation warnings, and link creation.
- Why: Enable fast data ingestion for lead/deal pipelines ahead of the internal launch.
- Key changes (files/areas): `src/App.jsx`, `src/lib/importer.js`, `docs/USER_GUIDE.md`, `tests/unit/importer.test.mjs`.
- Tests: `npm run test`, `node tests/unit/importer.test.mjs`.
- Metrics / instrumentation: None.
- Follow-ups: Ensure the unit test runner executes all test files; consider import preview/mapping UX.

## 2026-02-03
- Outcome: Added Leads and Deals pages with filters, KPIs, and object details.
- Why: Surface the lead/deal lifecycle in the UI to match the new data model.
- Key changes (files/areas): `src/App.jsx`, `src/lib/routing.mjs`, `docs/USER_GUIDE.md`.
- Tests: `npm run test`.
- Metrics / instrumentation: None.
- Follow-ups: Add lead/deal import flow and next-step automation.

## 2026-02-03
- Outcome: Refactored ontology config + seed data to add lead/deal objects and lifecycle fields while keeping legacy IDs intact.
- Why: Align the data model with lead → activation → retention without breaking the current UI.
- Key changes (files/areas): `public/docs/ontology-map.json`, `docs/ontology-map.json`, `src/data/initial-data.js`, `src/data/seed-data.js`, `docs/agent/backlog.md`, `docs/agent/decision-log.md`.
- Tests: `npm run test`.
- Metrics / instrumentation: None.
- Follow-ups: Surface leads/deals in the UI and define the import format.

## 2026-02-03
- Outcome: Refactored UI copy/navigation to align with the productized-service lead → activation → retention focus.
- Why: Make the existing design consistent with the internal-launch goals before deeper data model changes.
- Key changes (files/areas): `src/App.jsx`, `src/lib/routing.mjs`, `src/lib/executive-brief.js`, `docs/USER_GUIDE.md`.
- Tests: `npm run test`.
- Metrics / instrumentation: None.
- Follow-ups: Refactor underlying data model + seed data to add lead lifecycle objects and import format.
- Commit: `16c05e4`.

## 2026-02-03
- Outcome: Updated the internal launch plan to make refactoring the existing code/design the first step.
- Why: Align the current UI/data model with the new lead lifecycle and activation goals.
- Key changes (files/areas): `docs/PLAN.md`, `docs/agent/backlog.md`, `docs/agent/decision-log.md`.
- Tests: `npm run test`.
- Metrics / instrumentation: None.
- Follow-ups: Identify the exact components/data structures to refactor.

## 2026-02-03
- Outcome: Updated north-star review and strategy/roadmap docs to reflect the internal-launch focus, personas, and dates.
- Why: Lock down the initiative details and align planning artifacts with the Feb 10 launch.
- Key changes (files/areas): `docs/agent/north-star-review-2026-02-03.md`, `docs/agent/start.md`, `docs/agent/strategy.md`, `docs/agent/roadmap.md`, `docs/agent/backlog.md`, `docs/agent/decision-log.md`, `README.md`.
- Tests: `npm run test`.
- Metrics / instrumentation: None.
- Follow-ups: Confirm secondary KPIs and lock lifecycle schema + import format.

## 2026-02-03
- Outcome: Added an internal-launch sprint plan with scope, non-goals, and acceptance criteria for the Feb 10 deadline.
- Why: Capture the 1-week launch plan and make gaps/unknowns explicit.
- Key changes (files/areas): `docs/PLAN.md`, `docs/agent/backlog.md`, `docs/agent/decision-log.md`.
- Tests: `npm run test`.
- Metrics / instrumentation: None.
- Follow-ups: Confirm import format, lifecycle data model, and milestone dates.

## 2026-02-03
- Outcome: Completed a North Star review and recorded gaps, plus refreshed strategy/roadmap/backlog context.
- Why: Capture current product direction and make missing inputs explicit for planning.
- Key changes (files/areas): `docs/agent/north-star-review-2026-02-03.md`, `docs/agent/strategy.md`, `docs/agent/roadmap.md`, `docs/agent/backlog.md`, `docs/agent/decision-log.md`.
- Tests: `npm run test`.
- Metrics / instrumentation: None.
- Follow-ups: Provide initiative summary, phase, resourcing, and milestone dates to refine the review.

## 2026-02-03
- Outcome: Removed the repo-local `north-star-review` skill copy to avoid duplication with the global install.
- Why: Keep only the global `~/.codex/skills/north-star-review` version as requested.
- Key changes (files/areas): `.codex/skills/north-star-review/` (deleted).
- Tests: Not run (skill removal only).
- Metrics / instrumentation: None.
- Follow-ups: None.

## 2026-02-03
- Outcome: Synced `north-star-review` into the global Codex skills directory for cross-repo access.
- Why: Make the skill available in all repos without packaging.
- Key changes (files/areas): `~/.codex/skills/north-star-review/`.
- Tests: Not run (file copy only).
- Metrics / instrumentation: None.
- Follow-ups: Restart Codex to pick up the new global skill if needed.

## 2026-02-03
- Outcome: Added the new north-star-review skill definition for initiative reviews.
- Why: Provide a structured 12-question North Star review workflow for exec alignment.
- Key changes (files/areas): `.codex/skills/north-star-review/SKILL.md`.
- Tests: Not run (skill content only).
- Metrics / instrumentation: None.
- Follow-ups: Package the skill if you want a distributable `.skill` artifact.

## 2026-02-03
- Outcome: Added an executive value brief on Home that summarizes ROI, exposure, and delivery focus with weekly decisions.
- Why: Make the value proposition clearer for executives with a board-ready narrative.
- Key changes (files/areas): `src/App.jsx`, `src/lib/executive-brief.js`, `src/index.css`, `tests/unit/executive-brief.test.mjs`.
- Tests: `npm run test:unit`.
- Metrics / instrumentation: None added.
- Follow-ups: Consider adding copy/export for the executive brief and usage tracking.

## YYYY-MM-DD
- Outcome:
- Why:
- Key changes (files/areas):
- Tests:
- Metrics / instrumentation:
- Follow-ups:
