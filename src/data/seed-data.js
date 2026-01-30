export const seedInstances = {
  client_account: [
    {
      account_id: "acct_nova",
      account_name: "Nova Retail Group",
      industry: "Retail",
      region: "North America",
      account_status: "Active",
      created_date: "2023-04-15",
      segment_tag: "Strategic",
      health_score: 78,
      renewal_risk_score: 34,
      total_contract_value_to_date: 2400000,
      estimated_ltv: 8500000
    },
    {
      account_id: "acct_orbit",
      account_name: "Orbit Logistics",
      industry: "Logistics",
      region: "EMEA",
      account_status: "Active",
      created_date: "2024-01-12",
      segment_tag: "Growth",
      health_score: 62,
      renewal_risk_score: 48,
      total_contract_value_to_date: 950000,
      estimated_ltv: 4200000
    }
  ],
  stakeholder: [
    {
      stakeholder_id: "stake_001",
      account_id: "acct_nova",
      name: "Priya Singh",
      email: "priya.singh@nova.com",
      title: "Chief Data Officer",
      role_type: "Executive Sponsor",
      influence_level: "High",
      is_exec_sponsor: true,
      is_day_to_day_owner: false,
      last_contacted_at: "2024-10-01",
      sentiment_score: 0.72
    },
    {
      stakeholder_id: "stake_002",
      account_id: "acct_nova",
      name: "Jonas Petrov",
      email: "jonas.petrov@nova.com",
      title: "VP Supply Chain",
      role_type: "Business Owner",
      influence_level: "Medium",
      is_exec_sponsor: false,
      is_day_to_day_owner: true,
      last_contacted_at: "2024-10-08",
      sentiment_score: 0.64
    },
    {
      stakeholder_id: "stake_003",
      account_id: "acct_orbit",
      name: "Hannah Lee",
      email: "hannah.lee@orbit.com",
      title: "COO",
      role_type: "Executive Sponsor",
      influence_level: "High",
      is_exec_sponsor: true,
      is_day_to_day_owner: false,
      last_contacted_at: "2024-09-28",
      sentiment_score: 0.42
    }
  ],
  team_member: [
    {
      team_member_id: "tm_001",
      name: "Avery Chen",
      role: "Engagement Lead",
      practice_area: "Strategy",
      location: "NYC",
      active_flag: true
    },
    {
      team_member_id: "tm_002",
      name: "Luca Rossi",
      role: "Delivery Manager",
      practice_area: "Operations",
      location: "London",
      active_flag: true
    }
  ],
  consulting_engagement: [
    {
      engagement_id: "eng_001",
      account_id: "acct_nova",
      engagement_name: "Nova Omni-Channel Acceleration",
      status: "Active",
      start_date: "2024-06-01",
      end_date: "2025-02-28",
      engagement_value: 1800000,
      billing_model: "Fixed Fee",
      renewal_date: "2025-03-15",
      success_criteria_summary: "Improve fulfillment accuracy and reduce stockouts by 25%.",
      executive_sponsor_stakeholder_id: "stake_001",
      engagement_lead_team_member_id: "tm_001",
      governance_cadence: "Bi-weekly",
      engagement_health_score: 78
    },
    {
      engagement_id: "eng_002",
      account_id: "acct_orbit",
      engagement_name: "Orbit Predictive Logistics",
      status: "Active",
      start_date: "2024-03-20",
      end_date: "2024-12-10",
      engagement_value: 750000,
      billing_model: "Time & Materials",
      renewal_date: "2024-12-15",
      success_criteria_summary: "Reduce transportation cost per shipment by 12%.",
      executive_sponsor_stakeholder_id: "stake_003",
      engagement_lead_team_member_id: "tm_002",
      governance_cadence: "Weekly",
      engagement_health_score: 62
    }
  ],
  statement_of_work: [
    {
      sow_id: "sow_001",
      engagement_id: "eng_001",
      effective_date: "2024-05-20",
      scope_summary: "Omni-channel fulfillment strategy and roadmap.",
      assumptions: "Client will provide historical inventory data.",
      out_of_scope_summary: "Implementation of WMS changes.",
      acceptance_process: "Quarterly steering committee sign-off.",
      version: "v1.2",
      status: "Active"
    }
  ],
  workstream: [
    {
      workstream_id: "ws_001",
      engagement_id: "eng_001",
      name: "Inventory Visibility",
      owner_team_member_id: "tm_002",
      status: "On Track",
      priority: "High"
    },
    {
      workstream_id: "ws_002",
      engagement_id: "eng_001",
      name: "Store Replenishment",
      owner_team_member_id: "tm_001",
      status: "At Risk",
      priority: "High"
    },
    {
      workstream_id: "ws_003",
      engagement_id: "eng_002",
      name: "Routing Optimization",
      owner_team_member_id: "tm_002",
      status: "On Track",
      priority: "Medium"
    }
  ],
  milestone: [
    {
      milestone_id: "ms_001",
      workstream_id: "ws_001",
      name: "Inventory data audit",
      description: "Assess data completeness and accuracy.",
      status: "Completed",
      planned_date: "2024-07-01",
      due_date: "2024-07-15",
      completed_date: "2024-07-14",
      acceptance_criteria: "Audit report delivered.",
      owner_team_member_id: "tm_002",
      client_signoff_required_flag: true,
      client_signoff_date: "2024-07-20",
      confidence_level: "High",
      blocker_summary: ""
    },
    {
      milestone_id: "ms_002",
      workstream_id: "ws_002",
      name: "Replenishment playbook",
      description: "Define operating model for replenishment.",
      status: "In Progress",
      planned_date: "2024-09-01",
      due_date: "2024-10-10",
      completed_date: "",
      acceptance_criteria: "Playbook approved by sponsor.",
      owner_team_member_id: "tm_001",
      client_signoff_required_flag: true,
      client_signoff_date: "",
      confidence_level: "Low",
      blocker_summary: "Awaiting data access approval."
    },
    {
      milestone_id: "ms_003",
      workstream_id: "ws_003",
      name: "Routing model v1",
      description: "Baseline routing optimization model.",
      status: "Completed",
      planned_date: "2024-05-01",
      due_date: "2024-05-25",
      completed_date: "2024-06-02",
      acceptance_criteria: "Model accuracy > 85%.",
      owner_team_member_id: "tm_002",
      client_signoff_required_flag: false,
      client_signoff_date: "",
      confidence_level: "Medium",
      blocker_summary: ""
    }
  ],
  deliverable: [
    {
      deliverable_id: "del_001",
      milestone_id: "ms_001",
      deliverable_type: "Report",
      title: "Inventory Audit Findings",
      status: "Approved",
      submitted_at: "2024-07-14",
      approved_at: "2024-07-20",
      version: "v1",
      feedback_summary: "Solid findings with actionable gaps.",
      quality_score: 0.9,
      evidence_link: "https://docs.example.com/inventory-audit"
    },
    {
      deliverable_id: "del_002",
      milestone_id: "ms_003",
      deliverable_type: "Model",
      title: "Routing Model v1",
      status: "Approved",
      submitted_at: "2024-06-02",
      approved_at: "2024-06-10",
      version: "v1",
      feedback_summary: "Strong results with 88% accuracy.",
      quality_score: 0.86,
      evidence_link: "https://docs.example.com/routing-model"
    }
  ],
  decision: [
    {
      decision_id: "dec_001",
      engagement_id: "eng_001",
      decision_date: "2024-07-25",
      decision_title: "Approve inventory data uplift",
      decision_summary: "Client approved data cleanup initiative.",
      decided_by_stakeholder_id: "stake_001",
      decision_type: "Scope",
      impact_summary: "Adds two weeks of data prep.",
      evidence_link: "https://docs.example.com/steerco-0725"
    }
  ],
  risk_issue: [
    {
      risk_issue_id: "risk_001",
      engagement_id: "eng_001",
      type: "Risk",
      status: "Open",
      severity: "High",
      likelihood: "Medium",
      opened_at: "2024-09-05",
      target_resolution_date: "2024-10-20",
      resolved_at: "",
      owner_team_member_id: "tm_001",
      mitigation_plan: "Escalate data access request.",
      impact_summary: "Delays replenishment playbook delivery."
    },
    {
      risk_issue_id: "risk_002",
      engagement_id: "eng_002",
      type: "Issue",
      status: "Open",
      severity: "Medium",
      likelihood: "High",
      opened_at: "2024-08-10",
      target_resolution_date: "2024-09-30",
      resolved_at: "",
      owner_team_member_id: "tm_002",
      mitigation_plan: "Increase data collection frequency.",
      impact_summary: "Model training delayed."
    }
  ],
  change_request: [
    {
      change_request_id: "cr_001",
      sow_id: "sow_001",
      requested_at: "2024-09-12",
      requested_by_stakeholder_id: "stake_001",
      description: "Extend timeline for data remediation.",
      impact_on_scope: "Adds data cleanup deliverable.",
      impact_on_timeline: "+3 weeks",
      impact_on_fees: "+150k",
      status: "Proposed",
      approved_at: ""
    }
  ],
  outcome: [
    {
      outcome_id: "out_001",
      engagement_id: "eng_001",
      name: "Reduce stockouts",
      description: "Lower stockouts across top 50 stores.",
      status: "On Track",
      target_date: "2024-12-31",
      value_hypothesis: "Better inventory visibility cuts stockouts by 25%.",
      baseline_summary: "Current stockout rate at 12%.",
      target_summary: "Target stockout rate at 9%.",
      owner_stakeholder_id: "stake_002"
    },
    {
      outcome_id: "out_002",
      engagement_id: "eng_002",
      name: "Lower cost per shipment",
      description: "Improve routing efficiency.",
      status: "At Risk",
      target_date: "2024-11-30",
      value_hypothesis: "Routing optimization yields 12% cost savings.",
      baseline_summary: "Current cost index 100.",
      target_summary: "Target cost index 88.",
      owner_stakeholder_id: "stake_003"
    }
  ],
  kpi_metric: [
    {
      metric_id: "metric_001",
      outcome_id: "out_001",
      name: "Stockout rate",
      definition: "Percent of SKUs out of stock.",
      unit: "%",
      data_source_system: "Retail BI",
      baseline_value: 12,
      target_value: 9,
      measurement_cadence: "Monthly"
    },
    {
      metric_id: "metric_002",
      outcome_id: "out_002",
      name: "Cost index",
      definition: "Cost per shipment index.",
      unit: "index",
      data_source_system: "Logistics BI",
      baseline_value: 100,
      target_value: 88,
      measurement_cadence: "Monthly"
    }
  ],
  kpi_snapshot: [
    {
      snapshot_id: "snap_001",
      metric_id: "metric_001",
      observed_at: "2024-09-30",
      value: 10.8,
      confidence_note: "Data lagged 3 days.",
      evidence_link: "https://bi.example.com/stockouts"
    },
    {
      snapshot_id: "snap_002",
      metric_id: "metric_002",
      observed_at: "2024-09-30",
      value: 96,
      confidence_note: "Partial region coverage.",
      evidence_link: "https://bi.example.com/logistics"
    }
  ],
  task: [
    {
      task_id: "task_001",
      engagement_id: "eng_001",
      name: "Validate stockout KPI feed",
      description: "Confirm store-level feeds align with the agreed SKU list.",
      status: "In Progress",
      due_date: "2024-10-10",
      owner_team_member_id: "tm_001",
      priority: "High",
      notes: "Waiting on merchandising data exports."
    },
    {
      task_id: "task_002",
      engagement_id: "eng_001",
      name: "Finalize inventory baseline",
      description: "Lock the baseline snapshot for Q3 stockouts.",
      status: "Not Started",
      due_date: "2024-10-18",
      owner_team_member_id: "tm_002",
      priority: "Medium",
      notes: "Needs finance signoff."
    },
    {
      task_id: "task_003",
      engagement_id: "eng_002",
      name: "Refresh routing cost data",
      description: "Pull updated routing cost index from Logistics BI.",
      status: "At Risk",
      due_date: "2024-10-14",
      owner_team_member_id: "tm_003",
      priority: "High",
      notes: "Data access pending."
    }
  ],
  meeting: [
    {
      meeting_id: "mtg_001",
      engagement_id: "eng_001",
      meeting_type: "SteerCo",
      scheduled_at: "2024-10-05",
      occurred_at: "2024-10-05",
      owner_team_member_id: "tm_001",
      attendees_count: 12,
      notes_link: "https://docs.example.com/steerco-notes",
      action_items_count: 5,
      sentiment_score: 0.7
    }
  ],
  invoice: [
    {
      invoice_id: "inv_001",
      account_id: "acct_nova",
      engagement_id: "eng_001",
      invoice_date: "2024-08-01",
      due_date: "2024-08-31",
      amount_total: 450000,
      status: "Paid",
      days_past_due: 0
    },
    {
      invoice_id: "inv_002",
      account_id: "acct_orbit",
      engagement_id: "eng_002",
      invoice_date: "2024-07-15",
      due_date: "2024-08-14",
      amount_total: 210000,
      status: "Overdue",
      days_past_due: 45
    }
  ],
  payment: [
    {
      payment_id: "pay_001",
      invoice_id: "inv_001",
      account_id: "acct_nova",
      paid_at: "2024-08-20",
      amount: 450000,
      status: "Succeeded",
      failure_reason: ""
    }
  ]
};

