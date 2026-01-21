# User Guide

## Getting started
1. Run a static web server (example below).
2. Open the browser at `http://localhost:8000`.

```bash
python -m http.server 8000
```

## Editing fields
- Click into any field to edit.
- Arrays of values use newline-separated entries.
- Arrays of objects are displayed as cards with **Add** and **Remove** controls.
- The **Current JSON** panel updates live.

## Navigating the dashboard
- Use the left navigation rail to jump between value summaries, ontology layers, and the JSON export.
- The hero header highlights the primary objective plus key program metadata for quick executive reviews.

## Exporting updates
Use **Download JSON** to save the edited dataset. This is the canonical payload for future backend integration or ingestion into an ontology system.

## Business value workflow
1. Start with the primary objective at the top.
2. Review outcomes and KPIs in the semantic layer.
3. Review risks, milestones, and deliverables.
4. Use action types to align next steps and governance interventions.
