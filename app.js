import { initialData } from "./data.js";
import { seedInstances, seedLinks } from "./seed-data.js";
import { loadState, saveState, clearState } from "./storage.js";

const pages = {
  overview: document.querySelector("[data-page='overview']"),
  accounts: document.querySelector("[data-page='accounts']"),
  accountDetail: document.querySelector("[data-page='account-detail']"),
  engagements: document.querySelector("[data-page='engagements']"),
  outcomes: document.querySelector("[data-page='outcomes']"),
  risks: document.querySelector("[data-page='risks']"),
  actions: document.querySelector("[data-page='actions']"),
  ontology: document.querySelector("[data-page='ontology']"),
  dataIntegration: document.querySelector("[data-page='data-integration']"),
  audit: document.querySelector("[data-page='audit']")
};

const companyNameEl = document.getElementById("company-name");
const primaryObjectiveEl = document.getElementById("primary-objective");
const fdeLeadEl = document.getElementById("fde-lead");
const deploymentTimelineEl = document.getElementById("deployment-timeline");
const statusBadgeEl = document.getElementById("status-badge");
const roleSelectEl = document.getElementById("role-select");
const saveIndicatorEl = document.getElementById("save-indicator");

const resetButton = document.getElementById("reset-data");
const downloadButton = document.getElementById("download-json");

const DEFAULT_ROLE = "Operator";

const clone = (value) => JSON.parse(JSON.stringify(value));

const toTitle = (value) => value.replace(/_/g, " ");

const formatDate = (value) => (value ? new Date(value).toLocaleDateString() : "—");

const formatPercent = (value) => `${Math.round(value * 100)}%`;

const isPrimitive = (value) =>
  value === null || ["string", "number", "boolean"].includes(typeof value);

