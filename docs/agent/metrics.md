# Metrics

## North-star metric
- Definition: Owners can identify the most profitable segment and the next focus in under 15 seconds.
- How measured: Manual timing in internal usability sessions until the owner names the segment + focus; later via event timing once instrumentation exists.
- Owner: Rick

## Funnel metrics
- Lead conversion rate: `count(lead.status = "Converted") / count(leads)`.
- Lead → deal coverage: `count(leads with lead_has_deal link or matching deal.lead_id) / count(leads)`.
- Deal win rate: `count(deal.status = "Won") / count(deals where status in ["Won","Lost"])`.
- Activation rate: `count(client_account.lifecycle_stage in ["Activated","Retained"]) / count(client_account.account_status = "Active")`.
- Retention rate: `count(client_account.lifecycle_stage = "Retained") / count(client_account.account_status = "Active")`.
- Revenue efficiency: `ltv_cac_ratio`, `cac_payback_months`, and `gross_profit` (see below).

## Event taxonomy
- Not yet instrumented (local-only). Track manually for internal launch.

## Dashboards / links
- Home / Owner Summary: LTV:CAC, profit leader, spend alignment, attention list.
- Leads: pipeline volume + expected value.
- Deals: pipeline volume + win rate proxy.
- Customers: segment profitability + LTV:CAC.

## Revenue efficiency definitions
- `ltv_cac_ratio`: `estimated_ltv / customer_acquisition_cost` (null if either is missing or CAC <= 0).
- `gross_profit`: `estimated_ltv * gross_margin_pct`.
- `cac_payback_months`: `customer_acquisition_cost / (avg_monthly_revenue * gross_margin_pct)`.
- `ltv_at_risk`: `estimated_ltv * churn_risk_score / 100`.
- Profit share by segment: `sum(gross_profit by segment) / sum(gross_profit)`.
- CAC share by segment: `sum(customer_acquisition_cost by segment) / sum(customer_acquisition_cost)`.
- Spend alignment delta: `profit_share - cac_share` (positive = underfunded, negative = overfunded).
