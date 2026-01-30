import { initialData } from "@/data/initial-data";
import { seedInstances, seedLinks } from "@/data/seed-data";
import { loadState, saveState } from "@/lib/storage";

const DEFAULT_ROLE = "Operator";

const clone = (value) => JSON.parse(JSON.stringify(value));

export const toTitle = (value) => value.replace(/_/g, " ");

export const formatDate = (value) => (value ? new Date(value).toLocaleDateString() : "—");

export const formatPercent = (value) => `${Math.round(value * 100)}%`;

const isPrimitive = (value) =>
  value === null || ["string", "number", "boolean"].includes(typeof value);

export const inferFieldType = (key, overrides = {}) => {
  if (overrides[key]) return overrides[key];
  if (key.endsWith("_date")) return "date";
  if (key.endsWith("_at")) return "datetime";
  if (key.endsWith("_flag") || key.startsWith("is_")) return "boolean";
  if (key.endsWith("_score") || key.endsWith("_rate") || key.startsWith("amount_") || key.includes("value")) {
    return "number";
  }
  if (key.endsWith("_id")) return "reference";
  if (key.endsWith("_link")) return "url";
  return "text";
};

export const groupBy = (items, keyFn) =>
  items.reduce((acc, item) => {
    const key = keyFn(item);
    if (!acc[key]) acc[key] = [];
    acc[key].push(item);
    return acc;
  }, {});

export const buildReferenceMap = (config, instances) => {
  const referenceMap = {};
  config.semantic_layer.object_types.forEach((objectType) => {
    const idField = objectType.properties.find((prop) => prop.endsWith("_id"));
    if (!idField) return;
    const options = instances[objectType.id] || [];
    referenceMap[idField] = { objectType, options, idField };
  });
  return referenceMap;
};

export const createEmptyRecord = (objectType) => {
  const record = {};
  objectType.properties.forEach((prop) => {
    record[prop] = "";
  });
  const idField = objectType.properties.find((prop) => prop.endsWith("_id"));
  if (idField) {
    record[idField] = `${objectType.id}_${Math.random().toString(36).slice(2, 8)}`;
  }
  return record;
};

export const generateAuditEntry = (entry, state) => {
  state.audit_log.unshift({
    id: `audit_${Date.now()}`,
    occurred_at: new Date().toISOString(),
    actor_role: state.role,
    ...entry,
  });
};

export const getDerived = (state, objectType, objectId, field) =>
  state.derived_values.find(
    (item) => item.object_type === objectType && item.object_id === objectId && item.field === field
  );

export const setDerived = (state, payload) => {
  const existingIndex = state.derived_values.findIndex(
    (item) =>
      item.object_type === payload.object_type &&
      item.object_id === payload.object_id &&
      item.field === payload.field
  );
  if (existingIndex === -1) {
    state.derived_values.push(payload);
  } else {
    state.derived_values[existingIndex] = payload;
  }
};

