# Client Success Control Tower — Conversion Spec

## 1) Updated sitemap + navigation model

**Primary left navigation (default landing = Home / Executive Summary):**
1. Home / Executive Summary (landing)
2. Portfolio (Accounts)
3. Engagement Health
4. Delivery Reliability
5. Value Realization
6. Risks & Change Control
7. Renewal & Collections
8. Governance
9. Action Center / Inbox
10. Ontology Explorer (existing graph UI preserved & improved)
11. Admin / Settings (optional)

**Role-based landing (same app, different default module):**
- Executive Sponsor → Home, Value Realization, Decisions Needed, Risks
- Engagement Lead → Engagement Health, Delivery Reliability, Action Center
- Delivery Manager → Delivery Reliability, Risks & Change Control, Change Requests
- Finance/Ops → Renewal & Collections, Invoices/Payments

**Persistent global patterns:**
- Left nav + module tabs (optional within module) + global filters bar (Region, Segment, Account, Engagement, Date range)
- Right-side sticky Object View panel (deep-link supported)

---

## 2) Wireframe-level layouts for each module page

> **Global module layout pattern**
> - **Top bar:** global filters (Region, Segment, Account, Engagement, Date range)
> - **Row 1:** KPI cards (4–8)
> - **Row 2:** 2–4 key visuals (chart tiles)
> - **Row 3:** Primary data table (sortable + filterable)
> - **Right panel:** Object View (sticky) opens on row click

### 2.1 Home / Executive Summary (landing)
**Layout**
- **Top bar:** global filters
- **KPI row:** #Active Accounts, Avg Account Health, Avg Renewal Risk, #At-Risk Milestones, #Open High Severity Risks, #Overdue Invoices, Outcomes On Track
- **Visuals row:**
  - Scatter: estimated_ltv vs renewal_risk_score (size = total_contract_value_to_date; color = segment_tag)
  - Trend: engagement_health_score over time (or “no history” state)
- **Table:** Accounts needing attention (high value + high risk, or declining health)
- **Right panel:** Account Object View

### 2.2 Portfolio (Accounts)
**Layout**
- KPI row: #Accounts, Avg Health, Avg Renewal Risk, Total Contract Value
- Visuals: Health vs Risk quadrant; Regional breakdown bar
- Table: account_name, industry, region, segment_tag, health_score, renewal_risk_score, total_contract_value_to_date, estimated_ltv
- Right panel: Account Object View

### 2.3 Engagement Health (consulting_engagement)
**Layout**
- KPI row: Engagement Health Score, Completion Rate, Upcoming Renewal Date, Sponsor Sentiment, Open Risks (by severity), On-time Milestone Rate
- Visuals: Health composition (milestones + confidence + risks + sentiment + invoices), Trend of engagement_health_score
- Table: Engagements with health + renewal signals
- Right panel: Engagement Object View

### 2.4 Delivery Reliability (workstream + milestone)
**Layout**
- KPI row: milestone_on_time_rate by workstream, #at_risk_flag milestones, #late milestones, avg confidence_level, #client signoffs pending
- Visuals: Gantt-style timeline (planned vs due vs completed); Histogram of slippage days
- Table: milestones with due_date, confidence_level, blocker_summary, owner, signoff status
- Right panel: Milestone Object View
- CTAs: Replan Milestone, Escalate Risk/Issue

### 2.5 Value Realization (outcome + kpi_metric + kpi_snapshot)
**Layout**
- KPI row: #Outcomes On Track, Avg progress_pct, #Metrics improving, #Metrics stalled, Data freshness
- Visuals: KPI line charts (baseline vs target vs latest snapshots), Outcome roll-up progress bar (with explain)
- Table: outcomes with owner, target_date, status, progress_pct, linked deliverables
- Right panel: Outcome Object View

### 2.6 Risks & Change Control (risk_issue + change_request)
**Layout**
- KPI row: Open risks by severity, Open issues by severity, Avg age, #Escalations pending, #Change requests proposed
- Visuals: Risk matrix (severity x likelihood), Aging chart
- Tables: Risk/issue register; Change requests (impact_on_scope/timeline/fees + status)
- Right panel: Risk/Issue Object View or Change Request Object View
- CTAs: Escalate Risk/Issue, Initiate Change Request

### 2.7 Renewal & Collections (invoice + payment + renewal_date)
**Layout**
- KPI row: Renewals in 30/60/90 days, Overdue invoices count, Total overdue amount, Avg days past due, Payment failures
- Visuals: Renewal timeline, Overdue by account
- Tables: invoices (due_date, amount_total, status, days_past_due); payments (failure_reason)
- Right panel: Invoice/Payment Object View

