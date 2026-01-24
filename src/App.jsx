import { useEffect, useMemo, useState } from "react";
import {
  buildReferenceMap,
  computeDerived,
  createEmptyRecord,
  formatDate,
  formatPercent,
  getDerived,
  inferFieldType,
  initializeState,
  normalizeFieldValue,
  parseFieldValue,
  persistState,
  toTitle,
  generateAuditEntry,
} from "@/lib/dashboard";
import { clearState } from "@/lib/storage";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

const ROUTES = [
  "overview",
  "accounts",
  "engagements",
  "outcomes",
  "risks",
  "actions",
  "ontology",
  "data-integration",
  "audit",
  "json-export",
];

const readRoute = () => {
  const hash = window.location.hash || "#/overview";
  const [page, id] = hash.replace("#/", "").split("/");
  return { page: ROUTES.includes(page) ? page : "overview", id };
};

const useHashRoute = () => {
  const [route, setRoute] = useState(readRoute);

  useEffect(() => {
    const handle = () => setRoute(readRoute());
    window.addEventListener("hashchange", handle);
    handle();
    return () => window.removeEventListener("hashchange", handle);
  }, []);

  return route;
};

const DerivedPanel = ({ derived, label }) => {
  if (!derived) return null;
  return (
    <div className="explain-panel">
      <div className="explain-header">
        <strong>{toTitle(label)}</strong>
        <span>{formatDate(derived.computed_at)}</span>
      </div>
      <div className="explain-body">
        <p>
          <strong>Value:</strong> {derived.value}
        </p>
        <pre>{JSON.stringify(derived.explanation_json, null, 2)}</pre>
      </div>
    </div>
  );
};

