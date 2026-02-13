# Decision Log

## 2026-02-09 — Move E2E happy path to Gherkin-first TDD
- Decision: Rebuilt the Playwright happy-path test to execute Gherkin scenarios with a lightweight in-repo parser and step library.
- Alternatives considered: Add a third-party Gherkin/Cucumber dependency; keep the imperative Playwright spec.
- Rationale: Gherkin gives a stable, user-facing source of truth without adding new runtime or dev dependencies.
- Implications: E2E scenarios now live in `tests/features/*.feature` and step definitions must stay aligned with UI selectors.
- Follow-ups: Validate skill YAML via PyYAML once network access is available.

## 2026-02-09 — Require data capture for customer + lead records in Gherkin flow
- Decision: Updated the Gherkin happy path to include capturing new account and lead info, and added customer quick edit support.
- Alternatives considered: Keep data capture implied via Settings; defer account edits to future UX changes.
- Rationale: Gherkin is the product requirement doc, so it should explicitly cover data capture in the core workflow.
- Implications: The customer detail panel now includes a quick edit block for key fields.
- Follow-ups: Consider adding validation for numeric fields (CAC/margin) if we expand coverage.

## 2026-02-09 — Split E2E requirements into five Gherkin features
- Decision: Broke the single happy-path feature into five focused requirement features (owner summary, customer profitability, lead pipeline, data import, settings).
- Alternatives considered: Keep one end-to-end scenario; add a large multi-scenario feature.
- Rationale: Smaller features map to product requirements and reduce brittleness.
- Implications: The E2E runner loads all `tests/features/*.feature` files.
- Follow-ups: Keep each feature to 1–2 scenarios maximum.

## 2026-02-06 - Add a single lead detail expansion to happy-path
- Decision: Added only a lead detail expansion check to the happy-path test.
- Alternatives considered: Add multiple new flows (imports, workflow runs); add no additional flows.
- Rationale: Keep coverage high-value without increasing brittleness.
- Implications: Happy-path now covers customers + leads detail expansion.
- Follow-ups: Revisit adding workflow run checks after selectors stabilize.

## 2026-02-06 - Target Customers panel in E2E selector
- Decision: Updated the E2E test to locate the Customers panel via its heading instead of the first table on the portfolio page.
- Alternatives considered: Keep generic table selector; add data-testid attributes.
- Rationale: Portfolio page includes multiple tables; heading-based selection is stable without new attributes.
- Implications: Test is less brittle as new tables are added.
- Follow-ups: Add data-testid attributes if selectors grow complex.

## 2026-02-06 - Use local telemetry for observability
- Decision: Implemented local-only telemetry logging and a Settings telemetry panel instead of external analytics.
- Alternatives considered: Add third-party analytics; defer observability until later.
- Rationale: Maintain local-only constraint while still enabling measurement.
- Implications: Telemetry is local and manual; no alerts or centralized dashboards.
- Follow-ups: Define thresholds for follow-through and data coverage.

## 2026-02-06 - Add Log outreach to priority focus
- Decision: Added a Log outreach button for lead recommendations on the priority focus card.
- Alternatives considered: Keep the workflow button only; place comm logging in the lead table or detail panel.
- Rationale: Comm capture needs to be immediate at the decision point.
- Implications: Action logs will become the default comm context source.
- Follow-ups: Evaluate if a richer comm log UI is required.

## 2026-02-06 - Show lead comm context in priority focus
- Decision: Added last-contact, next-step, and owner context next to the priority focus recommendation for leads.
- Alternatives considered: Keep the focus card minimal and rely on table details; add a separate comms panel.
- Rationale: Interviews showed trust depends on seeing prior comms without extra digging.
- Implications: Action logs now influence what the focus card displays.
- Follow-ups: Decide whether to expand beyond last contact into a full comm history view.

## 2026-02-06 - Capture discovery summary and UX requirements as source of truth
- Decision: Created a discovery summary and UX requirements doc to guide upcoming UI changes.
- Alternatives considered: Keep findings only in chat; wait until all interviews are complete.
- Rationale: Gives a stable reference for scope and design while more interviews run.
- Implications: Requirements may change as more data is collected.
- Follow-ups: Update the summary and requirements after each new interview.

