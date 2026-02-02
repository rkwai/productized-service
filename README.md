# Ontology Decision Cockpit UI

A configuration-driven, dependency-free decision cockpit for viewing and editing a Palantir-style ontology plus live operational data. The UI is built for business stakeholders to steer renewal readiness, delivery reliability, measurable value realization, and marketing ROI (LTV:CAC + profitability by segment).

## Why this exists
This prototype helps teams translate ontology definitions and field data into an operational cockpit that:
- Surfaces renewal and expansion readiness signals with explainability.
- Connects delivery reliability to outcomes and KPIs.
- Turns insights into actions with logged workflows.
- Keeps ontology configuration editable and versioned.
- Makes LTV:CAC and segment profitability visible for spend allocation decisions.

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

## Business value focus
The cockpit keeps value signals visible (health, risk, outcome progress) with explainability panels to support renewal, expansion, and marketing ROI decisions. Executives can track LTV:CAC and identify the most profitable segment to guide spend allocation.

## Roadmap
See `docs/PLAN.md` for the full plan and next steps.
