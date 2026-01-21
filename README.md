# Ontology Decision Cockpit UI

A configuration-driven, dependency-free decision cockpit for viewing and editing a Palantir-style ontology plus live operational data. The UI is built for business stakeholders to steer renewal readiness, delivery reliability, and measurable value realization.

## Why this exists
This prototype helps teams translate ontology definitions and field data into an operational cockpit that:
- Surfaces renewal and expansion readiness signals with explainability.
- Connects delivery reliability to outcomes and KPIs.
- Turns insights into actions with logged workflows.
- Keeps ontology configuration editable and versioned.

## Quick start
This is a static web app. Serve it with any local web server.

```bash
python -m http.server 8000
```

Then open `http://localhost:8000` in your browser.

## Deploying
Run the built-in Node server for deployment targets that expect a start command:

```bash
npm install
npm start
```

The server listens on `PORT` (default: `3000`). A Dockerfile is included for container-based deployments.

## Tests
Install dependencies and run the happy-path Playwright checks:

```bash
npm install
npm test
```

## Project structure
- `index.html` - App shell and layout.
- `styles.css` - Visual design system and layout.
- `docs/ontology-map.json` - Authoritative configuration (client metadata, semantic + kinetic layers, data integration).
- `seed-data.js` - Seeded ontology instances + links.
- `data.js` - Fallback template data (legacy).
- `storage.js` - Local persistence adapter.
- `app.js` - Rendering engine, routing, and state management.
- `docs/PLAN.md` - Delivery plan and milestones.
- `docs/ARCHITECTURE.md` - UI structure and state model.
- `docs/USER_GUIDE.md` - How to use the cockpit.

## Editing data
- All fields are editable in-place (Admin/Operator).
- Viewers can browse but cannot edit.
- The **Current JSON** panel reflects live edits and can be downloaded.

## Business value focus
The cockpit keeps value signals visible (health, risk, outcome progress) with explainability panels to support renewal and expansion conversations.

## Roadmap
See `docs/PLAN.md` for the full plan and next steps.
