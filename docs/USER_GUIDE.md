# User Guide

## Getting started
1. Install dependencies and start the Vite dev server.
2. Open the browser at `http://localhost:5173`.

```bash
npm install
npm run dev
```

## Roles
- **Admin**: Full access including config edits and workflow execution.
- **Operator**: Edit data and run workflows.
- **Viewer**: Read-only access.

Use the role selector in the header to switch roles.

## Navigating the cockpit
- **Home / Executive Summary**: Portfolio health, renewal risk, marketing efficiency, and attention accounts.
- **Portfolio (Accounts)**: Account list with health, LTV:CAC, and profitability signals by segment.
- **Engagement Health**: Delivery reliability, engagement health drivers, and renewal forecasts.
- **Delivery Reliability**: Workstreams, milestones, and escalation readiness.
- **Value Realization**: Outcomes and KPI progress with confidence scores.
- **Risks & Change Control**: Central risk log with severity/impact insights.
- **Renewal & Collections**: Renewal posture and overdue invoices.
- **Governance**: Governance cadence, decisions, and accountability.
- **Action Center / Inbox**: Run workflows and track action logs.
- **Ontology Explorer**: View the canonical ontology configuration.
- **Admin / Settings**: Update config metadata, instance data, and audit history.

## Editing data
- Use inline forms to edit object records.
- New records can be added from list pages.
- All updates auto-save locally.

## Revenue efficiency (LTV:CAC)
Executives can review marketing ROI and profit concentration directly in the Home and Portfolio views:
- **LTV:CAC ratio** is computed from `estimated_ltv` and `customer_acquisition_cost` on each account.
- **Most profitable segment** highlights where gross profit (LTV × margin %) concentrates.
- **CAC payback months** is estimated from average monthly revenue and margin.

Update CAC, margin, and monthly revenue fields in **Admin / Settings** to keep the model accurate.

## Explainability
Each derived score includes a panel describing the contributing signals and the timestamp of computation.

## Exporting updates
Use **Download JSON** to export the full cockpit state (config + instances + derived values + action log).
