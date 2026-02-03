# Delivery Plan

## Goals
1. Provide a configuration-driven cockpit to view and edit all ontology fields and instances.
2. Surface renewal readiness, delivery reliability, and measurable value realization.
3. Ensure derived scores are explainable and linked to actions.
4. Support governance with role-based access and audit trails.

## Internal Launch Sprint Plan (Feb 3–10, 2026)

### Goal
- Ship a local-first internal launch that helps a productized-service business owner capture leads, activate customers, and surface the most profitable segment (LTV:CAC).

### Scope (must-haves for Feb 10)
- Refactor existing code/design to align with the lead lifecycle and activation workflows.
- Capture leads with lifecycle stages and next steps.
- Convert leads into customers and track onboarding/activation milestones.
- Provide business analytics with LTV, CAC, and LTV:CAC by segment.
- Support data import (file-based) for leads/customers.
- Present a focused executive UI that highlights the single most important priority.

### Non-goals (Feb 10)
- Multi-user accounts or permissions.
- Payments/billing.
- Live integrations with external CRMs or data providers.

### Acceptance criteria (Feb 10)
- A business owner can add a lead, advance its stage, and convert it to a customer.
- Onboarding/activation milestones are visible with status and next steps.
- LTV:CAC and most-profitable-segment insights are visible on the executive view.
- Data can be imported from a local file into the system (format TBD).
- App runs locally on the existing stack without new runtime dependencies.

### Risks / unknowns
- Existing account-portfolio UI/data model needs alignment with lead lifecycle goals.
- Data model updates required for lead pipeline and onboarding stages.
- Import format and validation rules not defined.
- UI scope may exceed the 1-week window if flows are not tightly scoped.

### Draft milestone plan (confirm dates)
- Feb 3: Refactor existing code/design to align with lead lifecycle + activation goals.
- Feb 3–4: Finalize data model + ontology config for Lead, Deal, Milestone, and Segment analytics.
- Feb 4–6: Implement lead capture + pipeline flow and conversion to customer.
- Feb 6–8: Implement onboarding/activation milestones and health tracking.
- Feb 8–9: Add data import flow and analytics view polish.
- Feb 9–10: UX refinement, QA, and launch readiness checklist.

## Phase 1: Foundation
- [x] Establish baseline data model from the supplied JSON.
- [x] Build a static app shell with a value-first summary header.
- [x] Create editable forms for every field and structure in the dataset.

## Phase 2: Decision Cockpit (Current)
- [x] Implement navigation for the decision cockpit IA.
- [x] Add config-driven object lists and detail pages.
- [x] Implement ontology studio with raw JSON editing + versioning.
- [x] Implement kinetic functions with explainability panels.
- [x] Add Action Center workflows + action log.
- [x] Add audit trail and RBAC modes.
- [x] Persist changes locally and support JSON export.

## Phase 3: Enhancements
- [ ] Add advanced filtering and search across object types.
- [ ] Add timeline visualization for milestones and outcomes.
- [ ] Add multi-tenant storage adapters (API + DB).

## Phase 4: Executive Experience (Current)
- [x] Ship a luxury-but-dense executive layout with whitespace used sparingly and intentionally.
- [x] Add a Marketing ROI strip (Portfolio LTV:CAC, CAC payback, profit concentration, coverage).
- [x] Add segment profitability leaderboard with allocation recommendation.
- [x] Introduce a typography system (single primary font, numeric tabular alignment).
- [x] Define a restrained color system (neutral base + semantic accents) with consistent meaning.
- [x] Validate a happy-path E2E that covers the new executive ROI functionality.
- [x] Seed a 15-account portfolio with realistic productized service data across all menu views.

## Success criteria
- Every field is editable and reflected in the live JSON.
- Users can quickly understand value signals and governance actions.
- Derived scores include explainability payloads.
- Action runs are logged with parameters and timestamps.
- Executives can see LTV:CAC and identify the most profitable segment in under 15 seconds.
