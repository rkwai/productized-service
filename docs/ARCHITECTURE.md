# Architecture

## Overview
The cockpit is a React + Vite SPA that models a client ontology and the operational signals around it. The app loads the authoritative ontology config from `public/docs/ontology-map.json`, hydrates instance data from `src/data/seed-data.js`, and persists edits locally so stakeholders can review health, risks, outcomes, and governance changes across the portfolio. Navigation is hash-based with dedicated pages for business decisions, ontology governance, and auditability.

## Key files
- `index.html`: Vite entry document.
- `src/App.jsx`: Layout, routing, and page rendering.
- `src/index.css`: Tailwind layers, CSS variables, and global layout styles.
- `public/docs/ontology-map.json`: Canonical config payload.
- `src/data/seed-data.js`: Seeded object instances + links.
- `src/lib/storage.js`: Local persistence adapter.
- `src/lib/dashboard.js`: Rendering helpers, field inference, and derived calculations.

## State model
- `config`: Ontology config (client metadata, semantic + kinetic layers, data integration).
- `instances`: Object instances keyed by object type.
- `links`: Link instances for ontology relationships.
- `derived_values`: Computed values with explanations.
- `action_log`: Executed action runs and their parameters.
- `audit_log`: Edit history entries.
- `config_versions`: Saved versions of the config.

## Rendering strategy
- The React UI renders pages and cards from ontology metadata and instance data.
- Forms and lists are generated from `semantic_layer.object_types`.
- Fields use type inference heuristics with optional overrides (`field_overrides`).
- Explainability panels surface derived scores/flags with computation context.

## Executive UX layer
- Design system tokens live in `src/index.css` (spacing, typography, color).
- Primary UI font: Geist with tabular numerics for KPI readability.
- Whitespace is intentionally sparse: fewer, tighter gaps with larger emphasis inside priority cards.
- Typography uses a single primary font with tabular numerics for KPI legibility.
- A restrained neutral palette is paired with semantic accents for risk/ROI signals.

## Kinetic computation engine
`src/lib/dashboard.js` calculates derived fields for:
- Engagement health
- Workstream milestone reliability
- Milestone risk flags
- Outcome progress
- Account health and renewal risk
- Account segmentation
- Revenue efficiency (LTV:CAC, CAC payback, gross profit)

The revenue efficiency layer combines:
- `estimated_ltv`
- `customer_acquisition_cost`
- `avg_monthly_revenue`
- `gross_margin_pct`

to derive profit concentration by segment and executive-ready ROI signals.

Each derived value stores `value`, `computed_at`, and `explanation_json`.

## Persistence
LocalStorage stores the full state payload for offline and reload-safe persistence. Download JSON exports are provided for portability.
