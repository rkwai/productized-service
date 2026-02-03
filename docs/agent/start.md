# Agent Start

## Product in 5 lines
- What it is: A local-first cockpit for productized-service business owners to capture leads, activate customers, and see profitability signals.
- Who it’s for: Business owners (1–10 employees) running productized services who need clarity on lead stages, activation milestones, and segment ROI.
- The pain it solves: Disconnected lead/customer data makes it hard to know where to focus and which segments are most profitable.
- The main workflow: Capture leads, advance lifecycle stages, onboard/activate customers with milestones, and review LTV:CAC insights by segment.
- The #1 success metric: Owners can identify the most profitable segment and next focus in under 15 seconds.

## Current strategy (tldr)
- Positioning: A local-first, executive-style cockpit for productized-service owners to manage lead conversion, activation, and profitability.
- Ideal customer profile: Productized-service businesses (1–10 employees) seeking clarity on lead stages, activation progress, and LTV:CAC by segment.
- Differentiators: Config-driven data model, full-field editability, explainable insights, and a focused "next best action" brain.
- Guardrails (things we will not do): No backend/integrations, no multi-user, no payments, avoid new runtime deps without explicit request.

## Current focus (next 2–4 weeks)
1) Lock the lead/customer lifecycle data model and import format.
2) Ship the decision engine ("brain") for next steps and priority focus.
3) Polish the core capture → activation → insights flow for beta readiness.

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
- Constraints (legal, performance, security, cost): Local-only persistence; no integrations/multi-user/payments for Feb 10; dependency-free runtime by design.
- Important historical decisions (see decision-log): None recorded yet.
