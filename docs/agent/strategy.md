# Strategy

## Vision
- Deliver a local-first cockpit that helps productized-service owners convert leads, activate customers, and maximize segment profitability.

## Target users / ICP
- Primary: Productized-service business owners (1–10 employees).
- ICP: Small service teams that need clarity on lead stages, activation progress, and LTV:CAC by segment.

## North-star metric
- Owners can identify the most profitable segment and next focus in under 15 seconds.

## Positioning
- Executive-style, explainable cockpit for lead conversion, activation, and profitability insights with local-first operation.

## Differentiators
- Config-driven data model + full-field editability.
- Explainability panels + action logs.
- Embedded LTV:CAC and segment profitability signals.
- Focused "next best action" guidance for owners.

## Principles
- Local-first and dependency-light.
- Configuration-driven and fully editable.
- Explainable metrics and guided next steps.

## Constraints
- Local-only persistence; no integrations/multi-user/payments for Feb 10.
- Avoid adding new runtime dependencies without explicit request.

## Key risks and how we mitigate them
- Scope creep in a 1-week launch -> enforce strict scope triage and daily milestones.
- Data model churn -> lock core objects early and defer optional fields.
