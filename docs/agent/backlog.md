# Backlog

## P0 (next up)
- [ ] Define primary persona + JTBD and confirm ICP focus.
- [ ] Set milestone dates and resource commitments for the next phase.
- [ ] Establish a risk register with owners, signals, and mitigations.
- [x] Define lead lifecycle data model (Lead → Qualified → Proposal → Won → Onboarded → Activated → Retained).
- [x] Decide the import format + validation rules for Feb 10.
- [x] Build lead/deal import UI once the format is locked.
- [x] Confirm secondary KPIs beyond LTV:CAC (activation rate, retention, conversion).
- [x] Refactor existing account-portfolio UX/data model to align with lead lifecycle and activation goals.
- [x] Update ontology config + seed data to include Lead/Customer/Deal objects and lifecycle stages.

## P1 (soon)
- [ ] Add copy/export action for the executive value brief (board-ready readout).
- [ ] Add usage instrumentation for exec-brief views and copy events.
- [ ] Define sprint goals cadence and critical-path dependencies.
- [x] Update unit test runner to execute all files in `tests/unit`.
- [ ] Add import preview/mapping UX (field mapping + error surfacing).
- [x] Tune decision-engine scoring and map recommendations to workflows.
- [ ] Add onboarding checklist and empty-state guidance for first-time owners.
- [ ] Add lead capture filters for gaps/stale status.
- [x] Add one-click lead conversion (lead → deal) from the pipeline view.
- [x] Add deal → customer conversion quick action.
- [ ] Auto-create onboarding activation plan when converting a deal.
- [ ] Add `set_marketing_focus` action type to config + action map.

## P2 (later)
- [ ] Package north-star-review skill into a distributable `.skill` if needed.

## Parking lot
- [ ] Verify the global `north-star-review` skill shows up in another repo if needed.