## 2026-02-06 - Defer local-only acceptability interview
- Decision: Skipped Interview D (local-only acceptability) for now.
- Alternatives considered: Run it immediately; replace with async survey.
- Rationale: Current focus is on trust and data coverage findings; acceptability can be revisited if scope shifts.
- Implications: Viability risk remains unvalidated.
- Follow-ups: Reassess before external beta.

## 2026-02-06 - Require comm context in focus recommendations
- Decision: Treat prior communication context as required for recommendation trust.
- Alternatives considered: Keep recommendations lean and rely on manual lookup; add a separate notes tab.
- Rationale: Owner feedback indicates they will act faster when prior comms are surfaced in-line.
- Implications: Recommendations should link to recent outreach notes or summaries.
- Follow-ups: Define the minimal comm log fields and where they surface in the UI.

## 2026-02-06 - Use simulated interview results as placeholder only
- Decision: Generated simulated interview outputs to illustrate expected findings, with an explicit note that they are not evidence.
- Alternatives considered: Wait for real interviews before writing any results; omit simulated readout entirely.
- Rationale: Gives a concrete picture of what decisions will hinge on while interviews are scheduled.
- Implications: Simulated outcomes must be replaced with real data before product decisions.
- Follow-ups: Run real interviews and update the discovery readout.

## 2026-02-06 - Run discovery experiments before more build
- Decision: Prioritize a short discovery sprint to validate decision-time, trust, and data coverage assumptions before further feature work.
- Alternatives considered: Continue feature build and rely on anecdotal feedback; wait until after beta to test assumptions.
- Rationale: Reduces risk of building the wrong signals and increases confidence in the core promise.
- Implications: Short-term focus shifts to experiments and evidence collection.
- Follow-ups: Execute the experiment briefs and log decisions.

## 2026-02-06 - Standardize problem statement across docs and UI
- Decision: Updated docs and UI copy to state the user/problem/impact explicitly and align the primary objective string.
- Alternatives considered: Leave copy as-is and rely on internal context; add a new standalone problem-brief doc.
- Rationale: Consistent framing helps onboarding and reduces ambiguity about the product outcome.
- Implications: UI copy and config metadata now embed the 15-second decision target.
- Follow-ups: Revisit the target if launch timelines or ICP shift.

## 2026-02-06 - Run unit tests only for quality enforcement
- Decision: Ran `npm run test` (unit) as the verification step and did not run Playwright E2E.
- Alternatives considered: Run `npm run test:all` including E2E; skip tests entirely.
- Rationale: Unit suite gives quick signal without requiring Playwright browser setup.
- Implications: E2E coverage was not validated.
- Follow-ups: Run `npm run test:e2e` if full suite verification is required.

## 2026-02-05 - Keep temp venv for skill validation
- Decision: Keep using the temporary venv at `/tmp/codex-pyyaml-venv` and document its path in the skill notes.
- Alternatives considered: Install PyYAML persistently; skip validation.
- Rationale: Avoids system Python changes while preserving a repeatable validation path.
- Implications: Validation depends on the temp venv existing; it may need recreation after cleanup.
- Follow-ups: None.

## 2026-02-04 - Use temp venv for PyYAML validation
- Decision: Installed PyYAML in a temporary venv under `/tmp` to run the skill validator instead of system-wide installation.
- Alternatives considered: Install PyYAML globally via pip with `--break-system-packages`; skip validation.
- Rationale: Avoids modifying the system Python while still validating the skill YAML.
- Implications: The venv is ephemeral; validation requires the temp venv path unless PyYAML is installed persistently.
- Follow-ups: Consider a persistent PyYAML install if validation becomes frequent.

## 2026-02-04 - Create global bootstrap-product-engineer skill
- Decision: Authored a global Codex skill under `~/.codex/skills/bootstrap-product-engineer` with repo bootstrap instructions and UI metadata, without executing it.
- Alternatives considered: Keep bootstrap steps as ad-hoc instructions; store the spec in a repo-only doc.
- Rationale: Centralizes a reusable bootstrap workflow and avoids re-running on this repo.
- Implications: Skill validation was not run because PyYAML is missing.
- Follow-ups: Install PyYAML and run `quick_validate.py` when convenient.