const RecordField = ({ label, value, fieldType, referenceMap, onChange, disabled }) => {
  const normalizedValue = normalizeFieldValue(value);

  if (fieldType === "boolean") {
    return (
      <div className="field-group">
        <label>{toTitle(label)}</label>
        <Checkbox
          checked={Boolean(value)}
          onCheckedChange={(checked) => onChange(Boolean(checked))}
          disabled={disabled}
        />
      </div>
    );
  }

  if (fieldType === "reference" && referenceMap[label]) {
    const { options, idField, objectType } = referenceMap[label];
    return (
      <div className="field-group">
        <label>{toTitle(label)}</label>
        <Select
          value={value ?? ""}
          onValueChange={(next) => onChange(next)}
          disabled={disabled}
        >
          <SelectTrigger>
            <SelectValue placeholder={`Select ${toTitle(objectType.id)}`} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Select {toTitle(objectType.id)}</SelectItem>
            {options.map((option) => (
              <SelectItem key={option[idField]} value={option[idField]}>
                {option.name || option.title || option[idField]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    );
  }

  if (Array.isArray(value)) {
    return (
      <div className="field-group">
        <label>{toTitle(label)}</label>
        <Textarea
          value={normalizedValue}
          onChange={(event) =>
            onChange(
              parseFieldValue({ value: event.target.value, current: value, fieldType })
            )
          }
          disabled={disabled}
        />
      </div>
    );
  }

  const shouldUseTextarea = String(value ?? "").length > 80;
  const inputType =
    fieldType === "number"
      ? "number"
      : fieldType === "date"
        ? "date"
        : fieldType === "datetime"
          ? "datetime-local"
          : fieldType === "url"
            ? "url"
            : "text";

  return (
    <div className="field-group">
      <label>{toTitle(label)}</label>
      {shouldUseTextarea ? (
        <Textarea
          value={normalizedValue}
          onChange={(event) =>
            onChange(
              parseFieldValue({ value: event.target.value, current: value, fieldType })
            )
          }
          disabled={disabled}
        />
      ) : (
        <Input
          type={inputType}
          value={normalizedValue}
          onChange={(event) =>
            onChange(
              parseFieldValue({ value: event.target.value, current: value, fieldType })
            )
          }
          disabled={disabled}
        />
      )}
    </div>
  );
};

const RecordCard = ({ record, objectType, referenceMap, onUpdate, onDelete, disabled }) => {
  const idField = objectType.properties.find((prop) => prop.endsWith("_id"));
  const displayTitle =
    record.name || record.title || record[objectType.properties[1]] || record[idField];

  return (
    <Card className="object-card">
      <CardHeader className="flex flex-row items-start justify-between gap-4">
        <CardTitle>{displayTitle}</CardTitle>
        <Button variant="destructive" size="sm" onClick={onDelete} disabled={disabled}>
          Remove
        </Button>
      </CardHeader>
      <CardContent className="space-y-3">
        {objectType.properties.map((prop) => {
          const fieldType = inferFieldType(prop, objectType.field_overrides || {});
          return (
            <RecordField
              key={`${record[idField] ?? "record"}-${prop}`}
              label={prop}
              value={record[prop]}
              fieldType={fieldType}
              referenceMap={referenceMap}
              onChange={(value) => onUpdate({ ...record, [prop]: value })}
              disabled={disabled}
            />
          );
        })}
      </CardContent>
    </Card>
  );
};

const ObjectListPanel = ({ state, objectTypeId, onUpdateRecord, onDeleteRecord, onAddRecord }) => {
  const objectType = state.config.semantic_layer.object_types.find((item) => item.id === objectTypeId);
  if (!objectType) return null;
  const records = state.instances[objectTypeId] || [];
  const referenceMap = buildReferenceMap(state.config, state.instances);
  const isViewer = state.role === "Viewer";

  return (
    <div className="space-y-4">
      <div className="card-grid">
        {records.map((record, index) => (
          <RecordCard
            key={`${objectTypeId}-${record[objectType.properties[0]] ?? index}`}
            record={record}
            objectType={objectType}
            referenceMap={referenceMap}
            onUpdate={(updated) => onUpdateRecord(objectTypeId, index, updated)}
            onDelete={() => onDeleteRecord(objectTypeId, index)}
            disabled={isViewer}
          />
        ))}
      </div>
      <Button onClick={() => onAddRecord(objectTypeId)} disabled={isViewer}>
        Add {toTitle(objectTypeId)}
      </Button>
    </div>
  );
};

const SummaryTile = ({ label, value }) => (
  <div className="summary-tile">
    <span className="label">{label}</span>
    <strong>{value}</strong>
  </div>
);

const PageHeader = ({ title, description, action }) => (
  <div className="page-header">
    <div>
      <h2>{title}</h2>
      <p>{description}</p>
    </div>
    {action}
  </div>
);

const App = () => {
  const route = useHashRoute();
  const [state, setState] = useState(null);
  const [configDraft, setConfigDraft] = useState("");
  const [configMessage, setConfigMessage] = useState({ text: "", tone: "help-text" });
  const [instanceType, setInstanceType] = useState("");

  useEffect(() => {
    let isMounted = true;
    initializeState().then((initialState) => {
      computeDerived(initialState);
      persistState(initialState);
      if (isMounted) {
        setState(initialState);
        setConfigDraft(JSON.stringify(initialState.config, null, 2));
        setInstanceType(initialState.config.semantic_layer.object_types[0]?.id ?? "");
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  const applyUpdate = (updater) => {
    setState((prev) => {
      if (!prev) return prev;
      const next = structuredClone(prev);
      updater(next);
      next.isDirty = true;
      computeDerived(next);
      persistState(next);
      return next;
    });
  };

  const handleRoleChange = (value) => {
    applyUpdate((next) => {
      next.role = value;
    });
  };

  const handleUpdateRecord = (objectTypeId, index, updated) => {
    applyUpdate((next) => {
      if (!next.instances[objectTypeId]) {
        next.instances[objectTypeId] = [];
      }
      Object.assign(next.instances[objectTypeId][index], updated);
      generateAuditEntry(
        {
          action: "update",
          object_type: objectTypeId,
          object_id: next.instances[objectTypeId][index][next.config.semantic_layer.object_types.find((t) => t.id === objectTypeId)?.properties?.[0]] || "",
        },
        next
      );
    });
  };

  const handleDeleteRecord = (objectTypeId, index) => {
    applyUpdate((next) => {
      if (!next.instances[objectTypeId]) {
        next.instances[objectTypeId] = [];
      }
      const objectType = next.config.semantic_layer.object_types.find((t) => t.id === objectTypeId);
      const [removed] = next.instances[objectTypeId].splice(index, 1);
      generateAuditEntry(
        {
          action: "delete",
          object_type: objectTypeId,
          object_id: removed?.[objectType?.properties?.[0]] || "",
        },
        next
      );
    });
  };

  const handleAddRecord = (objectTypeId) => {
    applyUpdate((next) => {
      const objectType = next.config.semantic_layer.object_types.find((t) => t.id === objectTypeId);
      const record = createEmptyRecord(objectType);
      if (!next.instances[objectTypeId]) {
        next.instances[objectTypeId] = [];
      }
      next.instances[objectTypeId].push(record);
      generateAuditEntry(
        {
          action: "create",
          object_type: objectTypeId,
          object_id: record[objectType.properties[0]] || "",
        },
        next
      );
    });
  };

  const handleActionSubmit = (action, formData) => {
    applyUpdate((next) => {
      next.action_log.unshift({
        id: `action_${Date.now()}`,
        action_type: action.id,
        parameters: Object.fromEntries(formData.entries()),
        status: "Stubbed",
        run_at: new Date().toISOString(),
        side_effects_status: action.side_effects.map((effect) => ({ effect, status: "Pending" })),
      });
      generateAuditEntry(
        {
          action: "run_action",
          object_type: "action_log",
          object_id: action.id,
        },
        next
      );
    });
  };

  const handleMetadataChange = (key, value) => {
    applyUpdate((next) => {
      next.config.client_metadata[key] = value;
    });
  };

  const handleSaveConfig = () => {
    try {
      const parsed = JSON.parse(configDraft);
      if (!parsed.semantic_layer || !parsed.kinetic_layer) {
        throw new Error("Config missing semantic_layer or kinetic_layer.");
      }
      applyUpdate((next) => {
        next.config = parsed;
        next.config_versions.unshift({
          id: `config_${Date.now()}`,
          created_at: new Date().toISOString(),
          created_by: next.role,
          config_json: structuredClone(parsed),
        });
      });
      setConfigDraft(JSON.stringify(parsed, null, 2));
      setConfigMessage({ text: "Config saved.", tone: "help-text success" });
    } catch (error) {
      setConfigMessage({ text: error.message, tone: "help-text error" });
    }
  };

  const handleReset = () => {
    if (!window.confirm("Reset all local changes?")) return;
    clearState();
    window.location.reload();
  };

  const handleDownload = () => {
    if (!state) return;
    const blob = new Blob(
      [
        JSON.stringify(
          {
            config: state.config,
            instances: state.instances,
            links: state.links,
            derived_values: state.derived_values,
            action_log: state.action_log,
          },
          null,
          2
        ),
      ],
      { type: "application/json" }
    );
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "ontology-decision-cockpit.json";
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const activePage = useMemo(() => {
    if (route.page === "accounts" && route.id) {
      return "account-detail";
    }
    return route.page;
  }, [route]);

  if (!state) {
    return <div className="loading">Loading dashboard…</div>;
  }

  const isViewer = state.role === "Viewer";
  const accounts = state.instances.client_account || [];
  const attentionAccounts = accounts
    .map((account) => ({
      account,
      health: getDerived(state, "client_account", account.account_id, "health_score"),
      risk: getDerived(state, "client_account", account.account_id, "renewal_risk_score"),
      segment: getDerived(state, "client_account", account.account_id, "segment_tag"),
    }))
    .sort((a, b) => (b.risk?.value || 0) - (a.risk?.value || 0))
    .slice(0, 4);

  const avgHealth = accounts.length
    ? Math.round(
        accounts.reduce(
          (sum, account) =>
            sum + (getDerived(state, "client_account", account.account_id, "health_score")?.value || 0),
          0
        ) / accounts.length
      )
    : 0;

  const avgRisk = accounts.length
    ? Math.round(
        accounts.reduce(
          (sum, account) =>
            sum + (getDerived(state, "client_account", account.account_id, "renewal_risk_score")?.value || 0),
          0
        ) / accounts.length
      )
    : 0;

  const onTrackOutcomes = (state.instances.outcome || []).filter(
    (outcome) => (getDerived(state, "outcome", outcome.outcome_id, "progress_pct")?.value || 0) >= 0.6
  ).length;

  const accountDetail = route.id
    ? accounts.find((acc) => acc.account_id === route.id)
    : null;

  const engagements = state.instances.consulting_engagement || [];
  const outcomes = state.instances.outcome || [];

  const configMetadata = {
    company_name: state.config.client_metadata.company_name,
    primary_objective: state.config.client_metadata.primary_objective,
    fde_lead: state.config.client_metadata.fde_lead,
    deployment_timeline: state.config.client_metadata.deployment_timeline,
  };

  const selectedInstanceType =
    instanceType || state.config.semantic_layer.object_types[0]?.id || "";

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="header-top">
          <div className="brand">
            <span className="logo">OD</span>
            <div>
              <p className="eyebrow">Ontology Decision Cockpit</p>
              <h1>{state.config.client_metadata.company_name || "Client Value Dashboard"}</h1>
            </div>
          </div>
          <div className="header-status">
            <Badge variant={state.isDirty ? "secondary" : "default"}>
              {state.isDirty ? "Unsaved" : "Synced"}
            </Badge>
            <Badge variant="subtle">
              {state.last_saved_at
                ? `Last saved ${formatDate(state.last_saved_at)}`
                : "Changes auto-save locally"}
            </Badge>
          </div>
        </div>
        <div className="header-body">
          <p className="objective">{state.config.client_metadata.primary_objective || ""}</p>
          <div className="meta">
            <div className="meta-card">
              <span className="label">FDE Lead</span>
              <strong>{state.config.client_metadata.fde_lead || "—"}</strong>
            </div>
            <div className="meta-card">
              <span className="label">Deployment timeline</span>
              <strong>{state.config.client_metadata.deployment_timeline || "—"}</strong>
            </div>
          </div>
          <div className="meta">
            <div className="meta-card">
              <span className="label">Role</span>
              <Select value={state.role} onValueChange={handleRoleChange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Admin">Admin</SelectItem>
                  <SelectItem value="Operator">Operator</SelectItem>
                  <SelectItem value="Viewer">Viewer</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </header>

      <main className="layout">
        <aside className="sidebar">
          <div className="sidebar-header">
            <h2>Decision cockpit</h2>
            <p>Navigate by business outcomes.</p>
          </div>
          <nav>
            <a href="#/overview">Executive Overview</a>
            <a href="#/accounts">Accounts</a>
            <a href="#/engagements">Engagements</a>
            <a href="#/outcomes">Outcomes & KPIs</a>
            <a href="#/risks">Risks & Issues</a>
            <a href="#/actions">Action Center</a>
            <a href="#/ontology">Ontology Studio</a>
            <a href="#/data-integration">Data Integration</a>
            <a href="#/audit">Audit & Activity</a>
            <a href="#/json-export">JSON Export</a>
          </nav>
        </aside>

        <section className="content">
          {activePage === "overview" && (
            <section className="page active">
              <PageHeader
                title="Executive Overview"
                description="Portfolio-level signals for renewal readiness, delivery reliability, and value realization."
                action={<div className="pill">{state.config.client_metadata.company_name || "Client Portfolio"}</div>}
              />
              <div className="summary-grid">
                <SummaryTile label="Portfolio health score" value={avgHealth} />
                <SummaryTile label="Renewal risk index" value={avgRisk} />
                <SummaryTile label="Outcomes on track" value={onTrackOutcomes} />
              </div>
              <div className="panel">
                <h3>Accounts needing attention</h3>
                <div className="card-grid">
                  {attentionAccounts.map(({ account, health, risk, segment }) => (
                    <Card key={account.account_id} className="object-card">
                      <CardHeader className="flex flex-row items-center justify-between gap-3">
                        <CardTitle>{account.account_name}</CardTitle>
                        <a className="link" href={`#/accounts/${account.account_id}`}>
                          Open
                        </a>
                      </CardHeader>
                      <CardContent>
                        <p>Health: {health?.value ?? "—"}</p>
                        <p>Renewal risk: {risk?.value ?? "—"}</p>
                        <p>Segment: {segment?.value ?? account.segment_tag}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </section>
          )}

          {activePage === "accounts" && (
            <section className="page active">
              <PageHeader
                title="Accounts"
                description="Monitor renewal readiness and value realization across the portfolio."
              />
              <div className="card-grid">
                {accounts.map((account) => {
                  const health = getDerived(state, "client_account", account.account_id, "health_score");
                  const risk = getDerived(state, "client_account", account.account_id, "renewal_risk_score");
                  const segment = getDerived(state, "client_account", account.account_id, "segment_tag");
                  return (
                    <Card key={account.account_id} className="object-card">
                      <CardHeader className="flex flex-row items-center justify-between gap-3">
                        <CardTitle>{account.account_name}</CardTitle>
                        <a className="link" href={`#/accounts/${account.account_id}`}>
                          Open
                        </a>
                      </CardHeader>
                      <CardContent>
                        <p>Industry: {account.industry}</p>
                        <p>Health score: {health?.value ?? account.health_score}</p>
                        <p>Renewal risk: {risk?.value ?? account.renewal_risk_score}</p>
                        <p>Segment: {segment?.value ?? account.segment_tag}</p>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
              <div className="panel">
                <h3>Manage account records</h3>
                <ObjectListPanel
                  state={state}
                  objectTypeId="client_account"
                  onUpdateRecord={handleUpdateRecord}
                  onDeleteRecord={handleDeleteRecord}
                  onAddRecord={handleAddRecord}
                />
              </div>
            </section>
          )}

          {activePage === "account-detail" && (
            <section className="page active">
              {accountDetail ? (
                <>
                  <PageHeader
                    title={accountDetail.account_name}
                    description="Account command center with explainable scores and actions."
                    action={
                      <a className="link" href="#/accounts">
                        Back to accounts
                      </a>
                    }
                  />
                  <div className="summary-grid">
                    <SummaryTile
                      label="Health score"
                      value={
                        getDerived(state, "client_account", accountDetail.account_id, "health_score")?.value ??
                        accountDetail.health_score
                      }
                    />
                    <SummaryTile
                      label="Renewal risk"
                      value={
                        getDerived(state, "client_account", accountDetail.account_id, "renewal_risk_score")?.value ??
                        accountDetail.renewal_risk_score
                      }
                    />
                    <SummaryTile
                      label="Segment"
                      value={
                        getDerived(state, "client_account", accountDetail.account_id, "segment_tag")?.value ??
                        accountDetail.segment_tag
                      }
                    />
                  </div>
                  <div className="split-panel">
                    <div>
                      <h3>Engagements</h3>
                      <div className="card-grid">
                        {engagements
                          .filter((engagement) => engagement.account_id === accountDetail.account_id)
                          .map((engagement) => (
                            <Card key={engagement.engagement_id} className="object-card">
                              <CardHeader>
                                <CardTitle>{engagement.engagement_name}</CardTitle>
                              </CardHeader>
                              <CardContent>
                                <p>Status: {engagement.status}</p>
                                <p>Renewal date: {formatDate(engagement.renewal_date)}</p>
                              </CardContent>
                            </Card>
                          ))}
                      </div>
                    </div>
                    <div>
                      <h3>Outcomes</h3>
                      <div className="card-grid">
                        {outcomes
                          .filter((outcome) =>
                            engagements.some(
                              (engagement) =>
                                engagement.engagement_id === outcome.engagement_id &&
                                engagement.account_id === accountDetail.account_id
                            )
                          )
                          .map((outcome) => {
                            const progress = getDerived(state, "outcome", outcome.outcome_id, "progress_pct");
                            return (
                              <Card key={outcome.outcome_id} className="object-card">
                                <CardHeader>
                                  <CardTitle>{outcome.name}</CardTitle>
                                </CardHeader>
                                <CardContent>
                                  <p>Status: {outcome.status}</p>
                                  <p>Progress: {progress ? formatPercent(progress.value) : "—"}</p>
                                </CardContent>
                              </Card>
                            );
                          })}
                      </div>
                    </div>
                  </div>
                  <div className="panel">
                    <h3>Explainability</h3>
                    <DerivedPanel
                      derived={getDerived(state, "client_account", accountDetail.account_id, "health_score")}
                      label="health_score"
                    />
                    <DerivedPanel
                      derived={getDerived(state, "client_account", accountDetail.account_id, "renewal_risk_score")}
                      label="renewal_risk_score"
                    />
                    <DerivedPanel
                      derived={getDerived(state, "client_account", accountDetail.account_id, "segment_tag")}
                      label="segment_tag"
                    />
                  </div>
                </>
              ) : (
                <div className="empty-state">
                  <h2>Account not found</h2>
                  <p>Select an account from the Accounts page.</p>
                </div>
              )}
            </section>
          )}

          {activePage === "engagements" && (
            <section className="page active">
              <PageHeader
                title="Consulting engagements"
                description="Active engagements with scope, owners, and renewal markers."
              />
              <ObjectListPanel
                state={state}
                objectTypeId="consulting_engagement"
                onUpdateRecord={handleUpdateRecord}
                onDeleteRecord={handleDeleteRecord}
                onAddRecord={handleAddRecord}
              />
            </section>
          )}

          {activePage === "outcomes" && (
            <section className="page active">
              <PageHeader title="Outcomes & KPIs" description="Track measurable value realization and KPI progress." />
              <div className="card-grid">
                {outcomes.map((outcome) => {
                  const progress = getDerived(state, "outcome", outcome.outcome_id, "progress_pct");
                  return (
                    <Card key={outcome.outcome_id} className="object-card">
                      <CardHeader>
                        <CardTitle>{outcome.name}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p>Status: {outcome.status}</p>
                        <p>Target date: {formatDate(outcome.target_date)}</p>
                        <p>Progress: {progress ? formatPercent(progress.value) : "—"}</p>
                        <DerivedPanel derived={progress} label="progress_pct" />
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
              <div className="panel">
                <h3>KPI Metrics</h3>
                <div className="card-grid">
                  {(state.instances.kpi_metric || []).map((metric) => (
                    <Card key={metric.metric_id} className="object-card">
                      <CardHeader>
                        <CardTitle>{metric.name}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p>Baseline: {metric.baseline_value}</p>
                        <p>Target: {metric.target_value}</p>
                        <p>Cadence: {metric.measurement_cadence}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
              <div className="panel">
                <h3>Manage outcome records</h3>
                <ObjectListPanel
                  state={state}
                  objectTypeId="outcome"
                  onUpdateRecord={handleUpdateRecord}
                  onDeleteRecord={handleDeleteRecord}
                  onAddRecord={handleAddRecord}
                />
                <ObjectListPanel
                  state={state}
                  objectTypeId="kpi_metric"
                  onUpdateRecord={handleUpdateRecord}
                  onDeleteRecord={handleDeleteRecord}
                  onAddRecord={handleAddRecord}
                />
                <ObjectListPanel
                  state={state}
                  objectTypeId="kpi_snapshot"
                  onUpdateRecord={handleUpdateRecord}
                  onDeleteRecord={handleDeleteRecord}
                  onAddRecord={handleAddRecord}
                />
              </div>
            </section>
          )}

          {activePage === "risks" && (
            <section className="page active">
              <PageHeader title="Risks & Issues" description="Surface threats to delivery timelines and outcomes." />
              <ObjectListPanel
                state={state}
                objectTypeId="risk_issue"
                onUpdateRecord={handleUpdateRecord}
                onDeleteRecord={handleDeleteRecord}
                onAddRecord={handleAddRecord}
              />
            </section>
          )}

          {activePage === "actions" && (
            <section className="page active">
              <PageHeader title="Action Center" description="Execute workflows and document interventions." />
              <div className="panel">
                <h3>Launch action</h3>
                <div className="action-grid">
                  {state.config.kinetic_layer.action_types.map((action) => (
                    <Card key={action.id} className="object-card">
                      <CardHeader>
                        <CardTitle>{action.id}</CardTitle>
                        <CardDescription>{action.description}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <form
                          className="action-form"
                          onSubmit={(event) => {
                            event.preventDefault();
                            if (isViewer) return;
                            handleActionSubmit(action, new FormData(event.currentTarget));
                            event.currentTarget.reset();
                          }}
                        >
                          {action.parameters.map((param) => (
                            <label key={param} className="action-label">
                              {toTitle(param)}
                              <Input name={param} disabled={isViewer} />
                            </label>
                          ))}
                          <Button type="submit" disabled={isViewer}>
                            Run action
                          </Button>
                        </form>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
              <div className="panel">
                <h3>Action log</h3>
                <div className="card-grid">
                  {state.action_log.map((entry) => (
                    <Card key={entry.id} className="object-card">
                      <CardHeader>
                        <CardTitle>{entry.action_type}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p>Status: {entry.status}</p>
                        <p>Run at: {formatDate(entry.run_at)}</p>
                        <pre>{JSON.stringify(entry.parameters, null, 2)}</pre>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </section>
          )}

          {activePage === "ontology" && (
            <section className="page active">
              <PageHeader
                title="Ontology Studio"
                description="Edit the configuration, validate, and version the ontology definition."
              />
              <div className="panel">
                <h3>Config metadata</h3>
                <div className="field-grid">
                  {Object.entries(configMetadata).map(([key, value]) => (
                    <RecordField
                      key={key}
                      label={key}
                      value={value}
                      fieldType={inferFieldType(key)}
                      referenceMap={{}}
                      onChange={(next) => handleMetadataChange(key, next)}
                      disabled={isViewer}
                    />
                  ))}
                </div>
              </div>
              <div className="panel">
                <h3>Instance manager</h3>
                <p className="help-text">Select any object type to view and update instance fields.</p>
                <Select
                  value={selectedInstanceType}
                  onValueChange={setInstanceType}
                  disabled={isViewer}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select object type" />
                  </SelectTrigger>
                  <SelectContent>
                    {state.config.semantic_layer.object_types.map((objectType) => (
                      <SelectItem key={objectType.id} value={objectType.id}>
                        {toTitle(objectType.id)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="stacked">
                  <ObjectListPanel
                    state={state}
                    objectTypeId={selectedInstanceType}
                    onUpdateRecord={handleUpdateRecord}
                    onDeleteRecord={handleDeleteRecord}
                    onAddRecord={handleAddRecord}
                  />
                </div>
              </div>
              <div className="panel">
                <h3>Raw JSON editor</h3>
                <Textarea
                  rows={18}
                  value={configDraft}
                  onChange={(event) => setConfigDraft(event.target.value)}
                  disabled={isViewer}
                />
                <div className="button-row">
                  <Button onClick={handleSaveConfig} disabled={isViewer}>
                    Save config version
                  </Button>
                </div>
                <p className={configMessage.tone}>{configMessage.text}</p>
              </div>
              <div className="panel">
                <h3>Config versions</h3>
                <div className="card-grid">
                  {state.config_versions.map((version) => (
                    <Card key={version.id} className="object-card">
                      <CardHeader>
                        <CardTitle>{version.id}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p>Saved: {formatDate(version.created_at)}</p>
                        <p>By: {version.created_by}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </section>
          )}

          {activePage === "data-integration" && (
            <section className="page active">
              <PageHeader
                title="Data Integration"
                description="Source systems and pipelines that hydrate the ontology."
              />
              <div className="panel">
                <h3>Sources</h3>
                <ul>
                  {state.config.data_integration_mapping.sources.map((source) => (
                    <li key={source}>{source}</li>
                  ))}
                </ul>
              </div>
              <div className="panel">
                <h3>Pipeline tooling</h3>
                <p>{state.config.data_integration_mapping.pipeline_tool}</p>
              </div>
            </section>
          )}

          {activePage === "audit" && (
            <section className="page active">
              <PageHeader title="Audit & Activity" description="Track every edit, workflow, and config update." />
              <div className="card-grid">
                {state.audit_log.slice(0, 12).map((entry) => (
                  <Card key={entry.id} className="object-card">
                    <CardHeader>
                      <CardTitle>{entry.action}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p>Object: {entry.object_type}</p>
                      <p>Actor: {entry.actor_role}</p>
                      <p>At: {formatDate(entry.occurred_at)}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>
          )}

          {activePage === "json-export" && (
            <section className="card">
              <div className="card-header">
                <h2>Current JSON</h2>
                <p>Configuration, instances, computed values, and action logs.</p>
              </div>
              <Textarea
                rows={18}
                value={JSON.stringify(
                  {
                    config: state.config,
                    instances: state.instances,
                    links: state.links,
                    derived_values: state.derived_values,
                    action_log: state.action_log,
                  },
                  null,
                  2
                )}
                readOnly
              />
              <div className="button-row">
                <Button onClick={handleDownload}>Download JSON</Button>
                <Button variant="ghost" onClick={handleReset}>
                  Reset changes
                </Button>
              </div>
            </section>
          )}
        </section>
      </main>
    </div>
  );
};

export default App;
