---
name: north-star-review
description: Guide a product/engineering leader through a 12-question North Star review of a software initiative (strategy, discovery, execution) and produce a concise gap analysis, risks, decisions, and next steps.
---

# North Star Review

## Goal
Help the user evaluate or kick off a software initiative by answering 12 high-leverage questions early, reducing misalignment and costly pivots.

## When to use
Use this skill when the user wants to:
- sanity-check an initiative, PRD, roadmap, or architecture direction
- run a kickoff / discovery review
- identify why a project is pivoting repeatedly
- produce an alignment-ready "north star" summary + action plan

Do not use this skill for:
- code review, debugging, or small isolated implementation tasks
- detailed sprint execution work unless the user explicitly wants an initiative review

## Inputs to request (only if missing)
Ask for what exists; do not block if unavailable:
- Initiative name + 1-2 paragraph summary
- Current phase: strategy / discovery / execution
- Artifacts (paste or link): PRD, roadmap, epics, architecture notes, launch doc
- Constraints: deadline, budget/headcount, compliance/security, platform constraints

If the user only wants the questions (no analysis), output the questions with brief guidance and stop.

## Workflow
1. Confirm scope in 2-3 bullets (what we are reviewing, what is out of scope).
2. Run the 12 questions (grouped by phase). For each:
   - Ask for the current answer and any evidence (doc link, decision log, KPI).
   - If missing, propose 1-3 concrete ways to find/decide it.
   - Mark status: answered / partial / missing.
   - Note impact if missing (risk to timeline/cost/quality/alignment).
3. Synthesize deliverables:
   - Executive Summary (one page max)
   - Scorecard (12 questions + status + gaps)
   - Top risks + mitigations
   - Decisions needed (with suggested owners)
   - Next 7 days action plan (bulleted, minimal)

## The 12 questions

### Strategy phase
1. Who is our target audience?
   - Ask for a vivid profile (primary persona + key jobs-to-be-done).
2. What is our value proposition?
   - Tie KPIs to financial outcomes (revenue, retention, cost reduction, risk reduction).
3. What resources are we committing?
   - Budget, headcount, critical skills, external dependencies.
4. When do we expect to see results?
   - Quarterly milestones + what "success" looks like each quarter.

### Discovery phase
5. What exactly are we building?
   - Requirements stated clearly enough to resemble a press release.
6. How will we bring this to life?
   - High-level user flows and data flows (no pixel-perfect design required).
7. When can we deliver?
   - Sprint-level plan with a realistic delivery window and major unknowns.
8. Who do we need on our team?
   - Cross-functional partners + specialized expertise needed (security, data, legal, etc.).

### Execution phase
9. What is on our critical path?
   - Dependencies, sequencing, tools, approvals, and gating decisions.
10. What are our sprint goals?
   - Clear, achievable sprint objectives aligned to milestones.
11. What risks are we facing?
   - Current risks + detection signals + mitigation plan; keep it updated.
12. Are we on track?
   - Review cadence, stakeholder visibility, and what changes if we slip.

## Output format
- Be concise.
- Prefer bullets over prose.
- Do not invent specifics; if unknown, state "unknown" and recommend how to resolve.

## Role guidance (use as advisory, not rigid rules)
- Strategy: exec-driven (with team input)
- Discovery: team leads drive (bridge vision -> plan)
- Execution: ICs drive (with leadership support)
