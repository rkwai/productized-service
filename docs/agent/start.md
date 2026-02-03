# Agent Start

## Product in 5 lines
- What it is: A configuration-driven decision cockpit UI for viewing and editing a Palantir-style ontology with live operational signals.
- Who it’s for: Business stakeholders (executives, operators) managing renewals, delivery reliability, and value realization across an account portfolio.
- The pain it solves: Disconnected ontology data and KPI signals that make renewal risk, delivery health, and ROI decisions slow or opaque.
- The main workflow: Navigate executive/portfolio views, review explainable KPIs, update records in-place, run actions, and export the updated JSON.
- The #1 success metric: Executives can identify LTV:CAC and the most profitable segment in under 15 seconds.

## Current strategy (tldr)
- Positioning: An executive-ready, explainable ontology cockpit that turns operational data into renewal/ROI decisions.
- Ideal customer profile: Teams running account-based services or renewals who need a shared, governed view of health, risk, outcomes, and marketing efficiency.
- Differentiators: Config-driven ontology + full-field editability, explainability panels, action logs, and embedded LTV:CAC/segment profitability signals.
- Guardrails (things we will not do): No backend/production data integration yet; avoid adding new runtime dependencies without explicit request.

## Current focus (next 2–4 weeks)
1) Advanced filtering and search across object types.
2) Timeline visualization for milestones and outcomes.
3) Multi-tenant storage adapters (API + DB).

## Tech overview
- Stack: React 18 + Vite, Tailwind CSS, shadcn/ui components, Playwright for E2E.
- Key directories: `src/` (UI, data, libs), `public/docs/` (ontology config), `docs/` (plans/architecture/guides), `tests/` (unit + e2e).
- How to run locally: `npm install` then `npm run dev` (Vite at http://localhost:5173).
- How to run tests: `npm run test` (unit), `npm run test:e2e`, or `npm run test:all`.
- Where config lives: `public/docs/ontology-map.json` (authoritative config), seed data in `src/data/seed-data.js`.
- Environments (dev/staging/prod): Dev is local Vite; staging/prod not defined (static build via `npm run build`).

## Observability & metrics
- Events we track: None instrumented yet (UI is local-only).
- Where dashboards live: N/A.
- Error monitoring: N/A.

## Release process
- Branching: Not specified (assume main for now).
- Versioning: Not specified.
- Deploy steps: `npm run build` and deploy `dist/` to Vercel or any static host.
- Rollback steps: Re-deploy previous static build.

## Known constraints / truths
- Constraints (legal, performance, security, cost): LocalStorage persistence only; no backend or production data integration; dependency-free runtime by design.
- Important historical decisions (see decision-log): None recorded yet.
