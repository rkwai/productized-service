# Decision Log

## 2026-02-03 — Surface lead capture hygiene signals in the pipeline
- Decision: Added capture-gap KPIs/badges, stage/status pills, and a lead quick-edit panel to make incomplete leads visible and fixable in-line.
- Alternatives considered: Keep lead table minimal and rely on the detail panel for data issues; add a separate “lead hygiene” page.
- Rationale: ICP needs a fast signal for missing lead data before working the pipeline.
- Implications: Lead pipeline is denser; we may need filters for gaps/stale status.
- Follow-ups: Add lead capture filters and one-click lead → deal conversion.

## 2026-02-03 — Add quick-capture CTAs for ICP onboarding
- Decision: Added a Quick capture panel on Home plus Add/Import actions on Leads/Deals/Customers pages.
- Alternatives considered: Leave creation only in Settings or rely on import-only flows.
- Rationale: Reduce the “where do I start?” friction for first-time owners.
- Implications: Home page gets more CTAs; keep buttons aligned with future onboarding.
- Follow-ups: Add a lightweight onboarding checklist and empty-state guidance.

## 2026-02-03 — Map decision-engine recommendations to workflow actions
- Decision: Mapped lead/deal/customer recommendations to explicit action types and exposed “Run workflow” buttons in the UI.
- Alternatives considered: Keep recommendations read-only; hard-code actions without config entries.
- Rationale: Makes the decision engine immediately actionable without adding new dependencies.
- Implications: Action types must stay synchronized between config and fallback data.
- Follow-ups: Add workflow presets and refine action parameters.

## 2026-02-03 — Add a decision engine for priority focus + next steps
- Decision: Implemented a lightweight decision engine that ranks lead, deal, and customer actions by value and urgency.
- Alternatives considered: Hard-code focus in the UI or wait for the full automation layer.
- Rationale: Provides a tangible “brain” for the internal launch without adding dependencies.
- Implications: Scoring heuristics may need calibration and should eventually map to real workflow actions.
- Follow-ups: Tune weights and connect suggestions to action types.

## 2026-02-03 — Surface lifecycle stage + activation status in the Customers view
- Decision: Added lifecycle stage and activation status to the customer portfolio table, filters, and cohorts; flagged activation-at-risk in attention alerts.
- Alternatives considered: Keep lifecycle data only in settings or add a separate activation pipeline page.
- Rationale: Makes activation progress visible in the primary customer view without expanding navigation.
- Implications: Portfolio filters now include lifecycle/activation; data must stay consistent with lifecycle definitions.
- Follow-ups: Evaluate if activation-stage KPIs should be elevated to the executive summary.

## 2026-02-03 — Lock the v1 data model + analytics definitions
- Decision: Documented the v1 schema (required fields + lifecycle values) and codified KPI formulas; updated ontology configs to reflect derived revenue/health metrics.
- Alternatives considered: Keep definitions implicit in code only; delay until after the “brain” is implemented.
- Rationale: Clear schema + metric definitions reduce churn and make upcoming decision-engine work deterministic.
- Implications: Future schema changes must update docs + config together.
- Follow-ups: Audit any new derived metrics against the documented definitions.

## 2026-02-03 — Add a simple unit test runner script
- Decision: Added a lightweight `tests/unit/run.mjs` runner and updated the npm script to use it.
- Alternatives considered: Keep shell globbing (`node tests/unit/*.mjs`) or adopt a test framework.
- Rationale: Shell globbing passes only the first file to Node; a tiny runner executes all unit tests without new dependencies.
- Implications: The runner is custom and should be updated if test organization changes.
- Follow-ups: Consider migrating to a standard test runner if unit tests grow.

## 2026-02-03 — Implement local lead/deal import flow with schema-aware parsing
- Decision: Added a local CSV/JSON import flow for leads and deals with alias mapping, validation warnings, and link creation when IDs resolve.
- Alternatives considered: Add a full mapping UI or third-party CSV parser; defer imports until integrations exist.
- Rationale: Keep the app dependency-free and unblock rapid data ingestion for the internal launch timeline.
- Implications: Import is best-effort (warnings instead of hard failures); additional preview/mapping UX may be needed later.
- Follow-ups: Improve test runner coverage and consider richer import validation/preview.

## 2026-02-03 — Add Leads and Deals pages to the UI
- Decision: Added dedicated Leads and Deals pages with filters, KPIs, and object detail panels.
- Alternatives considered: Fold leads/deals into the Customers page; delay UI until import pipeline exists.
- Rationale: Makes the new lead/deal lifecycle visible immediately and keeps the navigation aligned with goals.
- Implications: Global filters are still customer-centric; may need refinement as lead pipeline grows.
- Follow-ups: Add import flow and next-step automation for leads/deals.

