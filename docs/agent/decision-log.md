# Decision Log

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