const inferFieldType = (key, overrides = {}) => {
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

const groupBy = (items, keyFn) =>
  items.reduce((acc, item) => {
    const key = keyFn(item);
    if (!acc[key]) acc[key] = [];
    acc[key].push(item);
    return acc;
  }, {});

const buildReferenceMap = (config, instances) => {
  const referenceMap = {};
  config.semantic_layer.object_types.forEach((objectType) => {
    const idField = objectType.properties.find((prop) => prop.endsWith("_id"));
    if (!idField) return;
    const options = instances[objectType.id] || [];
    referenceMap[idField] = { objectType, options, idField };
  });
  return referenceMap;
};

const createEmptyRecord = (objectType) => {
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

const generateAuditEntry = (entry, state) => {
  state.audit_log.unshift({
    id: `audit_${Date.now()}`,
    occurred_at: new Date().toISOString(),
    actor_role: state.role,
    ...entry
  });
};

const getDerived = (state, objectType, objectId, field) =>
  state.derived_values.find(
    (item) => item.object_type === objectType && item.object_id === objectId && item.field === field
  );

const setDerived = (state, payload) => {
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

const updateHeader = (state) => {
  companyNameEl.textContent = state.config.client_metadata.company_name || "Client Value Dashboard";
  primaryObjectiveEl.textContent = state.config.client_metadata.primary_objective || "";
  fdeLeadEl.textContent = state.config.client_metadata.fde_lead || "—";
  deploymentTimelineEl.textContent = state.config.client_metadata.deployment_timeline || "—";
  statusBadgeEl.textContent = state.isDirty ? "Unsaved" : "Synced";
  statusBadgeEl.className = state.isDirty ? "status-pill warning" : "status-pill";
  saveIndicatorEl.textContent = state.last_saved_at
    ? `Last saved ${formatDate(state.last_saved_at)}`
    : "Changes auto-save locally";
  roleSelectEl.value = state.role;
};

const persistState = (state) => {
  state.last_saved_at = new Date().toISOString();
  state.isDirty = false;
  saveState(state);
  updateHeader(state);
};

const toggleEditing = (container, state) => {
  const isViewer = state.role === "Viewer";
  container.querySelectorAll("input, textarea, select, button").forEach((el) => {
    if (el.dataset.allowViewer === "true") return;
    el.disabled = isViewer;
  });
};

const renderField = ({ label, value, onChange, fieldType, referenceMap, state }) => {
  const wrapper = document.createElement("div");
  wrapper.className = "field-group";

  const labelEl = document.createElement("label");
  labelEl.textContent = toTitle(label);
  wrapper.appendChild(labelEl);

  if (fieldType === "boolean") {
    const input = document.createElement("input");
    input.type = "checkbox";
    input.checked = Boolean(value);
    input.addEventListener("change", () => onChange(input.checked));
    wrapper.appendChild(input);
    return wrapper;
  }

  if (fieldType === "number") {
    const input = document.createElement("input");
    input.type = "number";
    input.value = value ?? "";
    input.addEventListener("input", () => {
      const nextValue = input.value === "" ? "" : Number(input.value);
      onChange(nextValue);
    });
    wrapper.appendChild(input);
    return wrapper;
  }

  if (fieldType === "date" || fieldType === "datetime") {
    const input = document.createElement("input");
    input.type = fieldType === "date" ? "date" : "datetime-local";
    input.value = value ?? "";
    input.addEventListener("input", () => onChange(input.value));
    wrapper.appendChild(input);
    return wrapper;
  }

  if (fieldType === "reference" && referenceMap[label]) {
    const { options, idField, objectType } = referenceMap[label];
    const select = document.createElement("select");
    const emptyOption = document.createElement("option");
    emptyOption.value = "";
    emptyOption.textContent = `Select ${toTitle(objectType.id)}`;
    select.appendChild(emptyOption);
    options.forEach((option) => {
      const opt = document.createElement("option");
      opt.value = option[idField];
      opt.textContent = option.name || option.title || option[idField];
      if (option[idField] === value) opt.selected = true;
      select.appendChild(opt);
    });
    select.addEventListener("change", () => onChange(select.value));
    wrapper.appendChild(select);
    return wrapper;
  }

  if (fieldType === "url") {
    const input = document.createElement("input");
    input.type = "url";
    input.value = value ?? "";
    input.addEventListener("input", () => onChange(input.value));
    wrapper.appendChild(input);
    return wrapper;
  }

  if (Array.isArray(value)) {
    if (value.every((item) => isPrimitive(item))) {
      const textarea = document.createElement("textarea");
      textarea.value = value.join("\n");
      textarea.addEventListener("input", () => {
        const nextValue = textarea.value
          .split("\n")
          .map((item) => item.trim())
          .filter((item) => item.length > 0);
        onChange(nextValue);
      });
      wrapper.appendChild(textarea);
      return wrapper;
    }
  }

  const input = value && value.length > 80 ? document.createElement("textarea") : document.createElement("input");
  input.value = value ?? "";
  input.addEventListener("input", () => onChange(input.value));
  wrapper.appendChild(input);
  return wrapper;
};

const renderRecord = (record, objectType, state, onUpdate) => {
  const container = document.createElement("div");
  container.className = "object-card";
  const header = document.createElement("header");
  const title = document.createElement("strong");
  const idField = objectType.properties.find((prop) => prop.endsWith("_id"));
  title.textContent = record.name || record.title || record[objectType.properties[1]] || record[idField];

  const deleteBtn = document.createElement("button");
  deleteBtn.className = "danger";
  deleteBtn.textContent = "Remove";
  deleteBtn.addEventListener("click", () => onUpdate("delete", record));

  header.appendChild(title);
  header.appendChild(deleteBtn);
  container.appendChild(header);

  const overrides = objectType.field_overrides || {};
  const referenceMap = buildReferenceMap(state.config, state.instances);

  objectType.properties.forEach((prop) => {
    const fieldType = inferFieldType(prop, overrides);
    container.appendChild(
      renderField({
        label: prop,
        value: record[prop],
        fieldType,
        referenceMap,
        state,
        onChange: (value) => onUpdate("update", { ...record, [prop]: value })
      })
    );
  });

  return container;
};

const renderObjectListPanel = (state, objectTypeId) => {
  const objectType = state.config.semantic_layer.object_types.find((item) => item.id === objectTypeId);
  if (!objectType) return document.createElement("div");
  const wrapper = document.createElement("div");
  const records = state.instances[objectTypeId] || [];
  const list = document.createElement("div");
  list.className = "card-grid";

  records.forEach((record) => {
    list.appendChild(
      renderRecord(record, objectType, state, (action, updated) => {
        if (action === "delete") {
          state.instances[objectTypeId] = state.instances[objectTypeId].filter(
            (item) => item !== record
          );
          generateAuditEntry(
            {
              action: "delete",
              object_type: objectTypeId,
              object_id: record[objectType.properties[0]] || ""
            },
            state
          );
        } else {
          Object.assign(record, updated);
          generateAuditEntry(
            {
              action: "update",
              object_type: objectTypeId,
              object_id: record[objectType.properties[0]] || ""
            },
            state
          );
        }
        state.isDirty = true;
        computeDerived(state);
        persistState(state);
        renderAll(state);
      })
    );
  });

  const addBtn = document.createElement("button");
  addBtn.className = "primary";
  addBtn.textContent = `Add ${toTitle(objectTypeId)}`;
  addBtn.addEventListener("click", () => {
    const record = createEmptyRecord(objectType);
    state.instances[objectTypeId].push(record);
    generateAuditEntry(
      {
        action: "create",
        object_type: objectTypeId,
        object_id: record[objectType.properties[0]] || ""
      },
      state
    );
    state.isDirty = true;
    computeDerived(state);
    persistState(state);
    renderAll(state);
  });

  wrapper.appendChild(list);
  wrapper.appendChild(addBtn);
  return wrapper;
};

const renderDerivedPanel = (derived, label) => {
  if (!derived) return "";
  return `
    <div class="explain-panel">
      <div class="explain-header">
        <strong>${toTitle(label)}</strong>
        <span>${formatDate(derived.computed_at)}</span>
      </div>
      <div class="explain-body">
        <p><strong>Value:</strong> ${derived.value}</p>
        <pre>${JSON.stringify(derived.explanation_json, null, 2)}</pre>
      </div>
    </div>
  `;
};

const computeDerived = (state) => {
  const now = new Date().toISOString();
  const instances = state.instances;

  const milestonesByWorkstream = groupBy(instances.milestone || [], (m) => m.workstream_id);
  const engagementsByAccount = groupBy(instances.consulting_engagement || [], (e) => e.account_id);
  const workstreamsByEngagement = groupBy(instances.workstream || [], (w) => w.engagement_id);
  const outcomesByEngagement = groupBy(instances.outcome || [], (o) => o.engagement_id);
  const metricsByOutcome = groupBy(instances.kpi_metric || [], (m) => m.outcome_id);
  const snapshotsByMetric = groupBy(instances.kpi_snapshot || [], (s) => s.metric_id);
  const risksByEngagement = groupBy(instances.risk_issue || [], (r) => r.engagement_id);
  const invoicesByEngagement = groupBy(instances.invoice || [], (i) => i.engagement_id);
  const stakeholdersByAccount = groupBy(instances.stakeholder || [], (s) => s.account_id);

  const deliverableToOutcome = new Map(
    state.links
      .filter((link) => link.link_type === "deliverable_supports_outcome")
      .map((link) => [link.from_id, link.to_id])
  );
  const deliverablesByOutcome = {};
  (instances.deliverable || []).forEach((del) => {
    const outcomeId = deliverableToOutcome.get(del.deliverable_id);
    if (!outcomeId) return;
    if (!deliverablesByOutcome[outcomeId]) deliverablesByOutcome[outcomeId] = [];
    deliverablesByOutcome[outcomeId].push(del);
  });

  (instances.workstream || []).forEach((workstream) => {
    const milestones = milestonesByWorkstream[workstream.workstream_id] || [];
    const completed = milestones.filter((m) => m.completed_date);
    const onTime = completed.filter((m) => m.completed_date <= m.due_date);
    const lateDays = completed
      .filter((m) => m.completed_date && m.due_date && m.completed_date > m.due_date)
      .map((m) => {
        const completedDate = new Date(m.completed_date);
        const dueDate = new Date(m.due_date);
        return Math.ceil((completedDate - dueDate) / (1000 * 60 * 60 * 24));
      });
    const onTimeRate = completed.length ? onTime.length / completed.length : 0;
    const avgSlippage = lateDays.length ? lateDays.reduce((a, b) => a + b, 0) / lateDays.length : 0;

    setDerived(state, {
      object_type: "workstream",
      object_id: workstream.workstream_id,
      field: "milestone_on_time_rate",
      value: Number(onTimeRate.toFixed(2)),
      computed_at: now,
      explanation_json: {
        completed_count: completed.length,
        on_time_count: onTime.length,
        average_slippage_days: Number(avgSlippage.toFixed(1))
      }
    });
  });

  (instances.milestone || []).forEach((milestone) => {
    const dueDate = milestone.due_date ? new Date(milestone.due_date) : null;
    const threshold = 14;
    const nowDate = new Date();
    const withinWindow = dueDate ? (dueDate - nowDate) / (1000 * 60 * 60 * 24) <= threshold : false;
    const lowConfidence = milestone.confidence_level?.toLowerCase() === "low";
    const hasBlocker = Boolean(milestone.blocker_summary);
    const atRisk = (lowConfidence || hasBlocker) && withinWindow;

    setDerived(state, {
      object_type: "milestone",
      object_id: milestone.milestone_id,
      field: "at_risk_flag",
      value: atRisk,
      computed_at: now,
      explanation_json: {
        low_confidence: lowConfidence,
        blocker_present: hasBlocker,
        due_date: milestone.due_date,
        threshold_days: threshold
      }
    });
  });

  (instances.outcome || []).forEach((outcome) => {
    const metrics = metricsByOutcome[outcome.outcome_id] || [];
    const progressValues = metrics.map((metric) => {
      const snapshots = (snapshotsByMetric[metric.metric_id] || []).slice();
      if (!snapshots.length) return 0;
      snapshots.sort((a, b) => new Date(b.observed_at) - new Date(a.observed_at));
      const latest = snapshots[0];
      const baseline = Number(metric.baseline_value);
      const target = Number(metric.target_value);
      if (Number.isNaN(baseline) || Number.isNaN(target) || baseline === target) return 0;
      return (Number(latest.value) - baseline) / (target - baseline);
    });
    const avgProgress = progressValues.length
      ? progressValues.reduce((a, b) => a + b, 0) / progressValues.length
      : 0;
    setDerived(state, {
      object_type: "outcome",
      object_id: outcome.outcome_id,
      field: "progress_pct",
      value: Number(Math.min(Math.max(avgProgress, 0), 1).toFixed(2)),
      computed_at: now,
      explanation_json: {
        metric_count: metrics.length,
        avg_progress_raw: avgProgress
      }
    });
  });

  (instances.consulting_engagement || []).forEach((engagement) => {
    const workstreams = workstreamsByEngagement[engagement.engagement_id] || [];
    const milestones = workstreams.flatMap(
      (ws) => milestonesByWorkstream[ws.workstream_id] || []
    );
    const completed = milestones.filter((m) => m.completed_date);
    const onTimeRate = completed.length
      ? completed.filter((m) => m.completed_date <= m.due_date).length / completed.length
      : 0;
    const confidenceLevels = milestones
      .map((m) => m.confidence_level?.toLowerCase())
      .filter(Boolean)
      .map((value) => (value === "high" ? 1 : value === "medium" ? 0.6 : 0.3));
    const avgConfidence = confidenceLevels.length
      ? confidenceLevels.reduce((a, b) => a + b, 0) / confidenceLevels.length
      : 0.5;
    const risks = risksByEngagement[engagement.engagement_id] || [];
    const highRisks = risks.filter((r) => r.severity?.toLowerCase() === "high" && r.status !== "Resolved");
    const invoices = invoicesByEngagement[engagement.engagement_id] || [];
    const overdueInvoices = invoices.filter((inv) => inv.days_past_due > 0);
    const stakeholders = stakeholdersByAccount[engagement.account_id] || [];
    const sentimentValues = stakeholders.map((s) => Number(s.sentiment_score)).filter((s) => !Number.isNaN(s));
    const avgSentiment = sentimentValues.length
      ? sentimentValues.reduce((a, b) => a + b, 0) / sentimentValues.length
      : 0.5;

    const score = Math.round(
      100 * (0.35 * onTimeRate + 0.25 * avgConfidence + 0.2 * avgSentiment - 0.1 * highRisks.length * 0.1 - 0.1 * overdueInvoices.length * 0.1)
    );

    setDerived(state, {
      object_type: "consulting_engagement",
      object_id: engagement.engagement_id,
      field: "engagement_health_score",
      value: Math.max(0, Math.min(score, 100)),
      computed_at: now,
      explanation_json: {
        on_time_rate: Number(onTimeRate.toFixed(2)),
        average_confidence: Number(avgConfidence.toFixed(2)),
        average_sentiment: Number(avgSentiment.toFixed(2)),
        high_severity_risks: highRisks.length,
        overdue_invoices: overdueInvoices.length
      }
    });
  });

  (instances.client_account || []).forEach((account) => {
    const engagements = engagementsByAccount[account.account_id] || [];
    const engagementScores = engagements
      .map((eng) => getDerived(state, "consulting_engagement", eng.engagement_id, "engagement_health_score"))
      .filter(Boolean)
      .map((item) => item.value);
    const avgEngagementScore = engagementScores.length
      ? engagementScores.reduce((a, b) => a + b, 0) / engagementScores.length
      : 60;

    const outcomes = engagements.flatMap(
      (eng) => outcomesByEngagement[eng.engagement_id] || []
    );
    const outcomeProgress = outcomes.map((outcome) =>
      getDerived(state, "outcome", outcome.outcome_id, "progress_pct")?.value || 0
    );
    const outcomesOnTrack = outcomeProgress.filter((value) => value >= 0.6).length;

    const stakeholders = stakeholdersByAccount[account.account_id] || [];
    const sentimentValues = stakeholders.map((s) => Number(s.sentiment_score)).filter((s) => !Number.isNaN(s));
    const avgSentiment = sentimentValues.length
      ? sentimentValues.reduce((a, b) => a + b, 0) / sentimentValues.length
      : 0.5;

    const signedDeliverables = outcomes.filter((outcome) => {
      const related = deliverablesByOutcome[outcome.outcome_id] || [];
      return related.some((del) => del.status?.toLowerCase() === "approved");
    }).length;

    const healthScore = Math.round(
      Math.min(100, 40 + avgEngagementScore * 0.4 + outcomesOnTrack * 8 + signedDeliverables * 6 + avgSentiment * 15)
    );

    const risks = engagements.flatMap(
      (eng) => risksByEngagement[eng.engagement_id] || []
    );
    const highRisks = risks.filter((r) => r.severity?.toLowerCase() === "high" && r.status !== "Resolved");
    const overdueInvoices = (instances.invoice || []).filter(
      (inv) => inv.account_id === account.account_id && inv.days_past_due > 0
    );
    const execSponsor = stakeholders.find((s) => s.is_exec_sponsor);
    const sponsorSentiment = execSponsor ? Number(execSponsor.sentiment_score) : 0.5;
    const missedMilestones = (instances.milestone || []).filter((m) => m.completed_date && m.due_date && m.completed_date > m.due_date);

    const renewalRisk = Math.round(
      Math.min(100, 25 + highRisks.length * 12 + overdueInvoices.length * 10 + (1 - sponsorSentiment) * 35 + missedMilestones.length * 4)
    );

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
        avg_sentiment: Number(avgSentiment.toFixed(2))
      }
    });

    setDerived(state, {
      object_type: "client_account",
      object_id: account.account_id,
      field: "renewal_risk_score",
      value: renewalRisk,
      computed_at: now,
      explanation_json: {
        high_severity_risks: highRisks.length,
        overdue_invoices: overdueInvoices.length,
        sponsor_sentiment: sponsorSentiment,
        missed_milestones: missedMilestones.length
      }
    });

    const valueScore = Number(account.estimated_ltv || 0);
    const segment = valueScore > 5000000 && renewalRisk > 60
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
        renewal_risk_score: renewalRisk
      }
    });
  });
};