### 2.8 Governance (meeting + decision)
**Layout**
- KPI row: Meetings this period, Attendance avg, Action items open, Sentiment avg, Decisions needed
- Tables: meetings (type, scheduled/occurred, sentiment, notes_link); decisions (type, impact_summary, decided_by)
- Right panel: Meeting/Decision Object View
- CTAs: Schedule Steering Committee, Publish Exec Readout

### 2.9 Action Center / Inbox
**Layout**
- KPI row: total pending actions, SLA breaches, critical blockers
- Tabs / queues:
  - At-risk milestones due soon
  - High severity risks open past threshold
  - Renewal upcoming + collections issues
  - Decisions needed
- Table: rows with object + risk context + CTA buttons
- Right panel: Object View + Action side sheet

### 2.10 Ontology Explorer (existing graph preserved)
**Layout**
- Graph explorer as-is
- Add: type quick switcher, “Used in Modules” badges, search across types/instances, pin types

---

## 3) Component inventory (new vs reused) + behaviors

**Reused (existing design language):**
- App shell, sidebar, top header pattern, cards, badges, buttons, inputs, tables
- Object View drawer pattern (adapts current record view concept)
- Derived “Explain” panel style (computed_at + explanation_json)

**New components:**
- Global Filters Bar (sticky top of module)
- KPI Card Row (compact, consistent with existing cards)
- Chart Tiles (scatter, line, gantt, histogram, matrix)
- Right-side Object View Panel (multi-tab)
- Action Side Sheet (governed actions + confirmation)
- Evidence Link list (opens new tab + prominence)
- Data Quality Badge (missing IDs, stale KPI snapshot)

**Interaction behaviors:**
- Row click → opens Object View in right panel (deep-link via route + query)
- “Explain” icon next to derived fields → popover with computed_at + explanation_json
- Evidence links open in new tab; highlighted section in Object View
- CTAs open side sheet with prefilled parameters + confirmation

---

## 4) Data-binding map (object types, links, derived values)

**Global filters**
- client_account: region, segment_tag
- consulting_engagement: engagement_id, renewal_date
- Date range → applied to kpi_snapshot.observed_at, meeting.occurred_at, milestone.due_date

**Home / Executive Summary**
- KPI cards:
  - #Active Accounts → client_account.account_status
  - Avg Account Health → derived: client_account.health_score
  - Avg Renewal Risk → derived: client_account.renewal_risk_score
  - #At-Risk Milestones → derived: milestone.at_risk_flag
  - #Open High Severity Risks → risk_issue.severity/status
  - #Overdue Invoices → invoice.status + days_past_due
  - Outcomes On Track → derived: outcome.progress_pct
- Scatter: client_account.estimated_ltv vs derived renewal_risk_score (size total_contract_value_to_date, color segment_tag)
- Trend: consulting_engagement.engagement_health_score (derived history via kpi_snapshot or computed history)
- Table: client_account + derived health/risk + segment_tag

**Portfolio (Accounts)**
- Table columns: client_account.* + derived health_score + derived renewal_risk_score + derived segment_tag

**Engagement Health**
- KPIs: consulting_engagement.engagement_health_score (derived), milestone on-time rate (derived), risk counts (risk_issue), sponsor sentiment (stakeholder.sentiment_score)
- Visual: health composition uses milestone, risk_issue, stakeholder, invoice signals
- Table: consulting_engagement + derived engagement_health_score + renewal_date

**Delivery Reliability**
- KPIs: workstream.milestone_on_time_rate (derived), milestone.at_risk_flag (derived)
- Visuals: milestone planned/due/completed dates; slippage days (derived from milestone.due_date vs completed_date)
- Table: milestone fields + owner_team_member_id + client_signoff_required_flag

**Value Realization**
- KPIs: outcome.progress_pct (derived), kpi_snapshot recency
- Visuals: kpi_metric + kpi_snapshot (baseline, target, latest)
- Table: outcome + progress_pct + target_date

**Risks & Change Control**
- KPIs: risk_issue severity + age; change_request status
- Visuals: risk_issue severity x likelihood; risk_issue age by opened_at
- Tables: risk_issue + change_request

**Renewal & Collections**
- KPIs: consulting_engagement.renewal_date; invoice.status + days_past_due; payment.status/failure_reason
- Visuals: renewal timeline (consulting_engagement.renewal_date), overdue by account (invoice)
- Tables: invoice + payment

**Governance**
- KPIs: meeting counts, attendance, sentiment; decisions needed (decision types tied to blocked milestones/risks)
- Tables: meeting, decision