export const computeDerived = (state) => {
  const now = new Date().toISOString();
  const instances = state.instances;

  const milestonesByWorkstream = groupBy(instances.milestone || [], (m) => m.workstream_id);
  const engagementsByAccount = groupBy(instances.consulting_engagement || [], (e) => e.account_id);
  const workstreamsByEngagement = groupBy(instances.workstream || [], (w) => w.engagement_id);
  const outcomesByEngagement = groupBy(instances.outcome || [], (o) => o.engagement_id);
  const metricsByOutcome = groupBy(instances.kpi_metric || [], (m) => m.outcome_id);
  const snapshotsByMetric = groupBy(instances.kpi_snapshot || [], (s) => s.metric_id);
  const parseDate = (value) => (value ? new Date(value) : null);
  const latestDate = (values) =>
    values.reduce((latest, value) => {
      const parsed = parseDate(value);
      if (!parsed) return latest;
      if (!latest || parsed > latest) return parsed;
      return latest;
    }, null);
  const daysSince = (value) =>
    value ? Math.max(0, Math.round((Date.now() - value.getTime()) / (1000 * 60 * 60 * 24))) : null;

  (instances.outcome || []).forEach((outcome) => {
    const metrics = metricsByOutcome[outcome.outcome_id] || [];
    const snapshotRecencyWindowDays = 45;
    const progress = metrics.reduce((acc, metric) => {
      const snapshots = snapshotsByMetric[metric.metric_id] || [];
      if (snapshots.length === 0) return acc;
      const latest = snapshots.reduce((latestSnap, snap) =>
        new Date(snap.observed_at) > new Date(latestSnap.observed_at) ? snap : latestSnap
      );
      if (metric.target_value === 0) return acc;
      return acc + Number(latest.value) / Number(metric.target_value);
    }, 0);
    const progressPct = metrics.length ? progress / metrics.length : 0;
    setDerived(state, {
      object_type: "outcome",
      object_id: outcome.outcome_id,
      field: "progress_pct",
      value: Number(progressPct.toFixed(2)),
      computed_at: now,
      explanation_json: {
        metrics: metrics.length,
        metrics_on_track: metrics.filter(
          (metric) =>
            (snapshotsByMetric[metric.metric_id] || []).some(
              (snap) => Number(snap.value) >= Number(metric.target_value)
            )
        ).length,
      },
    });

    const confidenceInputs = metrics.map((metric) => {
      const snapshots = snapshotsByMetric[metric.metric_id] || [];
      if (snapshots.length === 0) {
        return { has_snapshot: false, recency_score: 0, days_since_update: null };
      }
      const latest = snapshots.reduce((latestSnap, snap) =>
        new Date(snap.observed_at) > new Date(latestSnap.observed_at) ? snap : latestSnap
      );
      const daysSince = Math.max(
        0,
        Math.round((new Date(now) - new Date(latest.observed_at)) / (1000 * 60 * 60 * 24))
      );
      const recencyScore = Math.max(0, 1 - Math.min(daysSince / snapshotRecencyWindowDays, 1));
      return { has_snapshot: true, recency_score: Number(recencyScore.toFixed(2)), days_since_update: daysSince };
    });
    const snapshotCoverage = metrics.length
      ? confidenceInputs.filter((input) => input.has_snapshot).length / metrics.length
      : 0;
    const avgRecency = confidenceInputs.length
      ? confidenceInputs.reduce((sum, item) => sum + item.recency_score, 0) / confidenceInputs.length
      : 0;
    const confidenceScore = metrics.length ? snapshotCoverage * 0.6 + avgRecency * 0.4 : 0;
    setDerived(state, {
      object_type: "outcome",
      object_id: outcome.outcome_id,
      field: "confidence_score",
      value: Number(confidenceScore.toFixed(2)),
      computed_at: now,
      explanation_json: {
        metrics: metrics.length,
        snapshot_coverage: Number(snapshotCoverage.toFixed(2)),
        avg_recency_score: Number(avgRecency.toFixed(2)),
        recency_window_days: snapshotRecencyWindowDays,
        inputs: confidenceInputs,
      },
    });
  });

  (instances.workstream || []).forEach((workstream) => {
    const milestones = milestonesByWorkstream[workstream.workstream_id] || [];
    const completed = milestones.filter((milestone) => milestone.status === "Completed");
    const onTime = completed.filter(
      (milestone) =>
        milestone.completed_date &&
        milestone.due_date &&
        new Date(milestone.completed_date) <= new Date(milestone.due_date)
    );
    const onTimeRate = completed.length ? onTime.length / completed.length : 0;
    setDerived(state, {
      object_type: "workstream",
      object_id: workstream.workstream_id,
      field: "milestone_on_time_rate",
      value: Number(onTimeRate.toFixed(2)),
      computed_at: now,
      explanation_json: {
        milestones_completed: completed.length,
        milestones_on_time: onTime.length,
      },
    });
  });

  (instances.milestone || []).forEach((milestone) => {
    const dueSoonWindow = 21;
    const dueDate = milestone.due_date ? new Date(milestone.due_date) : null;
    const daysUntilDue = dueDate ? Math.ceil((dueDate - new Date()) / (1000 * 60 * 60 * 24)) : null;
    const hasBlocker = Boolean(milestone.blocker_summary);
    const lowConfidence =
      String(milestone.confidence_level || "").toLowerCase() === "low";
    const dueSoon = daysUntilDue !== null && daysUntilDue <= dueSoonWindow;
    const atRisk = Boolean((lowConfidence || hasBlocker) && dueSoon);
    setDerived(state, {
      object_type: "milestone",
      object_id: milestone.milestone_id,
      field: "at_risk_flag",
      value: atRisk,
      computed_at: now,
      explanation_json: {
        confidence_level: milestone.confidence_level || "Unknown",
        blocker_summary: milestone.blocker_summary || "None",
        days_until_due: daysUntilDue,
        window_days: dueSoonWindow,
      },
    });
  });

  (instances.consulting_engagement || []).forEach((engagement) => {
    const workstreams = workstreamsByEngagement[engagement.engagement_id] || [];
    const milestones = workstreams.flatMap((workstream) => milestonesByWorkstream[workstream.workstream_id] || []);
    const completedMilestones = milestones.filter((milestone) => milestone.status === "Completed");
    const completionRate = milestones.length ? completedMilestones.length / milestones.length : 0;

    setDerived(state, {
      object_type: "consulting_engagement",
      object_id: engagement.engagement_id,
      field: "completion_rate",
      value: Number(completionRate.toFixed(2)),
      computed_at: now,
      explanation_json: {
        milestones: milestones.length,
        completed: completedMilestones.length,
      },
    });
  });

  (instances.client_account || []).forEach((account) => {
    const engagements = engagementsByAccount[account.account_id] || [];
    const engagementScores = engagements.map((eng) => Number(eng.engagement_health_score || 0));
    const avgEngagementScore = engagementScores.length
      ? engagementScores.reduce((sum, score) => sum + score, 0) / engagementScores.length
      : 0;

    const outcomes = engagements.flatMap(
      (eng) => outcomesByEngagement[eng.engagement_id] || []
    );
    const outcomesOnTrack = outcomes.filter(
      (outcome) => (getDerived(state, "outcome", outcome.outcome_id, "progress_pct")?.value || 0) >= 0.6
    ).length;

    const milestones = engagements.flatMap((eng) =>
      (workstreamsByEngagement[eng.engagement_id] || []).flatMap(
        (workstream) => milestonesByWorkstream[workstream.workstream_id] || []
      )
    );
    const signedDeliverables = milestones.filter((milestone) => milestone.client_signoff_date).length;

    const stakeholders = (instances.stakeholder || []).filter((stakeholder) => stakeholder.account_id === account.account_id);
    const sentimentScores = stakeholders.map((stakeholder) => Number(stakeholder.sentiment_score || 0));
    const avgSentiment = sentimentScores.length
      ? sentimentScores.reduce((sum, score) => sum + score, 0) / sentimentScores.length
      : 0;

    const healthScore = Math.round(avgEngagementScore * 0.5 + outcomesOnTrack * 10 + signedDeliverables * 2 + avgSentiment * 100);

    setDerived(state, {
      object_type: "client_account",
      object_id: account.account_id,
      field: "health_score",
      value: healthScore,
      computed_at: now,
      explanation_json: {
        avg_engagement_score: Number(avgEngagementScore.toFixed(1)),
        outcomes_on_track: outcomesOnTrack,
        signed_deliverables: signedDeliverables,
        avg_sentiment: Number(avgSentiment.toFixed(2)),
      },
    });

    const risks = (instances.risk_issue || []).filter((risk) => risk.engagement_id && engagements.some((eng) => eng.engagement_id === risk.engagement_id));
    const highRisks = risks.filter((risk) => risk.severity === "High" && risk.status !== "Resolved");

    const invoices = (instances.invoice || []).filter((invoice) => invoice.account_id === account.account_id);
    const overdueInvoices = invoices.filter((invoice) => invoice.status === "Overdue");

    const sponsor = stakeholders.find((stakeholder) => stakeholder.is_exec_sponsor);
    const sponsorSentiment = sponsor ? Number(sponsor.sentiment_score || 0) : 0;

    const missedMilestones = milestones.filter(
      (milestone) => milestone.status !== "Completed" && milestone.due_date && new Date(milestone.due_date) < new Date()
    );

    const renewalRisk =
      highRisks.length * 12 +
      overdueInvoices.length * 10 +
      (1 - sponsorSentiment) * 40 +
      missedMilestones.length * 8;

    setDerived(state, {
      object_type: "client_account",
      object_id: account.account_id,
      field: "renewal_risk_score",
      value: Math.min(100, Math.round(renewalRisk)),
      computed_at: now,
      explanation_json: {
        high_severity_risks: highRisks.length,
        overdue_invoices: overdueInvoices.length,
        sponsor_sentiment: sponsorSentiment,
        missed_milestones: missedMilestones.length,
      },
    });

    const latestEngagementActivity = latestDate(
      engagements.flatMap((engagement) => [engagement.start_date, engagement.end_date, engagement.renewal_date])
    );
    const latestStakeholderTouch = latestDate(
      stakeholders.map((stakeholder) => stakeholder.last_contacted_at)
    );
    const latestMilestoneActivity = latestDate(
      milestones.flatMap((milestone) => [milestone.completed_date, milestone.planned_date, milestone.due_date])
    );
    const lastActivityAt = latestDate([
      account.created_date,
      latestEngagementActivity?.toISOString(),
      latestStakeholderTouch?.toISOString(),
      latestMilestoneActivity?.toISOString(),
    ]);
    const freshnessDays = daysSince(lastActivityAt);
    const freshnessScore = freshnessDays == null ? 0 : Math.max(0, 100 - freshnessDays * 2);

    setDerived(state, {
      object_type: "client_account",
      object_id: account.account_id,
      field: "data_freshness_days",
      value: freshnessDays,
      computed_at: now,
      explanation_json: {
        last_activity_at: lastActivityAt?.toISOString() || null,
        latest_engagement_activity: latestEngagementActivity?.toISOString() || null,
        latest_stakeholder_touch: latestStakeholderTouch?.toISOString() || null,
        latest_milestone_activity: latestMilestoneActivity?.toISOString() || null,
      },
    });

    setDerived(state, {
      object_type: "client_account",
      object_id: account.account_id,
      field: "data_freshness_score",
      value: Math.round(freshnessScore),
      computed_at: now,
      explanation_json: {
        freshness_days: freshnessDays,
      },
    });

    const requiredFields = [
      "industry",
      "region",
      "account_status",
      "segment_tag",
      "estimated_ltv",
      "total_contract_value_to_date",
    ];
    const missingFields = requiredFields.filter((field) => !account[field]);

    setDerived(state, {
      object_type: "client_account",
      object_id: account.account_id,
      field: "missing_data_fields",
      value: missingFields,
      computed_at: now,
      explanation_json: {
        required_fields: requiredFields,
        missing_count: missingFields.length,
      },
    });

    const churnRiskScore = Math.min(
      100,
      Math.round(renewalRisk * 0.6 + (100 - healthScore) * 0.3 + (freshnessDays || 0) * 0.2)
    );
    const ltvAtRisk = Math.round((Number(account.estimated_ltv || 0) * churnRiskScore) / 100);

    setDerived(state, {
      object_type: "client_account",
      object_id: account.account_id,
      field: "churn_risk_score",
      value: churnRiskScore,
      computed_at: now,
      explanation_json: {
        renewal_risk_score: renewalRisk,
        health_score: healthScore,
        freshness_days: freshnessDays,
      },
    });

    setDerived(state, {
      object_type: "client_account",
      object_id: account.account_id,
      field: "ltv_at_risk",
      value: ltvAtRisk,
      computed_at: now,
      explanation_json: {
        estimated_ltv: account.estimated_ltv,
        churn_risk_score: churnRiskScore,
      },
    });

    const valueScore = Number(account.estimated_ltv || 0);
    const segment =
      valueScore > 5000000 && renewalRisk > 60
        ? "High Value / High Risk"
        : valueScore > 5000000
          ? "High Value / Stable"
          : renewalRisk > 60
            ? "Growth / High Risk"
            : "Growth / Stable";

    setDerived(state, {
      object_type: "client_account",
      object_id: account.account_id,
      field: "segment_tag",
      value: segment,
      computed_at: now,
      explanation_json: {
        estimated_ltv: valueScore,
        renewal_risk_score: renewalRisk,
      },
    });
  });
};