const renderOverview = (state) => {
  const container = pages.overview;
  const accounts = state.instances.client_account || [];
  const attention = accounts
    .map((account) => {
      const health = getDerived(state, "client_account", account.account_id, "health_score");
      const risk = getDerived(state, "client_account", account.account_id, "renewal_risk_score");
      const segment = getDerived(state, "client_account", account.account_id, "segment_tag");
      return { account, health, risk, segment };
    })
    .sort((a, b) => (b.risk?.value || 0) - (a.risk?.value || 0))
    .slice(0, 4);

  const avgHealth = accounts.length
    ? Math.round(
        accounts.reduce((sum, account) => sum + (getDerived(state, "client_account", account.account_id, "health_score")?.value || 0), 0) /
          accounts.length
      )
    : 0;

  const avgRisk = accounts.length
    ? Math.round(
        accounts.reduce((sum, account) => sum + (getDerived(state, "client_account", account.account_id, "renewal_risk_score")?.value || 0), 0) /
          accounts.length
      )
    : 0;

  const onTrackOutcomes = (state.instances.outcome || []).filter(
    (outcome) => (getDerived(state, "outcome", outcome.outcome_id, "progress_pct")?.value || 0) >= 0.6
  ).length;

  container.innerHTML = `
    <div class="page-header">
      <div>
        <h2>Executive Overview</h2>
        <p>Portfolio-level signals for renewal readiness, delivery reliability, and value realization.</p>
      </div>
      <div class="pill">${state.config.client_metadata.company_name || "Client Portfolio"}</div>
    </div>
    <div class="summary-grid">
      <div class="summary-tile">
        <span class="label">Portfolio health score</span>
        <strong>${avgHealth}</strong>
      </div>
      <div class="summary-tile">
        <span class="label">Renewal risk index</span>
        <strong>${avgRisk}</strong>
      </div>
      <div class="summary-tile">
        <span class="label">Outcomes on track</span>
        <strong>${onTrackOutcomes}</strong>
      </div>
    </div>
    <div class="panel">
      <h3>Accounts needing attention</h3>
      <div class="card-grid">
        ${attention
          .map(
            ({ account, health, risk, segment }) => `
          <div class="object-card">
            <header>
              <strong>${account.account_name}</strong>
              <a class="link" href="#/accounts/${account.account_id}">Open</a>
            </header>
            <p>Health: ${health?.value ?? "—"}</p>
            <p>Renewal risk: ${risk?.value ?? "—"}</p>
            <p>Segment: ${segment?.value ?? account.segment_tag}</p>
          </div>`
          )
          .join("")}
      </div>
    </div>
  `;
};

