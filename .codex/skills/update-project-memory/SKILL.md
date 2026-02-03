---
name: update-project-memory
description: Use after finishing a task to record what changed, decisions made, and next steps in docs/agent/* (worklog/backlog/decision-log).
---

## Goal
Persist task context so future sessions can pick up instantly.

## Steps
1) Summarize what was attempted and what actually changed.
2) Update `docs/agent/worklog.md` with:
   - Date (YYYY-MM-DD)
   - Outcome (what shipped/fixed)
   - Key files touched
   - Follow-ups / risks
3) If you discovered new work, add items to `docs/agent/backlog.md` with priority + rationale.
4) If you made a decision with tradeoffs, append to `docs/agent/decision-log.md`:
   - Decision, alternatives, rationale, implications
5) If metrics/instrumentation changed, update `docs/agent/metrics.md`.
6) Keep entries short; link to PRs/issues/commits when available.
7) Never include secrets or sensitive tokens in these docs.