**Action Center**
- Queues derived from: milestone.at_risk_flag, risk_issue severity/age, engagement renewal_date + invoice issues, milestones blocked by decision
- Actions: kinetic_layer.action_types (writeback records + action_log)

**Ontology Explorer**
- Uses semantic_layer.object_types + link_types + instances
- “Used in Modules” badges driven by mapping above

---

## 5) Action flows (inputs, validation, writeback, audit log)

**Pattern**
1. User selects object → Action button in table or Object View
2. Side sheet opens with prefilled parameters from object
3. Validation: required fields, date sanity, object_id presence
4. Confirm → writeback to action_log + related object update
5. Toast + audit log entry

**Action specifics**
- **replan_milestone**: inputs milestone_id, new_due_date, updated_acceptance_criteria, rationale → update milestone due_date + acceptance_criteria + action_log entry
- **schedule_steering_committee**: inputs engagement_id, proposed_times, agenda_summary, required_stakeholder_ids → create meeting draft + action_log entry
- **escalate_risk_issue**: inputs risk_issue_id, escalation_summary, requested_decision_by_date → update risk_issue status/escalation metadata + action_log entry
- **initiate_change_request**: inputs sow_id, description, impact_on_scope/timeline/fees → create change_request + action_log
- **publish_exec_readout**: inputs engagement_id, reporting_period → create deliverable or meeting note reference + action_log
- **run_value_realization_workshop**: inputs engagement_id, outcome_ids, required_data_sources, workshop_date → create meeting + update kpi_metric definitions + action_log

---

## 6) Edge cases + UX handling

- Missing IDs: show “Data issue” badge; allow view with fallback to name/title
- Missing derived values: compute using kinetic functions; if still missing show “No derived value” + explain popover disabled
- Stale KPI snapshots: show “Stale” badge when observed_at outside filter range
- No history for trend: show empty-state with current value + prompt to add snapshots
- Broken evidence links: show warning + allow copy URL
- Empty tables: show guidance CTA (“Add data” or “Connect source”)

---

## 7) React/TypeScript component hierarchy + routes + mock queries

### Routes
- `/` → Home (Executive Summary)
- `/portfolio` → Portfolio (Accounts)
- `/engagement-health` → Engagement Health
- `/delivery` → Delivery Reliability
- `/value` → Value Realization
- `/risks` → Risks & Change Control
- `/renewals` → Renewal & Collections
- `/governance` → Governance
- `/actions` → Action Center
- `/ontology` → Ontology Explorer
- `/admin` → Admin / Settings (optional)
- `/object/:type/:id` → Deep-link Object View

### Component tree (high level)
- `AppShell`
  - `TopHeader`
  - `SidebarNav`
  - `ModuleLayout`
    - `GlobalFiltersBar`
    - `KpiRow`
      - `KpiCard`
    - `VisualGrid`
      - `ChartCard` (Scatter/Line/Gantt/Matrix)
    - `PrimaryTable`
    - `ObjectViewPanel` (sticky)
      - `ObjectHeader`
      - `Tabs`
        - `OverviewTab`
        - `RelationshipsTab`
        - `TimelineTab`
        - `EvidenceTab`
        - `ActionsTab`
    - `ActionSideSheet`

### Object View template (per object type)
- `client_account`: engagements, stakeholders, invoices/payments, renewal signals
- `consulting_engagement`: workstreams, milestones, risks/issues, meetings/decisions, outcomes
- `workstream`: milestones, on-time rate, owner, risk rollup
- `milestone`: acceptance criteria, signoff, blockers, linked deliverables; actions: replan, escalate
- `outcome`: linked metrics, progress_pct, deliverables; action: value workshop
- `invoice/payment`: collections status + relationship context
- `meeting/decision`: governance trail + evidence links

### Mock query/pseudocode (data binding)
```ts
// Example: Portfolio table
const accounts = useObjects('client_account');
const rows = accounts.map((acct) => ({
  ...acct,
  health_score: getDerived('client_account', acct.account_id, 'health_score'),
  renewal_risk_score: getDerived('client_account', acct.account_id, 'renewal_risk_score'),
  segment_tag: getDerived('client_account', acct.account_id, 'segment_tag'),
}));

// Example: Object View deep-link
const { type, id } = useParams();
const record = useObjectById(type, id);
const relationships = useLinks(type, id);
```

---

## Notes on preserving existing UI design language
- Continue to use the existing card, badge, button, and layout tokens.
- Only extend with consistent variants for charts, tabs, and right-side panel.
- Keep Ontology Explorer graph as-is, add the quick switcher + badges without redesigning the core map.
