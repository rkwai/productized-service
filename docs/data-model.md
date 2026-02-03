# Data Model (v1)

## Scope
This is the locked schema for the internal launch. It reflects the canonical ontology config and the fields used by the current analytics/UX.

## Core objects

### Lead (`lead`)
Required fields (analytics + workflow):
- `lead_id`
- `company_name`
- `stage`
- `status`
- `created_date`
- `owner_team_member_id`
- `expected_value`

Optional fields:
- `contact_name`, `contact_email`, `contact_title`, `phone`
- `source`
- `last_contacted_at`
- `next_step_summary`
- `segment_candidate`
- `notes`

Recommended values:
- `stage`: Lead → Qualified → Proposal → Negotiation → Won
- `status`: Open | Converted | Lost

### Deal (`deal`)
Required fields (analytics + workflow):
- `deal_id`
- `deal_name`
- `stage`
- `status`
- `amount`
- `expected_close_date`

Recommended linkage fields:
- `lead_id` (connects to lead)
- `account_id` (connects to customer once converted)

Optional fields:
- `probability`
- `closed_date`
- `next_step_summary`

Recommended values:
- `stage`: Discovery → Proposal → Negotiation → Closed Won | Closed Lost
- `status`: Open | Won | Lost

### Customer / Account (`client_account`)
Required fields (analytics + lifecycle):
- `account_id`
- `account_name`
- `account_status`
- `lifecycle_stage`
- `activation_status`
- `created_date`
- `estimated_ltv`
- `customer_acquisition_cost`
- `avg_monthly_revenue`
- `gross_margin_pct`

Optional fields:
- `industry`, `region`
- `segment_tag` (explicit segment label; used if provided)
- `health_score`, `renewal_risk_score`
- `total_contract_value_to_date`

Recommended values:
- `account_status`: Active | Paused | Churned
- `lifecycle_stage`: Onboarded | Activated | Retained
- `activation_status`: In progress | On track | At risk

### Activation program (`consulting_engagement`)
Required fields (activation tracking):
- `engagement_id`
- `account_id`
- `engagement_name`
- `status`
- `start_date`

Optional fields:
- `end_date`
- `engagement_value`
- `renewal_date`
- `success_criteria_summary`
- `executive_sponsor_stakeholder_id`
- `engagement_lead_team_member_id`
- `governance_cadence`
- `engagement_health_score`

### Workstreams + milestones (`workstream`, `milestone`)
Required fields (activation execution):
- `workstream`: `workstream_id`, `engagement_id`, `name`, `status`
- `milestone`: `milestone_id`, `workstream_id`, `name`, `status`, `due_date`

Optional fields:
- `milestone`: `planned_date`, `completed_date`, `acceptance_criteria`,
  `owner_team_member_id`, `client_signoff_required_flag`, `client_signoff_date`,
  `confidence_level`, `blocker_summary`

### Outcomes + KPIs (`outcome`, `kpi_metric`, `kpi_snapshot`)
Required fields (value tracking):
- `outcome`: `outcome_id`, `engagement_id`, `name`, `status`
- `kpi_metric`: `metric_id`, `outcome_id`, `name`, `baseline_value`, `target_value`, `unit`
- `kpi_snapshot`: `snapshot_id`, `metric_id`, `observed_at`, `value`

## Relationship essentials
- `lead_has_deal`: lead → deal
- `lead_converts_to_account`: lead → client_account
- `deal_converts_to_account`: deal → client_account
- `account_has_stakeholder`: client_account → stakeholder
- `engagement_has_workstream`: consulting_engagement → workstream
- `workstream_has_milestone`: workstream → milestone
- `outcome_measured_by_metric`: outcome → kpi_metric
- `metric_has_snapshot`: kpi_metric → kpi_snapshot

## Notes
- Keep IDs stable across imports so links remain intact.
- This schema is intentionally local-first and dependency-free.