const renderObjectList = (state, objectTypeId, container) => {
  const objectType = state.config.semantic_layer.object_types.find((item) => item.id === objectTypeId);
  if (!objectType) return;
  container.innerHTML = `
    <div class="page-header">
      <div>
        <h2>${toTitle(objectTypeId)}</h2>
        <p>${objectType.description}</p>
      </div>
    </div>
  `;
  container.appendChild(renderObjectListPanel(state, objectTypeId));
};

const renderAccounts = (state) => {
  const container = pages.accounts;
  container.innerHTML = "";
  const accounts = state.instances.client_account || [];

  const grid = document.createElement("div");
  grid.className = "card-grid";

  accounts.forEach((account) => {
    const health = getDerived(state, "client_account", account.account_id, "health_score");
    const risk = getDerived(state, "client_account", account.account_id, "renewal_risk_score");
    const segment = getDerived(state, "client_account", account.account_id, "segment_tag");

    const card = document.createElement("div");
    card.className = "object-card";
    card.innerHTML = `
      <header>
        <strong>${account.account_name}</strong>
        <a class="link" href="#/accounts/${account.account_id}">Open</a>
      </header>
      <p>Industry: ${account.industry}</p>
      <p>Health score: ${health?.value ?? account.health_score}</p>
      <p>Renewal risk: ${risk?.value ?? account.renewal_risk_score}</p>
      <p>Segment: ${segment?.value ?? account.segment_tag}</p>
    `;
    grid.appendChild(card);
  });

  container.innerHTML = `
    <div class="page-header">
      <div>
        <h2>Accounts</h2>
        <p>Monitor renewal readiness and value realization across the portfolio.</p>
      </div>
    </div>
  `;
  container.appendChild(grid);
  const editorPanel = document.createElement("div");
  editorPanel.className = "panel";
  editorPanel.innerHTML = "<h3>Manage account records</h3>";
  editorPanel.appendChild(renderObjectListPanel(state, "client_account"));
  container.appendChild(editorPanel);
};

