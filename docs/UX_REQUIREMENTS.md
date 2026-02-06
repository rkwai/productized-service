# Owner Focus UX Requirements

## Goal
Reduce the time it takes an owner to decide the next focus and most profitable segment by making recommendations actionable with clear context.

## Primary moments
1) Owner reviews the Owner Summary and sees a recommended focus.
2) Owner decides whether to act based on rationale and prior comms.
3) Owner logs the next step without leaving the summary.

## Requirements
### Must
- Show recommendation rationale in plain language (what, why now, value at stake).
- Surface prior communication context next to the recommendation (last contact date, channel, summary, owner).
- Provide a one-click action to log the next step from the recommendation card.
- Handle low-volume state: show "insufficient data for segment" and guide the owner to capture leads and log comms.

### Should
- Offer a daily digest view of recommendations (opt-in, local-only).
- Allow quick add of CAC, margin, and LTV fields without leaving the summary.
- Show a minimum viable data coverage indicator (e.g., "Coverage: 3/4 fields").

### Nice to have
- Auto-summarize comm history into a short "last interaction" note.
- Prompt to add missing activation status when it blocks a recommendation.

## Data requirements
- Required for recommendations: lead_id, company_name, next_step_summary, last_contacted_at, expected_value.
- Required for profitability: estimated_ltv, customer_acquisition_cost, gross_margin_pct.
- Optional for now: activation_status (fallback to "Unassigned").

## Non-goals
- CRM integration or automated outreach.
- Multi-user coordination or approvals.
- Predictive segmentation beyond available data.

## Open questions
- What minimum comm context is enough: last contact only, or full log?
- Should "daily digest" be a Home section or a separate Inbox view?
- When data coverage is low, do we suppress recommendations or show a "low confidence" badge?

## Success metrics
- Time-to-decision for focus <= 15 seconds.
- % recommendations acted on in-session.
- % leads with next step + last contact logged.