## 2026-02-03 — Hide empty-detail tip behind tooltip
- Decision: Replaced the empty detail card tip with a hover tooltip (“?”).
- Alternatives considered: Keep the full tip visible; remove the tip entirely.
- Rationale: Keep guidance available without cluttering the UI.
- Implications: Discoverability depends on the tooltip affordance.
- Follow-ups: None.

## 2026-02-03 — Inline detail cards under table rows
- Decision: Render object detail cards as expandable rows beneath the selected table row.
- Alternatives considered: Keep the right-hand sticky panel; open a modal drawer.
- Rationale: Keeps context close to the data and matches ICP expectations for row drill-down.
- Implications: Tables handle expansion; summary tables without click targets may still show hover affordances.
- Follow-ups: Adjust hover styling for non-clickable rows if needed.

## 2026-02-03 — Add workspace data controls
- Decision: Added Settings controls to reload seed data or clear all instance data while keeping config.
- Alternatives considered: Keep only the reset button in JSON export; require manual local storage clearing.
- Rationale: Switching between demo data and real data is a primary ICP need.
- Implications: Empty data states may be more common; guide users toward import/quick add.
- Follow-ups: Add an empty-state banner and suggested first actions.

## 2026-02-03 — Add lead attention filters + quick-add defaults
- Decision: Added lead attention filters (missing next step/contact, stale, capture gaps) and pre-filled fields on quick-add.
- Alternatives considered: Add a separate lead hygiene dashboard; keep filters limited to stage/status.
- Rationale: ICP needs to prioritize follow-up gaps without wading through full lead lists.
- Implications: KPI counts now reflect the filtered lead subset.
- Follow-ups: Consider a lead hygiene summary card with one-click filters.

## 2026-02-03 — Auto-create onboarding plan on deal conversion
- Decision: Generate a consulting engagement, workstreams, and milestones automatically when a deal converts to a customer.
- Alternatives considered: Prompt the user to configure onboarding manually; create only a placeholder engagement.
- Rationale: Ensure activation workflows are immediately available post-conversion.
- Implications: Onboarding templates are hard-coded in the UI until configurable.
- Follow-ups: Move onboarding templates into config for easier edits.

## 2026-02-03 — Log marketing focus decisions from segment profitability
- Decision: Added a “Set focus” action on the segment profitability table and surfaced the latest focus on Home.
- Alternatives considered: Rely on manual notes; add a separate marketing plan module.
- Rationale: Owners need a lightweight way to translate segment insights into actions.
- Implications: Marketing focus is a logged action (not a workflow) and does not require config action types.
- Follow-ups: Consider a richer marketing focus history view if needed.

## 2026-02-03 — Add customer activation/retention quick actions in portfolio
- Decision: Added a Quick actions column on the Customers table to launch activation, retention, and data-gap workflows.
- Alternatives considered: Keep actions only in the detail panel; add a separate “activation queue” page.
- Rationale: Make activation and retention moves immediately accessible where owners scan accounts.
- Implications: Portfolio table is denser; we may need column presets for action-heavy views.
- Follow-ups: Add activation kickoff creation for new customers.

## 2026-02-03 — Add deal → customer conversion action in pipeline
- Decision: Added a Convert/View customer quick action on the Deals page that auto-generates a linked customer record and closes the deal.
- Alternatives considered: Require conversion from Settings; add a separate onboarding wizard first.
- Rationale: Move from sale to onboarding in one step while preserving lead/deal links.
- Implications: Created customers start with minimal data; onboarding milestones still need to be created.
- Follow-ups: Auto-create onboarding engagement + milestones at conversion.

## 2026-02-03 — Add lead → deal conversion action in pipeline
- Decision: Added a Create/View deal quick action on the Leads page that auto-generates a linked deal record.
- Alternatives considered: Require conversion from Settings; rely on manual deal creation without lead linkage.
- Rationale: Speed up conversion workflow by reducing context switching and ensuring links are created.
- Implications: Auto-filled deal fields may need later edits; duplicate prevention relies on existing lead → deal lookup.
- Follow-ups: Add deal → customer conversion and activation kickoff actions.

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