export const persistState = (state) => {
  state.last_saved_at = new Date().toISOString();
  state.isDirty = false;
  saveState(state);
};

export const initializeState = async () => {
  const stored = loadState();
  if (stored) return stored;

  let config = initialData;
  try {
    const response = await fetch("/docs/ontology-map.json");
    if (response.ok) {
      config = await response.json();
    }
  } catch (error) {
    console.warn("Failed to load ontology-map.json, using fallback.", error);
  }

  return {
    config,
    instances: clone(seedInstances),
    links: clone(seedLinks),
    derived_values: [],
    action_log: [],
    audit_log: [],
    config_versions: [
      {
        id: "config_seed",
        created_at: new Date().toISOString(),
        created_by: "System",
        config_json: clone(config),
      },
    ],
    role: DEFAULT_ROLE,
    last_saved_at: null,
    isDirty: false,
  };
};

export const normalizeFieldValue = (value) => {
  if (Array.isArray(value) && value.every((item) => isPrimitive(item))) {
    return value.join("\n");
  }
  return value ?? "";
};

export const parseFieldValue = ({ value, current, fieldType }) => {
  if (fieldType === "boolean") return Boolean(value);
  if (fieldType === "number") return value === "" ? "" : Number(value);
  if (Array.isArray(current) && current.every((item) => isPrimitive(item))) {
    return value
      .split("\n")
      .map((item) => item.trim())
      .filter((item) => item.length > 0);
  }
  return value;
};
