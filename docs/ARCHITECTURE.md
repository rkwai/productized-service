# Architecture

## Overview
The cockpit is a static, configuration-driven SPA that loads the authoritative ontology config from `docs/ontology-map.json`, hydrates instance data from `seed-data.js`, and persists edits locally. Navigation is hash-based with dedicated pages for business decisions, ontology governance, and auditability.

## Key files
- `index.html`: Layout and navigation shell.
- `styles.css`: Design system and layout.
- `docs/ontology-map.json`: Canonical config payload.
- `seed-data.js`: Seeded object instances + links.
- `storage.js`: Local persistence adapter.
- `app.js`: Rendering engine, routing, kinetic computations, and action handling.

## State model
- `config`: Ontology config (client metadata, semantic + kinetic layers, data integration).
- `instances`: Object instances keyed by object type.
- `links`: Link instances for ontology relationships.
- `derived_values`: Computed values with explanations.
- `action_log`: Executed action runs and their parameters.
- `audit_log`: Edit history entries.
- `config_versions`: Saved versions of the config.

## Rendering strategy
- Forms and lists are rendered from `semantic_layer.object_types`.
- Fields use type inference heuristics with optional overrides (`field_overrides`).
- Explainability panels are generated for each derived score/flag.

## Kinetic computation engine
`app.js` calculates derived fields for:
- Engagement health
- Workstream milestone reliability
- Milestone risk flags
- Outcome progress
- Account health and renewal risk
- Account segmentation

Each derived value stores `value`, `computed_at`, and `explanation_json`.

## Persistence
LocalStorage stores the full state payload for offline and reload-safe persistence. Download JSON exports are provided for portability.