const renderAccountDetail = (state, accountId) => {
  const container = pages.accountDetail;
  const account = (state.instances.client_account || []).find((acc) => acc.account_id === accountId);
  if (!account) {
    container.innerHTML = `
      <div class="empty-state">
        <h2>Account not found</h2>
        <p>Select an account from the Accounts page.</p>
      </div>
    `;
    return;
  }

  const engagements = (state.instances.consulting_engagement || []).filter(
    (eng) => eng.account_id === accountId
  );
  const outcomes = engagements.flatMap(
    (eng) => (state.instances.outcome || []).filter((outcome) => outcome.engagement_id === eng.engagement_id)
  );

  const health = getDerived(state, "client_account", account.account_id, "health_score");
  const risk = getDerived(state, "client_account", account.account_id, "renewal_risk_score");
  const segment = getDerived(state, "client_account", account.account_id, "segment_tag");

  container.innerHTML = `
    <div class="page-header">
      <div>
        <h2>${account.account_name}</h2>
        <p>Account command center with explainable scores and actions.</p>
      </div>
      <a class="link" href="#/accounts">Back to accounts</a>
    </div>
    <div class="summary-grid">
      <div class="summary-tile">
        <span class="label">Health score</span>
        <strong>${health?.value ?? account.health_score}</strong>
      </div>
      <div class="summary-tile">
        <span class="label">Renewal risk</span>
        <strong>${risk?.value ?? account.renewal_risk_score}</strong>
      </div>
      <div class="summary-tile">
        <span class="label">Segment</span>
        <strong>${segment?.value ?? account.segment_tag}</strong>
      </div>
    </div>
    <div class="split-panel">
      <div>
        <h3>Engagements</h3>
        <div class="card-grid">
          ${engagements
            .map(
              (engagement) => `
            <div class="object-card">
              <header>
                <strong>${engagement.engagement_name}</strong>
              </header>
              <p>Status: ${engagement.status}</p>
              <p>Renewal date: ${formatDate(engagement.renewal_date)}</p>
            </div>`
            )
            .join("")}
        </div>
      </div>
      <div>
        <h3>Outcomes</h3>
        <div class="card-grid">
          ${outcomes
            .map((outcome) => {
              const progress = getDerived(state, "outcome", outcome.outcome_id, "progress_pct");
              return `
              <div class="object-card">
                <header>
                  <strong>${outcome.name}</strong>
                </header>
                <p>Status: ${outcome.status}</p>
                <p>Progress: ${progress ? formatPercent(progress.value) : "—"}</p>
              </div>`;
            })
            .join("")}
        </div>
      </div>
    </div>
    <div class="panel">
      <h3>Explainability</h3>
      ${renderDerivedPanel(health, "health_score")}
      ${renderDerivedPanel(risk, "renewal_risk_score")}
      ${renderDerivedPanel(segment, "segment_tag")}
    </div>
  `;
};

