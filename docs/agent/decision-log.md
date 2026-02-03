# Decision Log

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
