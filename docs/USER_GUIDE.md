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
- **Home / Owner Summary**: Owner priorities (LTV:CAC, profit leader, LTV at risk), quick capture, priority focus (with run workflow buttons), segment ROI, spend alignment, and attention customers.
- **Leads**: Lead pipeline with stages, capture gaps, next steps, and quick actions to create deals.
- **Deals**: Opportunity pipeline with conversion stages, expected close dates, and quick actions to convert deals into customers.
- **Customers**: Customer list with lifecycle stage, activation status, quick actions for activation/retention, and profitability/spend alignment signals by segment.
- **Activation Health**: Activation reliability, health drivers, and retention forecasts.
- **Activation Milestones**: Workstreams, milestones, and escalation readiness.
- **Profitability Insights**: Outcomes and KPI progress with confidence scores.
- **Retention & Risks**: Central risk log with severity/impact insights.
- **Revenue & Retention**: Retention posture and overdue invoices.
- **Operations**: Operating cadence, decisions, and accountability.
- **Next Steps / Inbox**: Auto-ranked focus queue plus workflow runs and action logs.
- **Data Model**: View the canonical ontology configuration.
- **Settings**: Update config metadata, instance data, and audit history.

## Editing data
- Use inline forms to edit object records.
- New records can be added from list pages.
- Select a lead to quick-edit core fields in the right-side detail panel.
- All updates auto-save locally.

## Importing leads and deals
Use **Settings → Lead & deal imports** to upload CSV/JSON files or paste data directly.

Tips:
- Column names are case-insensitive (for example `company_name` or `Company Name`).
- Missing IDs will be generated, but add `lead_id` or `deal_id` to keep references stable.
- Deals can link to leads/customers with `lead_id` and `account_id`. If you include `account_name` or `lead_company`,
  the importer will attempt to match existing records.
- Use **Use CSV template** or **Use JSON template** in Settings to start from the recommended columns.

## Revenue efficiency (LTV:CAC)
Owners can review segment ROI and profit concentration directly in the Home and Customers views:
- **LTV:CAC ratio** is computed from `estimated_ltv` and `customer_acquisition_cost` on each account.
- **Most profitable segment** highlights where gross profit (LTV × margin %) concentrates.
- **CAC payback months** is estimated from average monthly revenue and margin.
- **Spend alignment** compares profit share to CAC share and assigns actions (Increase, Hold, Reduce).

Update CAC, margin, and monthly revenue fields in **Settings** to keep the model accurate.

## Segment profitability
Use **Profitability by segment** on the Customers page to:
- Identify which segment generates the highest gross profit.
- Compare LTV:CAC efficiency and payback speed side-by-side.
- Compare profit share vs CAC share and act on spend deltas.

The **Spend recommendation** callout on Home summarizes the top segment to fund based on profit share and LTV:CAC.

## Reloading the seed dataset
If you do not see the latest seed data, use **Settings → Reset changes** to clear local storage and reload the dataset from `src/data/seed-data.js`.

## Explainability
Each derived score includes a panel describing the contributing signals and the timestamp of computation.

## Exporting updates
Use **Download JSON** to export the full cockpit state (config + instances + derived values + action log).