const renderEngagements = (state) => {
  renderObjectList(state, "consulting_engagement", pages.engagements);
};

const renderOutcomes = (state) => {
  const container = pages.outcomes;
  container.innerHTML = "";

  const outcomes = state.instances.outcome || [];
  const list = document.createElement("div");
  list.className = "card-grid";
  outcomes.forEach((outcome) => {
    const progress = getDerived(state, "outcome", outcome.outcome_id, "progress_pct");
    const card = document.createElement("div");
    card.className = "object-card";
    card.innerHTML = `
      <header>
        <strong>${outcome.name}</strong>
      </header>
      <p>Status: ${outcome.status}</p>
      <p>Target date: ${formatDate(outcome.target_date)}</p>
      <p>Progress: ${progress ? formatPercent(progress.value) : "—"}</p>
      ${renderDerivedPanel(progress, "progress_pct")}
    `;
    list.appendChild(card);
  });

  container.innerHTML = `
    <div class="page-header">
      <div>
        <h2>Outcomes & KPIs</h2>
        <p>Track measurable value realization and KPI progress.</p>
      </div>
    </div>
  `;
  container.appendChild(list);
  const metricsPanel = document.createElement("div");
  metricsPanel.className = "panel";
  metricsPanel.innerHTML = `
    <h3>KPI Metrics</h3>
    <div class="card-grid">
      ${(state.instances.kpi_metric || [])
        .map(
          (metric) => `
        <div class="object-card">
          <header><strong>${metric.name}</strong></header>
          <p>Baseline: ${metric.baseline_value}</p>
          <p>Target: ${metric.target_value}</p>
          <p>Cadence: ${metric.measurement_cadence}</p>
        </div>`
        )
        .join("")}
    </div>
  `;
  container.appendChild(metricsPanel);
  const managePanel = document.createElement("div");
  managePanel.className = "panel";
  managePanel.innerHTML = "<h3>Manage outcome records</h3>";
  managePanel.appendChild(renderObjectListPanel(state, "outcome"));
  managePanel.appendChild(renderObjectListPanel(state, "kpi_metric"));
  managePanel.appendChild(renderObjectListPanel(state, "kpi_snapshot"));
  container.appendChild(managePanel);
};

