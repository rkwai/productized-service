---
name: gherkin-test-sync
description: Keep Gherkin-based Playwright E2E tests in sync with the product UI. Use when adding or changing user flows, updating `tests/features/*.feature`, or aligning `tests/bdd/steps.js` with UI copy/selectors after product changes.
---

# Gherkin Test Sync

## Goal
Keep Gherkin feature files as the source of truth for E2E flows and ensure step definitions stay aligned with the UI.

## Workflow
1) Identify the user flow or UI change that affects E2E coverage.
2) Update or add the Gherkin scenario first in `tests/features/*.feature` (TDD).
3) Reuse existing steps from `tests/bdd/steps.js` whenever possible; add a new step only when the wording or selector intent is meaningfully different.
4) Prefer stable selectors (`data-page`, headings, or labels) over brittle text-only matches. If copy changes, update the step definition, not the feature wording unless the behavior changed.
5) Keep scenarios focused on the “happy path” and avoid adding extra assertions unless they catch real regressions.
6) Run `npm run test:e2e` and fix missing or mismatched steps immediately.
7) If selectors become fragile, add a targeted data attribute and update the step definition to use it.

## Consistency Checks
- Each scenario step should map to exactly one step definition.
- Feature language should match user intent, not implementation details.
- Step definitions should encode UI details and selector logic.

## Common Triggers
- Navigation labels or page structure changed.
- New CTA or form field added to a core flow.
- A user journey is added/removed from the happy path.
