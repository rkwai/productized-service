# User Guide

## Getting started
1. Run a static web server (example below).
2. Open the browser at `http://localhost:8000`.

```bash
python -m http.server 8000
```

## Roles
- **Admin**: Full access including config edits and workflow execution.
- **Operator**: Edit data and run workflows.
- **Viewer**: Read-only access.

Use the role selector in the header to switch roles.

## Navigating the cockpit
- **Executive Overview**: Portfolio health, renewal risk, and attention accounts.
- **Accounts**: Account list with health and renewal signals.
- **Engagements**: Delivery reliability and engagement details.
- **Outcomes & KPIs**: Outcome progress and KPI summaries.
- **Risks & Issues**: Central risk log with escalation readiness.
- **Action Center**: Run workflows and track action logs.
- **Ontology Studio**: Edit and version ontology configuration.
- **Audit & Activity**: Track edits and workflow executions.

## Editing data
- Use inline forms to edit object records.
- New records can be added from list pages.
- All updates auto-save locally.

## Explainability
Each derived score includes a panel describing the contributing signals and the timestamp of computation.

## Exporting updates
Use **Download JSON** to export the full cockpit state (config + instances + derived values + action log).