const renderRisks = (state) => {
  renderObjectList(state, "risk_issue", pages.risks);
};

const renderActions = (state) => {
  const container = pages.actions;
  const actions = state.config.kinetic_layer.action_types;
  const actionLog = state.action_log;

  container.innerHTML = `
    <div class="page-header">
      <div>
        <h2>Action Center</h2>
        <p>Execute workflows and document interventions.</p>
      </div>
    </div>
  `;

  const actionPanel = document.createElement("div");
  actionPanel.className = "panel";

  actionPanel.innerHTML = `
    <h3>Launch action</h3>
    <div class="action-grid">
      ${actions
        .map(
          (action) => `
        <div class="object-card">
          <header>
            <strong>${action.id}</strong>
          </header>
          <p>${action.description}</p>
          <form data-action-form="${action.id}" class="action-form">
            ${action.parameters
              .map(
                (param) => `
              <label class="action-label">${toTitle(param)}</label>
              <input name="${param}" />`
              )
              .join("")}
            <button class="primary" type="submit">Run action</button>
          </form>
        </div>`
        )
        .join("")}
    </div>
  `;

  container.appendChild(actionPanel);

  const logPanel = document.createElement("div");
  logPanel.className = "panel";
  logPanel.innerHTML = `
    <h3>Action log</h3>
    <div class="card-grid">
      ${actionLog
        .map(
          (entry) => `
        <div class="object-card">
          <header>
            <strong>${entry.action_type}</strong>
          </header>
          <p>Status: ${entry.status}</p>
          <p>Run at: ${formatDate(entry.run_at)}</p>
          <pre>${JSON.stringify(entry.parameters, null, 2)}</pre>
        </div>`
        )
        .join("")}
    </div>
  `;
  container.appendChild(logPanel);

  container.querySelectorAll("[data-action-form]").forEach((form) => {
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const action = actions.find((item) => item.id === form.dataset.actionForm);
      if (!action) return;
      const formData = new FormData(form);
      const parameters = Object.fromEntries(formData.entries());

      state.action_log.unshift({
        id: `action_${Date.now()}`,
        action_type: action.id,
        parameters,
        status: "Stubbed",
        run_at: new Date().toISOString(),
        side_effects_status: action.side_effects.map((effect) => ({ effect, status: "Pending" }))
      });
      generateAuditEntry(
        {
          action: "run_action",
          object_type: "action_log",
          object_id: action.id
        },
        state
      );
      state.isDirty = true;
      persistState(state);
      renderActions(state);
    });
  });
};

const renderOntologyStudio = (state) => {
  const container = pages.ontology;
  container.innerHTML = `
    <div class="page-header">
      <div>
        <h2>Ontology Studio</h2>
        <p>Edit the configuration, validate, and version the ontology definition.</p>
      </div>
    </div>
    <div class="panel">
      <h3>Config metadata</h3>
      <div class="field-grid" id="config-metadata"></div>
    </div>
    <div class="panel">
      <h3>Instance manager</h3>
      <p class="help-text">Select any object type to view and update instance fields.</p>
      <select id="instance-type" data-allow-viewer="true"></select>
      <div id="instance-manager" class="stacked"></div>
    </div>
    <div class="panel">
      <h3>Raw JSON editor</h3>
      <textarea id="config-json" rows="18"></textarea>
      <div class="button-row">
        <button class="primary" id="save-config">Save config version</button>
      </div>
      <p class="help-text" id="config-error"></p>
    </div>
    <div class="panel">
      <h3>Config versions</h3>
      <div class="card-grid" id="config-versions"></div>
    </div>
  `;

  const metadataEl = container.querySelector("#config-metadata");
  const jsonEl = container.querySelector("#config-json");
  const errorEl = container.querySelector("#config-error");
  const versionsEl = container.querySelector("#config-versions");
  const instanceSelect = container.querySelector("#instance-type");
  const instanceManager = container.querySelector("#instance-manager");

  jsonEl.value = JSON.stringify(state.config, null, 2);

  const metadataFields = {
    company_name: state.config.client_metadata.company_name,
    primary_objective: state.config.client_metadata.primary_objective,
    fde_lead: state.config.client_metadata.fde_lead,
    deployment_timeline: state.config.client_metadata.deployment_timeline
  };

  Object.entries(metadataFields).forEach(([key, value]) => {
    metadataEl.appendChild(
      renderField({
        label: key,
        value,
        fieldType: inferFieldType(key),
        state,
        referenceMap: {},
        onChange: (next) => {
          state.config.client_metadata[key] = next;
          state.isDirty = true;
          persistState(state);
          updateHeader(state);
        }
      })
    );
  });

  container.querySelector("#save-config").addEventListener("click", () => {
    try {
      const parsed = JSON.parse(jsonEl.value);
      if (!parsed.semantic_layer || !parsed.kinetic_layer) {
        throw new Error("Config missing semantic_layer or kinetic_layer.");
      }
      state.config = parsed;
      state.config_versions.unshift({
        id: `config_${Date.now()}`,
        created_at: new Date().toISOString(),
        created_by: state.role,
        config_json: clone(parsed)
      });
      errorEl.textContent = "Config saved.";
      errorEl.className = "help-text success";
      state.isDirty = true;
      persistState(state);
      renderAll(state);
    } catch (error) {
      errorEl.textContent = error.message;
      errorEl.className = "help-text error";
    }
  });

  instanceSelect.innerHTML = state.config.semantic_layer.object_types
    .map((objectType) => `<option value="${objectType.id}">${toTitle(objectType.id)}</option>`)
    .join("");
  instanceSelect.addEventListener("change", () => {
    instanceManager.innerHTML = "";
    instanceManager.appendChild(renderObjectListPanel(state, instanceSelect.value));
  });
  instanceManager.appendChild(renderObjectListPanel(state, instanceSelect.value));

  versionsEl.innerHTML = state.config_versions
    .map(
      (version) => `
      <div class="object-card">
        <header>
          <strong>${version.id}</strong>
        </header>
        <p>Saved: ${formatDate(version.created_at)}</p>
        <p>By: ${version.created_by}</p>
      </div>`
    )
    .join("");
};

const renderDataIntegration = (state) => {
  const container = pages.dataIntegration;
  container.innerHTML = `
    <div class="page-header">
      <div>
        <h2>Data Integration</h2>
        <p>Source systems and pipelines that hydrate the ontology.</p>
      </div>
    </div>
    <div class="panel">
      <h3>Sources</h3>
      <ul>
        ${state.config.data_integration_mapping.sources.map((source) => `<li>${source}</li>`).join("")}
      </ul>
    </div>
    <div class="panel">
      <h3>Pipeline tooling</h3>
      <p>${state.config.data_integration_mapping.pipeline_tool}</p>
    </div>
  `;
};

const renderAudit = (state) => {
  const container = pages.audit;
  container.innerHTML = `
    <div class="page-header">
      <div>
        <h2>Audit & Activity</h2>
        <p>Track every edit, workflow, and config update.</p>
      </div>
    </div>
    <div class="card-grid">
      ${state.audit_log
        .slice(0, 12)
        .map(
          (entry) => `
        <div class="object-card">
          <header>
            <strong>${entry.action}</strong>
          </header>
          <p>Object: ${entry.object_type}</p>
          <p>Actor: ${entry.actor_role}</p>
          <p>At: ${formatDate(entry.occurred_at)}</p>
        </div>`
        )
        .join("")}
    </div>
  `;
};

const renderJsonPanel = (state) => {
  const jsonOutputEl = document.getElementById("json-output");
  jsonOutputEl.value = JSON.stringify(
    {
      config: state.config,
      instances: state.instances,
      links: state.links,
      derived_values: state.derived_values,
      action_log: state.action_log
    },
    null,
    2
  );
};

const renderAll = (state) => {
  updateHeader(state);
  renderOverview(state);
  renderAccounts(state);
  renderEngagements(state);
  renderOutcomes(state);
  renderRisks(state);
  renderActions(state);
  renderOntologyStudio(state);
  renderDataIntegration(state);
  renderAudit(state);
  renderJsonPanel(state);
  toggleEditing(document.body, state);
};

const navigate = (state) => {
  const hash = window.location.hash || "#/overview";
  const [route, id] = hash.replace("#/", "").split("/");

  Object.values(pages).forEach((page) => {
    page.classList.remove("active");
  });

  if (route === "accounts" && id) {
    pages.accountDetail.classList.add("active");
    renderAccountDetail(state, id);
    return;
  }

  if (route === "overview") pages.overview.classList.add("active");
  if (route === "accounts") pages.accounts.classList.add("active");
  if (route === "engagements") pages.engagements.classList.add("active");
  if (route === "outcomes") pages.outcomes.classList.add("active");
  if (route === "risks") pages.risks.classList.add("active");
  if (route === "actions") pages.actions.classList.add("active");
  if (route === "ontology") pages.ontology.classList.add("active");
  if (route === "data-integration") pages.dataIntegration.classList.add("active");
  if (route === "audit") pages.audit.classList.add("active");
};

const initializeState = async () => {
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
        config_json: clone(config)
      }
    ],
    role: DEFAULT_ROLE,
    last_saved_at: null,
    isDirty: false
  };
};

const init = async () => {
  const state = await initializeState();
  computeDerived(state);
  persistState(state);
  renderAll(state);
  navigate(state);

  window.addEventListener("hashchange", () => navigate(state));

  roleSelectEl.addEventListener("change", () => {
    state.role = roleSelectEl.value;
    persistState(state);
    renderAll(state);
  });

  resetButton.addEventListener("click", () => {
    if (!confirm("Reset all local changes?")) return;
    clearState();
    window.location.reload();
  });

  downloadButton.addEventListener("click", () => {
    const blob = new Blob([document.getElementById("json-output").value], {
      type: "application/json"
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "ontology-decision-cockpit.json";
    anchor.click();
    URL.revokeObjectURL(url);
  });
};

init();
