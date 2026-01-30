export const initialData = {
  ontology_template_id: "generic_business_loop_v1",
  client_metadata: {
    company_name: "{{COMPANY_NAME}}",
    fde_lead: "{{FDE_NAME}}",
    primary_objective:
      "Increase renewal and expansion by improving milestone delivery reliability and measurable client outcomes (value realization) [User Query]",
    deployment_timeline: "10-day rapid prototype",
  },
  semantic_layer: {
    object_types: [
      {
        id: "client_account",
        description:
          "Paying customer organization; anchor for revenue, engagement history, renewal likelihood, and realized value.",
        properties: [
          "account_id",
          "account_name",
          "industry",
          "region",
          "account_status",
          "created_date",
          "segment_tag",
          "health_score",
          "renewal_risk_score",
          "total_contract_value_to_date",
          "estimated_ltv",
        ],
      },
      {
        id: "stakeholder",
        description:
          "Client-side people involved in sponsorship, decision-making, sign-off, and success measurement.",
        properties: [
          "stakeholder_id",
          "account_id",
          "name",
          "email",
          "title",
          "role_type",
          "influence_level",
          "is_exec_sponsor",
          "is_day_to_day_owner",
          "last_contacted_at",
          "sentiment_score",
        ],
      },
      {
        id: "team_member",
        description:
          "Internal consulting team member. Used for ownership and accountability (not for hours/utilization).",
        properties: [
          "team_member_id",
          "name",
          "role",
          "practice_area",
          "location",
          "active_flag",
        ],
      },
      {
        id: "consulting_engagement",
        description:
          "The active consulting relationship (program) with defined success criteria, governance cadence, and commercial terms.",
        properties: [
          "engagement_id",
          "account_id",
          "engagement_name",
          "status",
          "start_date",
          "end_date",
          "engagement_value",
          "billing_model",
          "renewal_date",
          "success_criteria_summary",
          "executive_sponsor_stakeholder_id",
          "engagement_lead_team_member_id",
          "governance_cadence",
          "engagement_health_score",
        ],
      },
      {
        id: "statement_of_work",
        description:
          "Contractual scope + assumptions + deliverables + milestone plan. Provides the baseline against which change requests are evaluated.",
        properties: [
          "sow_id",
          "engagement_id",
          "effective_date",
          "scope_summary",
          "assumptions",
          "out_of_scope_summary",
          "acceptance_process",
          "version",
          "status",
        ],
      },
      {
        id: "workstream",
        description:
          "A strategic track within the engagement (e.g., Operating Model, Data Strategy, Change Management). Used to organize milestones and outcomes.",
        properties: [
          "workstream_id",
          "engagement_id",
          "name",
          "owner_team_member_id",
          "status",
          "priority",
        ],
      },
      {
        id: "milestone",
        description:
          "A committed checkpoint with explicit acceptance criteria and client sign-off. Primary unit for delivery performance.",
        properties: [
          "milestone_id",
          "workstream_id",
          "name",
          "description",
          "status",
          "planned_date",
          "due_date",
          "completed_date",
          "acceptance_criteria",
          "owner_team_member_id",
          "client_signoff_required_flag",
          "client_signoff_date",
          "confidence_level",
          "blocker_summary",
        ],
      },
      {
        id: "deliverable",
        description:
          "A tangible artifact shipped to the client (readout, roadmap, model, recommendation deck, implementation plan).",
        properties: [
          "deliverable_id",
          "milestone_id",
          "deliverable_type",
          "title",
          "status",
          "submitted_at",
          "approved_at",
          "version",
          "feedback_summary",
          "quality_score",
          "evidence_link",
        ],
      },
      {
        id: "task",
        description:
          "A concrete task or follow-up required to advance a milestone or outcome.",
        properties: [
          "task_id",
          "engagement_id",
          "name",
          "description",
          "status",
          "due_date",
          "owner_team_member_id",
          "priority",
          "notes",
        ],
      },
      {
        id: "decision",
        description:
          "A formal client/program decision that unblocks progress or commits the client to a path (scope, prioritization, operating model, investment).",
        properties: [
          "decision_id",
          "engagement_id",
          "decision_date",
          "decision_title",
          "decision_summary",
          "decided_by_stakeholder_id",
          "decision_type",
          "impact_summary",
          "evidence_link",
        ],
      },
      {
        id: "risk_issue",
        description:
          "Risks and issues that threaten milestones or outcomes (dependencies, resourcing, stakeholder alignment, data access, change resistance).",
        properties: [
          "risk_issue_id",
          "engagement_id",
          "type",
          "status",
          "severity",
          "likelihood",
          "opened_at",
          "target_resolution_date",
          "resolved_at",
          "owner_team_member_id",
          "mitigation_plan",
          "impact_summary",
        ],
      },
      {
        id: "change_request",
        description:
          "Formal request to change scope/timeline/outputs relative to the SOW baseline (protects outcomes and delivery reliability).",
        properties: [
          "change_request_id",
          "sow_id",
          "requested_at",
          "requested_by_stakeholder_id",
          "description",
          "impact_on_scope",
          "impact_on_timeline",
          "impact_on_fees",
          "status",
          "approved_at",
        ],
      },
      {
        id: "outcome",
        description:
          "A business result the engagement aims to achieve. Outcomes are measured via one or more KPIs and are central to renewal/expansion.",
        properties: [
          "outcome_id",
          "engagement_id",
          "name",
          "description",
          "status",
          "target_date",
          "value_hypothesis",
          "baseline_summary",
          "target_summary",
          "owner_stakeholder_id",
        ],
      },
      {
        id: "kpi_metric",
        description:
          "Definition of a measurable KPI tied to one or more outcomes (with unit, definition, and target).",
        properties: [
          "metric_id",
          "outcome_id",
          "name",
          "definition",
          "unit",
          "data_source_system",
          "baseline_value",
          "target_value",
          "measurement_cadence",
        ],
      },
      {
        id: "kpi_snapshot",
        description:
          "Point-in-time KPI observation used to show progress and value realization over time.",
        properties: [
          "snapshot_id",
          "metric_id",
          "observed_at",
          "value",
          "confidence_note",
          "evidence_link",
        ],
      },
      {
        id: "meeting",
        description:
          "Governance artifact (SteerCo, weekly status, working session) used to track cadence, alignment, and follow-through.",
        properties: [
          "meeting_id",
          "engagement_id",
          "meeting_type",
          "scheduled_at",
          "occurred_at",
          "owner_team_member_id",
          "attendees_count",
          "notes_link",
          "action_items_count",
          "sentiment_score",
        ],
      },
      {
        id: "invoice",
        description:
          "Billing artifact supporting collections and renewal readiness signals (e.g., overdue invoices correlate with churn/renewal risk).",
        properties: [
          "invoice_id",
          "account_id",
          "engagement_id",
          "invoice_date",
          "due_date",
          "amount_total",
          "status",
          "days_past_due",
        ],
      },
      {
        id: "payment",
        description:
          "Cash collection events tied to invoices; includes failure reasons which can impact relationship health.",
        properties: [
          "payment_id",
          "invoice_id",
          "account_id",
          "paid_at",
          "amount",
          "status",
          "failure_reason",
        ],
      },
    ],
    link_types: [
      {
        id: "account_has_stakeholder",
        from: "client_account",
        to: "stakeholder",
        description: "Associates client stakeholders with the account.",
      },
      {
        id: "account_has_engagement",
        from: "client_account",
        to: "consulting_engagement",
        description: "Connects the account to its engagements for lifecycle rollups.",
      },
      {
        id: "engagement_governed_by_sow",
        from: "consulting_engagement",
        to: "statement_of_work",
        description: "Defines the contractual baseline scope and acceptance process.",
      },
      {
        id: "engagement_has_workstream",
        from: "consulting_engagement",
        to: "workstream",
        description: "Organizes delivery into strategic tracks.",
      },
      {
        id: "workstream_has_milestone",
        from: "workstream",
        to: "milestone",
        description: "Breaks work into committed checkpoints.",
      },
      {
        id: "milestone_produces_deliverable",
        from: "milestone",
        to: "deliverable",
        description: "Links checkpoints to shipped artifacts.",
      },
      {
        id: "deliverable_supports_outcome",
        from: "deliverable",
        to: "outcome",
        description: "Connects artifacts to intended business results (traceability from work to value).",
      },
      {
        id: "milestone_supports_outcome",
        from: "milestone",
        to: "outcome",
        description: "Links milestones directly to the outcomes they unlock.",
      },
      {
        id: "outcome_measured_by_metric",
        from: "outcome",
        to: "kpi_metric",
        description: "Maps outcomes to concrete KPI definitions.",
      },
      {
        id: "outcome_has_task",
        from: "outcome",
        to: "task",
        description: "Tracks follow-up tasks required to update or advance outcomes.",
      },
      {
        id: "metric_has_snapshot",
        from: "kpi_metric",
        to: "kpi_snapshot",
        description: "Stores time series observations of KPI values.",
      },
      {
        id: "engagement_has_meeting",
        from: "consulting_engagement",
        to: "meeting",
        description: "Tracks governance cadence and alignment.",
      },
      {
        id: "meeting_results_in_decision",
        from: "meeting",
        to: "decision",
        description: "Captures formal decisions that unlock progress.",
      },
      {
        id: "engagement_has_risk_issue",
        from: "consulting_engagement",
        to: "risk_issue",
        description: "Central risk/issue log for delivery and outcome threats.",
      },
      {
        id: "sow_has_change_request",
        from: "statement_of_work",
        to: "change_request",
        description: "Captures scope/timeline/fee changes relative to baseline.",
      },
      {
        id: "engagement_billed_via_invoice",
        from: "consulting_engagement",
        to: "invoice",
        description: "Connects engagement to billing artifacts for collections and renewal readiness.",
      },
      {
        id: "invoice_paid_by_payment",
        from: "invoice",
        to: "payment",
        description: "Connects invoices to cash collection and failures.",
      },
      {
        id: "owned_by_team_member",
        from: "milestone",
        to: "team_member",
        description:
          "Assigns accountability for milestone delivery (without time tracking).",
      },
    ],
  },
  kinetic_layer: {
    functions: [
      {
        id: "calculate_engagement_health",
        logic:
          "Health score derived from: milestone on-time rate + average milestone confidence + open high-severity risks + stakeholder sentiment + overdue invoice flags.",
        output: "derived_property:consulting_engagement.engagement_health_score",
      },
      {
        id: "milestone_delivery_reliability",
        logic:
          "On-time rate = count(milestones completed_date <= due_date) / count(milestones completed). Also compute slippage days for late milestones.",
        output: "derived_property:workstream.milestone_on_time_rate",
      },
      {
        id: "identify_at_risk_milestones",
        logic:
          "Flag milestones as at-risk if (confidence_level low OR blocker_summary present) AND due_date within threshold window; amplify if linked risks/issues are high severity.",
        output: "derived_property:milestone.at_risk_flag",
      },
      {
        id: "track_outcome_progress",
        logic:
          "Outcome progress computed by comparing latest kpi_snapshot.value against kpi_metric.baseline_value and target_value; roll up across metrics for an overall outcome_progress_pct.",
        output: "derived_property:outcome.progress_pct",
      },
      {
        id: "calculate_outcome_confidence",
        logic:
          "Outcome confidence score derived from KPI coverage, update recency, and evidence completeness to communicate data trustworthiness.",
        output: "derived_property:outcome.confidence_score",
      },
      {
        id: "value_realization_signal",
        logic:
          "Value realization = count(outcomes improving toward target) weighted by stakeholder sentiment and presence of signed-off deliverables supporting those outcomes.",
        output: "derived_property:client_account.health_score",
      },
      {
        id: "renewal_risk_scoring",
        logic:
          "Renewal risk model/heuristic using: engagement_health_score trend, missed milestones, unresolved high severity risks, negative sponsor sentiment, and collections issues near renewal_date.",
        output: "derived_property:client_account.renewal_risk_score",
      },
      {
        id: "segment_accounts_by_value_and_risk",
        logic:
          "Segment by engagement_value / estimated_ltv and renewal_risk_score into cohorts (e.g., High value + High risk for executive attention).",
        output: "derived_property:client_account.segment_tag",
      },
    ],
    action_types: [
      {
        id: "replan_milestone",
        description:
          "Governed action to adjust milestone plan (due date, acceptance criteria, dependencies) with transparent rationale and client acknowledgment.",
        parameters: [
          "milestone_id",
          "new_due_date",
          "updated_acceptance_criteria",
          "rationale",
        ],
        side_effects: [
          "update_project_plan",
          "notify_engagement_lead",
          "post_update_to_governance_channel",
        ],
      },
      {
        id: "schedule_steering_committee",
        description:
          "Triggers an executive governance meeting when health declines or a key decision is blocked.",
        parameters: [
          "engagement_id",
          "proposed_times",
          "agenda_summary",
          "required_stakeholder_ids",
        ],
        side_effects: [
          "create_calendar_event",
          "notify_exec_sponsor",
          "attach_latest_exec_readout",
        ],
      },
      {
        id: "escalate_risk_issue",
        description:
          "Escalates a high-severity risk/issue to sponsor with mitigation ask and decision request.",
        parameters: [
          "risk_issue_id",
          "escalation_summary",
          "requested_decision_by_date",
        ],
        side_effects: [
          "notify_sponsor",
          "log_escalation_event",
          "create_followup_meeting_task",
        ],
      },
      {
        id: "initiate_change_request",
        description:
          "Formalizes scope/timeline/fee changes when outcomes are threatened or assumptions change.",
        parameters: [
          "sow_id",
          "description",
          "impact_on_scope",
          "impact_on_timeline",
          "impact_on_fees",
        ],
        side_effects: [
          "create_change_request_record",
          "notify_sales_ops_or_finance",
          "request_client_approval",
        ],
      },
      {
        id: "publish_exec_readout",
        description:
          "Generates and distributes an executive update: milestones, risks, decisions needed, and outcome/KPI progress.",
        parameters: [
          "engagement_id",
          "reporting_period_start",
          "reporting_period_end",
          "distribution_list",
        ],
        side_effects: [
          "create_document",
          "send_to_stakeholders",
          "archive_to_knowledge_base",
        ],
      },
      {
        id: "run_value_realization_workshop",
        description:
          "Aligns stakeholders on outcome definitions, KPI baselines, targets, and evidence sources to make value measurable and defensible.",
        parameters: [
          "engagement_id",
          "outcome_ids",
          "required_data_sources",
          "workshop_date",
        ],
        side_effects: [
          "create_meeting",
          "update_kpi_metric_definitions",
          "log_agreed_baselines_and_targets",
        ],
      },
      {
        id: "request_kpi_update",
        description:
          "Requests an updated KPI snapshot or evidence refresh to keep value realization data current.",
        parameters: [
          "outcome_id",
          "metric_ids",
          "requested_by",
          "requested_due_date",
          "message",
        ],
        side_effects: [
          "notify_kpi_data_owner",
          "create_followup_task",
          "log_kpi_update_request",
        ],
      },
    ],
  },
  data_integration_mapping: {
    sources: [
      "CRM (Salesforce/HubSpot) -> client_account, stakeholder, consulting_engagement (commercial metadata)",
      "Document repositories (Google Drive/SharePoint/Confluence) -> deliverable.evidence_link, statement_of_work, exec readouts",
      "Project/Governance tools (Asana/Jira/Smartsheet) -> workstream, milestone, risk_issue, change_request",
      "Comms/Calendar (Google Calendar/Outlook, Teams/Slack) -> meeting metadata + governance cadence signals",
      "Survey/Feedback (Qualtrics/Delighted/Forms) -> stakeholder sentiment, deliverable quality feedback",
      "Billing/Finance (Stripe/NetSuite/QuickBooks) -> invoice, payment",
      "Client KPI sources (client BI dashboards, exports, agreed system-of-record) -> kpi_snapshot",
    ],
    pipeline_tool:
      "Pipeline Builder for automated semantic hydration with incremental syncs (milestones, deliverables, risks, KPI snapshots) and document metadata extraction",
  },
};