## 2026-02-03 — Add lead/deal objects without renaming legacy IDs
- Decision: Added lead/deal objects and lifecycle fields while keeping existing object IDs/field names (client_account, consulting_engagement, renewal_risk_score).
- Alternatives considered: Rename object types and fields to customer/activation/retention; postpone data model changes until UI refactor.
- Rationale: Preserve current UI functionality and avoid breaking derived logic while introducing the lead lifecycle.
- Implications: Legacy IDs remain in code; future cleanup should rename once UI/model refactor is planned.
- Follow-ups: Consider renaming object IDs/fields when UI and derived logic are updated together.

## 2026-02-03 — Reframe UI copy to customer/activation/retention language
- Decision: Updated navigation and UI copy to reflect lead → activation → retention focus without altering underlying data logic.
- Alternatives considered: Wait until data model changes were complete; keep legacy account/renewal language until beta.
- Rationale: Reduce confusion and align the current experience with internal-launch goals immediately.
- Implications: Some internal field names still use account/engagement/renewal terms; data model refactor is still required.
- Follow-ups: Align ontology config + seed data with lead lifecycle objects and naming.

## 2026-02-03 — Make refactor the first step of internal launch
- Decision: Added a pre-sprint refactor step to align existing code/design with lead lifecycle and activation goals.
- Alternatives considered: Proceed without refactor and adapt incrementally; delay refactor until after launch.
- Rationale: Reduces friction when implementing the new data model and flows.
- Implications: Day 1 is dedicated to refactoring; scope must be tightly controlled.
- Follow-ups: Identify the exact components/data structures to rename or reshape.

## 2026-02-03 — Set internal-launch scope and timeline
- Decision: Focus the product on a local-first cockpit for productized-service owners with a Feb 10 internal launch, Mar 17 beta, and Jun 30 paid launch.
- Alternatives considered: Keep the prior executive account-portfolio focus as primary; delay launch to expand scope.
- Rationale: Align the product with the productized-service business owner workflow and meet the 1-week launch window.
- Implications: Roadmap, strategy, and data model now center on lead lifecycle and activation flows; scope is intentionally narrow.
- Follow-ups: Lock lifecycle schema and confirm secondary KPIs.

## 2026-02-03 — Add internal launch sprint plan to docs/PLAN.md
- Decision: Documented a Feb 3–10 internal launch sprint plan with scope, non-goals, acceptance criteria, and draft milestones.
- Alternatives considered: Create a separate internal-launch plan doc; wait until unknowns are resolved.
- Rationale: Align the team quickly against the 1-week launch deadline and make gaps explicit.
- Implications: Plan needs confirmation of import format, data model, and milestone dates.
- Follow-ups: Validate the draft milestone plan and update once unknowns are resolved.

## 2026-02-03 — Capture North Star review with current evidence
- Decision: Proceeded with a North Star review using existing repo docs and recorded unknowns as explicit gaps.
- Alternatives considered: Wait for stakeholder inputs before documenting; skip formal review until dates/resources are set.
- Rationale: Create immediate alignment artifacts and a concrete list of missing inputs to unblock planning.
- Implications: Follow-up is required to confirm phase, resourcing, and milestones; review should be updated once inputs arrive.
- Follow-ups: Provide initiative summary, phase, and constraints to refine the review.

## 2026-02-03 — Remove repo-local north-star-review skill
- Decision: Deleted `.codex/skills/north-star-review` from the repo and kept only the global `~/.codex/skills/north-star-review` copy.
- Alternatives considered: Keep both copies and periodically sync; keep repo-local only.
- Rationale: Avoid duplicate skill definitions and honor the request to keep only the global install.
- Implications: Future updates to the skill should be made in the global location unless reintroduced in-repo.
- Follow-ups: None.

## 2026-02-03 — Install north-star-review globally
- Decision: Copied `north-star-review` into `~/.codex/skills` for cross-repo access.
- Alternatives considered: Package as a `.skill` file or keep repo-local only.
- Rationale: Global install is simpler and immediately available across repos.
- Implications: Must re-sync if the repo-local skill changes.
- Follow-ups: Consider packaging if distribution/sharing is needed later.

## 2026-02-03 — Normalize North Star skill format
- Decision: Created the skill as `north-star-review` and kept frontmatter limited to name + description.
- Alternatives considered: Use the provided `north-start-review` spelling and include metadata fields.
- Rationale: Aligns with skill naming guidance and YAML frontmatter requirements.
- Implications: If the intended name was `north-start-review`, rename the folder and frontmatter.
- Follow-ups: Confirm preferred skill name; package if distribution is needed.

## 2026-02-03 — Add executive value brief to Home
- Decision: Added an auto-generated Executive Value Brief card on the Home / Executive Summary page.
- Alternatives considered: Keep KPIs only; add a separate marketing-only landing page.
- Rationale: Execs need a concise narrative tying ROI, renewal exposure, and delivery risk together.
- Implications: The brief must stay aligned with KPI calculations and may warrant instrumentation/export later.
- Follow-ups: Consider copy/export and usage tracking for the brief.

## YYYY-MM-DD — <Decision title>
- Decision:
- Alternatives considered:
- Rationale:
- Implications:
- Follow-ups:
