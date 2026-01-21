# Ontology Value Dashboard UI

A lightweight, dependency-free dashboard UI for viewing and editing a Palantir-style ontology and Forward Deployed Engineer (FDE) findings. The UI is designed to keep business value front-and-center while providing full editability of every field in the dataset.

## Why this exists
This prototype helps teams translate FDE findings into an operational dashboard that:
- Highlights client value realization and renewal risk drivers.
- Keeps delivery reliability, outcomes, and KPIs tied to each other.
- Makes it easy to iterate on ontology definitions and action playbooks.
- Presents insights in a polished, executive-ready layout inspired by modern Vercel-style dashboards.

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
- `data.js` - Source dataset (FDE findings + ontology template).
- `app.js` - Rendering and edit logic.
- `docs/PLAN.md` - Delivery plan and milestones.
- `docs/ARCHITECTURE.md` - UI structure and state model.
- `docs/USER_GUIDE.md` - How to use the dashboard.

## Editing data
- All fields are editable in-place.
- Arrays of primitives use newline-separated values.
- Arrays of objects are shown as cards with add/remove actions.
- The **Current JSON** panel reflects live edits and can be downloaded.

## Business value focus
The UI keeps value signals visible (objectives, outcomes, KPI progress, risks) to support renewal and expansion conversations. The new visual hierarchy surfaces critical metadata and actions up front for business stakeholders.

## Roadmap
See `docs/PLAN.md` for the full plan and next steps.