export const seedLinks = [
  { id: "lnk_001", link_type: "account_has_stakeholder", from_id: "acct_nova", to_id: "stake_001" },
  { id: "lnk_002", link_type: "account_has_stakeholder", from_id: "acct_nova", to_id: "stake_002" },
  { id: "lnk_003", link_type: "account_has_stakeholder", from_id: "acct_orbit", to_id: "stake_003" },
  { id: "lnk_004", link_type: "account_has_engagement", from_id: "acct_nova", to_id: "eng_001" },
  { id: "lnk_005", link_type: "account_has_engagement", from_id: "acct_orbit", to_id: "eng_002" },
  { id: "lnk_006", link_type: "engagement_has_workstream", from_id: "eng_001", to_id: "ws_001" },
  { id: "lnk_007", link_type: "engagement_has_workstream", from_id: "eng_001", to_id: "ws_002" },
  { id: "lnk_008", link_type: "engagement_has_workstream", from_id: "eng_002", to_id: "ws_003" },
  { id: "lnk_009", link_type: "workstream_has_milestone", from_id: "ws_001", to_id: "ms_001" },
  { id: "lnk_010", link_type: "workstream_has_milestone", from_id: "ws_002", to_id: "ms_002" },
  { id: "lnk_011", link_type: "workstream_has_milestone", from_id: "ws_003", to_id: "ms_003" },
  { id: "lnk_012", link_type: "milestone_produces_deliverable", from_id: "ms_001", to_id: "del_001" },
  { id: "lnk_013", link_type: "milestone_produces_deliverable", from_id: "ms_003", to_id: "del_002" },
  { id: "lnk_014", link_type: "deliverable_supports_outcome", from_id: "del_001", to_id: "out_001" },
  { id: "lnk_015", link_type: "deliverable_supports_outcome", from_id: "del_002", to_id: "out_002" },
  { id: "lnk_016", link_type: "milestone_supports_outcome", from_id: "ms_001", to_id: "out_001" },
  { id: "lnk_017", link_type: "milestone_supports_outcome", from_id: "ms_002", to_id: "out_001" },
  { id: "lnk_018", link_type: "milestone_supports_outcome", from_id: "ms_003", to_id: "out_002" },
  { id: "lnk_019", link_type: "outcome_measured_by_metric", from_id: "out_001", to_id: "metric_001" },
  { id: "lnk_020", link_type: "outcome_measured_by_metric", from_id: "out_002", to_id: "metric_002" },
  { id: "lnk_021", link_type: "metric_has_snapshot", from_id: "metric_001", to_id: "snap_001" },
  { id: "lnk_022", link_type: "metric_has_snapshot", from_id: "metric_002", to_id: "snap_002" },
  { id: "lnk_023", link_type: "outcome_has_task", from_id: "out_001", to_id: "task_001" },
  { id: "lnk_024", link_type: "outcome_has_task", from_id: "out_001", to_id: "task_002" },
  { id: "lnk_025", link_type: "outcome_has_task", from_id: "out_002", to_id: "task_003" },
  { id: "lnk_026", link_type: "engagement_has_risk_issue", from_id: "eng_001", to_id: "risk_001" },
  { id: "lnk_027", link_type: "engagement_has_risk_issue", from_id: "eng_002", to_id: "risk_002" }
];
