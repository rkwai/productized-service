# Productized Service Decision Cockpit UI

A configuration-driven, dependency-free cockpit for productized-service business owners to capture leads, activate customers, and see profitability signals (LTV:CAC by segment).
The goal is to make the next focus and profit signals obvious in minutes, not hours.

## Problem statement
- User: Productized-service owners managing leads, activation, and profitability across spreadsheets/tools.
- Problem: Data is fragmented and stale, so it is hard to see the next focus or most profitable segment.
- Impact: Follow-ups slow down and marketing spend drifts away from profit.

## Why this exists
This prototype helps productized-service owners translate lead/customer data into an operational cockpit that:
- Makes lead stages and next steps visible.
- Tracks onboarding and activation milestones.
- Turns insights into actions with logged workflows.
- Keeps the data model configuration editable and versioned.
- Highlights LTV:CAC, segment profitability, and focus recommendations.

## Quick start
This is a React + Vite app with Tailwind + shadcn/ui components.

```bash
npm install
npm run dev
```

Then open `http://localhost:5173` in your browser.

## Deploying
Build the production bundle for Vercel or any static host:

```bash
npm run build
npm run preview
```

Vercel will auto-detect the Vite configuration (no custom server required).

## Tests
Cloud editors should run unit tests only. Playwright is intended for local/CI where browsers can launch.

```bash
npm install
npm test
```

Local/CI E2E (Playwright boots the Vite dev server for you):

```bash
npx playwright install
npm run test:e2e
```

Run everything (unit + E2E):

```bash
npm run test:all
```

CI runs `npm run test:all` after installing Playwright browsers (see `.github/workflows/ci.yml`).

## Project structure
- `index.html` - Vite entry document.
- `src/App.jsx` - Main React layout, routes, and UI rendering.
- `src/index.css` - Tailwind layers, CSS variables, and global layout styles.
- `src/data/initial-data.js` - Fallback template data.
- `src/data/seed-data.js` - Seeded ontology instances + links.
- `src/lib/storage.js` - Local persistence adapter.
- `src/lib/dashboard.js` - Derived metrics + ontology helpers.
- `public/docs/ontology-map.json` - Authoritative configuration (client metadata, semantic + kinetic layers, data integration).
- `docs/PLAN.md` - Delivery plan and milestones.
- `docs/ARCHITECTURE.md` - UI structure and state model.
- `docs/USER_GUIDE.md` - How to use the cockpit.

## Editing data
- All fields are editable in-place (Admin/Operator).
- Viewers can browse but cannot edit.
- The **Current JSON** panel reflects live edits and can be downloaded.
- Use **Admin / Settings → Reset changes** to reload the seeded dataset from `src/data/seed-data.js`.

## Business value focus
The cockpit keeps value signals visible (conversion, activation progress, segment profitability) with explainability panels to support lead conversion and marketing focus. Owners can track LTV:CAC, profit concentration by segment, and the most valuable segment to guide where to invest next.

## Roadmap
See `docs/PLAN.md` for the full plan and next steps.
