import { useEffect, useMemo, useState } from "react";
import {
  buildReferenceMap,
  computeDerived,
  createEmptyRecord,
  formatDate,
  formatPercent,
  getDerived,
  groupBy,
  inferFieldType,
  initializeState,
  normalizeFieldValue,
  parseFieldValue,
  persistState,
  toTitle,
  generateAuditEntry,
} from "@/lib/dashboard";
import { clearState } from "@/lib/storage";
import { NAV_ITEMS, readRouteFromHash, resolveActivePage, toHashHref } from "@/lib/routing.mjs";
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

const readRoute = () => readRouteFromHash(window.location.hash);

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

const formatNumber = (value) =>
  Number.isFinite(value) ? value.toLocaleString() : value ?? "—";

const formatSignedNumber = (value, digits = 1) => {
  if (!Number.isFinite(value)) return "—";
  const rounded = Number(value.toFixed(digits));
  return rounded > 0 ? `+${rounded}` : `${rounded}`;
};

const formatMetricValue = (value, unit) =>
  Number.isFinite(value) ? `${value}${unit ? ` ${unit}` : ""}` : "—";

const getLatestSnapshot = (snapshots = []) =>
  snapshots.reduce(
    (latest, snap) =>
      !latest || new Date(snap.observed_at) > new Date(latest.observed_at) ? snap : latest,
    null
  );

const computeMetricProgress = (metric, snapshot) => {
  if (!snapshot) return 0;
  const baseline = Number(metric.baseline_value);
  const target = Number(metric.target_value);
  if (!Number.isFinite(baseline) || !Number.isFinite(target) || target === baseline) return 0;
  if (target > baseline) {
    return (Number(snapshot.value) - baseline) / (target - baseline);
  }
  return (baseline - Number(snapshot.value)) / (baseline - target);
};

const computeForecastDate = ({ targetDate, progressValue, cadenceDays = 30 }) => {
  if (!targetDate || !Number.isFinite(progressValue) || progressValue <= 0) return null;
  const now = new Date();
  const target = new Date(targetDate);
  if (Number.isNaN(target.getTime())) return null;
  if (progressValue >= 1) return target;
  const remaining = target.getTime() - now.getTime();
  const projected = now.getTime() + remaining / Math.max(progressValue, 0.2);
  const buffer = cadenceDays * 24 * 60 * 60 * 1000;
  return new Date(projected + buffer);
};

const DerivedPanel = ({ derived, label }) => {
  if (!derived) return null;
  return (
    <details className="explain-panel">
      <summary className="explain-header">
        <strong>{toTitle(label)}</strong>
        <span>{formatDate(derived.computed_at)}</span>
      </summary>
      <div className="explain-body">
        <p>
          <strong>Value:</strong> {String(derived.value)}
        </p>
        <pre>{JSON.stringify(derived.explanation_json, null, 2)}</pre>
      </div>
    </details>
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
    const clearValue = "__clear__";
    const selectValue = value === "" || value == null ? clearValue : value;
    return (
      <div className="field-group">
        <label>{toTitle(label)}</label>
        <Select
          value={selectValue}
          onValueChange={(next) => onChange(next === clearValue ? "" : next)}
          disabled={disabled}
        >
          <SelectTrigger>
            <SelectValue placeholder={`Select ${toTitle(objectType.id)}`} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={clearValue}>Clear selection</SelectItem>
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

const KpiCard = ({ label, value, helper }) => (
  <div className="kpi-card">
    <span className="label">{label}</span>
    <strong>{value}</strong>
    {helper ? <span className="helper">{helper}</span> : null}
  </div>
);

const ChartCard = ({ title, description }) => (
  <Card className="chart-card">
    <CardHeader>
      <CardTitle>{title}</CardTitle>
      {description ? <CardDescription>{description}</CardDescription> : null}
    </CardHeader>
    <CardContent>
      <div className="chart-placeholder">Chart placeholder</div>
    </CardContent>
  </Card>
);

const ProgressIndicator = ({ value, forecast }) => (
  <div className="progress-indicator">
    <div className="progress-meta">
      <span>{formatPercent(value)}</span>
      <span className="muted">
        Forecast: {forecast ? formatDate(forecast) : "—"}
      </span>
    </div>
    <div className="progress-track">
      <div className="progress-fill" style={{ width: `${Math.min(value * 100, 100)}%` }} />
    </div>
  </div>
);

const TrendlineCard = ({ title, description, items }) => (
  <Card className="chart-card">
    <CardHeader>
      <CardTitle>{title}</CardTitle>
      {description ? <CardDescription>{description}</CardDescription> : null}
    </CardHeader>
    <CardContent>
      <div className="trendline-list">
        {items.length ? (
          items.map((item) => (
            <div key={item.key} className="trendline-item">
              <div className="trendline-header">
                <strong>{item.label}</strong>
                {item.status ? <Badge variant={item.status.variant}>{item.status.label}</Badge> : null}
              </div>
              <div className="trendline-metrics">
                <span>Baseline: {item.baseline}</span>
                <span>Target: {item.target}</span>
                <span>Latest: {item.latest}</span>
                <span className={item.varianceTone}>Variance: {item.variance}</span>
              </div>
              <div className="trendline-footnote">
                {item.updatedAt ? `Updated ${formatDate(item.updatedAt)}` : "No snapshot yet"}
              </div>
            </div>
          ))
        ) : (
          <div className="empty-state">No KPI metrics available.</div>
        )}
      </div>
    </CardContent>
  </Card>
);

const RollupCard = ({ title, description, topOutcomes, bottomOutcomes }) => (
  <Card className="chart-card">
    <CardHeader>
      <CardTitle>{title}</CardTitle>
      {description ? <CardDescription>{description}</CardDescription> : null}
    </CardHeader>
    <CardContent>
      <div className="rollup-grid">
        <div>
          <p className="rollup-label">Top outcomes</p>
          {topOutcomes.length ? (
            topOutcomes.map((outcome) => (
              <div key={outcome.id} className="rollup-item">
                <span>{outcome.label}</span>
                <Badge variant="secondary">{formatPercent(outcome.progress)}</Badge>
              </div>
            ))
          ) : (
            <div className="empty-state">No outcomes available.</div>
          )}
        </div>
        <div>
          <p className="rollup-label">Needs attention</p>
          {bottomOutcomes.length ? (
            bottomOutcomes.map((outcome) => (
              <div key={outcome.id} className="rollup-item">
                <span>{outcome.label}</span>
                <Badge variant="outline">{formatPercent(outcome.progress)}</Badge>
              </div>
            ))
          ) : (
            <div className="empty-state">No outcomes flagged.</div>
          )}
        </div>
      </div>
    </CardContent>
  </Card>
);

const DataTable = ({ columns, rows, onRowClick }) => (
  <div className="table-wrapper">
    <table>
      <thead>
        <tr>
          {columns.map((column) => (
            <th key={column}>{column}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr key={row.key} onClick={row.onClick || (() => onRowClick?.(row))}>
            {columns.map((column) => (
              <td key={`${row.key}-${column}`}>{row[column] ?? "—"}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

const ALL_FILTER_VALUE = "__all__";

const GlobalFiltersBar = ({ filters, onChange, filterOptions }) => (
  <div className="filter-bar">
    {[
      { key: "region", label: "Region", options: filterOptions.regions },
      { key: "segment", label: "Segment", options: filterOptions.segments },
      { key: "account", label: "Account", options: filterOptions.accounts },
      { key: "engagement", label: "Engagement", options: filterOptions.engagements },
      { key: "dateRange", label: "Date range", options: ["Last 30 days", "Last 90 days", "YTD"] },
    ].map((filter) => (
      <div key={filter.key} className="filter-item">
        <span>{filter.label}</span>
        <Select
          value={filters[filter.key]}
          onValueChange={(value) =>
            onChange(filter.key, value === ALL_FILTER_VALUE ? "" : value)
          }
        >
          <SelectTrigger>
            <SelectValue placeholder={`All ${filter.label}`} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL_FILTER_VALUE}>All</SelectItem>
            {filter.options.filter(Boolean).map((option) => (
              <SelectItem key={option} value={option}>
                {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    ))}
  </div>
);

const ObjectViewPanel = ({ record, objectType, derivedValues, relationships, onAction = [] }) => {
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    setActiveTab("overview");
  }, [record]);

  if (!record || !objectType) {
    return (
      <aside className="object-panel empty">
        <div>
          <h3>Select an object</h3>
          <p>Choose a row to view its object details, relationships, and actions.</p>
        </div>
      </aside>
    );
  }

  const primaryLabel = record.name || record.title || record.account_name || record.engagement_name || record.decision_title || record.invoice_id || record.payment_id;
  const idField = objectType.properties.find((prop) => prop.endsWith("_id"));
  const missingId = !record[idField];
  const evidenceLinks = [record.evidence_link, record.notes_link].filter(Boolean);

  return (
    <aside className="object-panel">
      <header>
        <div>
          <h3>{primaryLabel}</h3>
          <p>{toTitle(objectType.id)}</p>
        </div>
        {missingId ? <Badge variant="destructive">Data issue</Badge> : null}
      </header>
      <div className="object-tabs">
        {["overview", "relationships", "timeline", "evidence", "actions"].map((tab) => (
          <button
            key={tab}
            type="button"
            className={activeTab === tab ? "active" : ""}
            onClick={() => setActiveTab(tab)}
          >
            {toTitle(tab)}
          </button>
        ))}
      </div>
      {activeTab === "overview" && (
        <div className="object-section">
          <div className="object-fields">
            {objectType.properties.slice(0, 8).map((field) => (
              <div key={field}>
                <span>{toTitle(field)}</span>
                <strong>{record[field] ?? "—"}</strong>
              </div>
            ))}
          </div>
          {derivedValues.map((derived) => (
            <DerivedPanel key={derived.field} derived={derived} label={derived.field} />
          ))}
        </div>
      )}
      {activeTab === "relationships" && (
        <div className="object-section">
          {relationships.length ? (
            relationships.map((relation) => (
              <div key={relation.label} className="relationship-block">
                <h4>{relation.label}</h4>
                <ul>
                  {relation.records.map((item) => (
                    <li key={item.id}>{item.label}</li>
                  ))}
                </ul>
              </div>
            ))
          ) : (
            <p className="muted">No related records found.</p>
          )}
        </div>
      )}
      {activeTab === "timeline" && (
        <div className="object-section">
          {relationships
            .flatMap((relation) => relation.timeline || [])
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .map((event) => (
              <div key={event.key} className="timeline-row">
                <strong>{event.title}</strong>
                <span>{formatDate(event.date)}</span>
                <p>{event.subtitle}</p>
              </div>
            ))}
        </div>
      )}
      {activeTab === "evidence" && (
        <div className="object-section">
          <ul className="evidence-list">
            {evidenceLinks.length ? (
              evidenceLinks.map((link) => (
                <li key={link}>
                  <a href={link} target="_blank" rel="noreferrer">
                    {link}
                  </a>
                </li>
              ))
            ) : (
              <li className="muted">No evidence links captured yet.</li>
            )}
          </ul>
        </div>
      )}
      {activeTab === "actions" && (
        <div className="object-section">
          <div className="action-stack">
            {onAction.map((action) => (
              <button key={action.id} type="button" onClick={() => action.onClick()}>
                {toTitle(action.id)}
              </button>
            ))}
          </div>
        </div>
      )}
    </aside>
  );
};

const ActionSheet = ({ action, context, onClose, onSubmit, isViewer }) => {
  if (!action) return null;

  return (
    <div className="action-sheet">
      <div className="action-sheet-card">
        <div className="action-sheet-header">
          <div>
            <h3>{toTitle(action.id)}</h3>
            <p>{action.description}</p>
          </div>
          <button type="button" onClick={onClose}>
            Close
          </button>
        </div>
        <form
          onSubmit={(event) => {
            event.preventDefault();
            if (isViewer) return;
            onSubmit(action, new FormData(event.currentTarget));
            onClose();
          }}
        >
          {action.parameters.map((param) => (
            <label key={param} className="action-label">
              {toTitle(param)}
              <Input name={param} defaultValue={context?.[param] || ""} disabled={isViewer} />
            </label>
          ))}
          <div className="button-row">
            <Button type="submit" disabled={isViewer}>
              Confirm action
            </Button>
            <Button type="button" variant="ghost" onClick={onClose}>
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

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
  const [filters, setFilters] = useState({
    region: "",
    segment: "",
    account: "",
    engagement: "",
    dateRange: "",
  });
  const [actionSheet, setActionSheet] = useState(null);

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

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleSelectObject = ({ page, objectType, objectId }) => {
    window.location.hash = toHashHref({ page, objectType, objectId });
  };

  const getObjectLabel = (objectTypeId, record) => {
    if (!record) return "";
    return (
      record.name ||
      record.title ||
      record.account_name ||
      record.engagement_name ||
      record.decision_title ||
      record.invoice_id ||
      record.payment_id ||
      record[objectTypeId + "_id"]
    );
  };

  const getRecordById = (objectTypeId, objectId) =>
    (state?.instances[objectTypeId] || []).find((item) =>
      Object.values(item).includes(objectId)
    );

  const accounts = state?.instances.client_account || [];
  const engagements = state?.instances.consulting_engagement || [];
  const workstreams = state?.instances.workstream || [];
  const milestones = state?.instances.milestone || [];
  const outcomes = state?.instances.outcome || [];
  const risks = state?.instances.risk_issue || [];
  const invoices = state?.instances.invoice || [];
  const payments = state?.instances.payment || [];
  const meetings = state?.instances.meeting || [];
  const decisions = state?.instances.decision || [];
  const changeRequests = state?.instances.change_request || [];
  const metrics = state?.instances.kpi_metric || [];
  const snapshots = state?.instances.kpi_snapshot || [];

  const activePage = useMemo(() => resolveActivePage({ route }), [route]);

  const selectedObjectType = route.objectType;
  const selectedObjectId = route.objectId;
  const selectedObjectRecord = useMemo(() => {
    if (!state || !selectedObjectType || !selectedObjectId) return null;
    return getRecordById(selectedObjectType, selectedObjectId);
  }, [selectedObjectId, selectedObjectType, state]);

  const selectedObjectTypeDef = useMemo(() => {
    if (!state || !selectedObjectType) return null;
    return state.config.semantic_layer.object_types.find((type) => type.id === selectedObjectType) || null;
  }, [selectedObjectType, state]);

  const derivedForSelected = useMemo(() => {
    if (!selectedObjectType || !selectedObjectId || !state) return [];
    return state.derived_values.filter(
      (derived) => derived.object_type === selectedObjectType && derived.object_id === selectedObjectId
    );
  }, [selectedObjectId, selectedObjectType, state]);

  const relationshipsForSelected = useMemo(() => {
    if (!selectedObjectType || !selectedObjectId || !state) return [];
    const linkTypes = state.config.semantic_layer.link_types;
    return linkTypes
      .filter((link) => link.from === selectedObjectType || link.to === selectedObjectType)
      .map((link) => {
        const linkMatches = state.links.filter(
          (entry) =>
            entry.link_type === link.id &&
            (entry.from_id === selectedObjectId || entry.to_id === selectedObjectId)
        );
        const relatedType = link.from === selectedObjectType ? link.to : link.from;
        const relatedRecords = linkMatches
          .map((entry) =>
            entry.from_id === selectedObjectId ? entry.to_id : entry.from_id
          )
          .map((id) => ({ id, record: getRecordById(relatedType, id) }))
          .filter((item) => item.record);
        const timeline = relatedRecords
          .flatMap((item) =>
            Object.entries(item.record)
              .filter(([key, value]) => key.endsWith("_date") || key.endsWith("_at"))
              .map(([key, value]) => ({
                key: `${item.id}-${key}`,
                title: getObjectLabel(relatedType, item.record),
                subtitle: toTitle(key),
                date: value,
              }))
          )
          .filter((event) => event.date);
        return {
          label: toTitle(link.id),
          records: relatedRecords.map((item) => ({
            id: item.id,
            label: getObjectLabel(relatedType, item.record),
          })),
          timeline,
        };
      })
      .filter((entry) => entry.records.length);
  }, [selectedObjectId, selectedObjectType, state]);

  const actionMap = useMemo(() => {
    if (!state) return {};
    return Object.fromEntries(state.config.kinetic_layer.action_types.map((action) => [action.id, action]));
  }, [state]);

  const actionOptions = useMemo(() => {
    if (!state) return [];
    const relevant = {
      milestone: ["replan_milestone", "escalate_risk_issue"],
      risk_issue: ["escalate_risk_issue"],
      change_request: ["initiate_change_request"],
      consulting_engagement: ["schedule_steering_committee", "publish_exec_readout", "run_value_realization_workshop"],
      outcome: ["request_kpi_update", "run_value_realization_workshop"],
    };
    const actions = relevant[selectedObjectType] || [];
    return actions
      .map((id) => actionMap[id])
      .filter(Boolean)
      .map((action) => ({
        id: action.id,
        onClick: () => setActionSheet({ action, context: selectedObjectRecord || {} }),
      }));
  }, [actionMap, selectedObjectRecord, selectedObjectType, state]);

  if (!state) {
    return <div className="loading">Loading workspace…</div>;
  }

  const isViewer = state.role === "Viewer";

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

  const snapshotsByMetric = useMemo(() => groupBy(snapshots, (snapshot) => snapshot.metric_id), [snapshots]);
  const metricsByOutcome = useMemo(() => groupBy(metrics, (metric) => metric.outcome_id), [metrics]);
  const metricStats = useMemo(() => {
    const stalledDaysThreshold = 45;
    const stalledProgressThreshold = 0.1;
    return metrics.map((metric) => {
      const metricSnapshots = snapshotsByMetric[metric.metric_id] || [];
      const latest = getLatestSnapshot(metricSnapshots);
      const progress = computeMetricProgress(metric, latest);
      const delta = Number(metric.target_value) - Number(metric.baseline_value);
      const variance = latest ? Number(latest.value) - Number(metric.target_value) : null;
      const daysSinceUpdate = latest
        ? Math.round((new Date() - new Date(latest.observed_at)) / (1000 * 60 * 60 * 24))
        : null;
      const isStalled =
        !latest ||
        (Number.isFinite(daysSinceUpdate) && daysSinceUpdate > stalledDaysThreshold) ||
        progress < stalledProgressThreshold;
      return {
        metric,
        latest,
        progress,
        delta,
        variance,
        daysSinceUpdate,
        isStalled,
      };
    });
  }, [metrics, snapshotsByMetric]);

  const outcomeStats = useMemo(() => {
    return outcomes.map((outcome) => {
      const outcomeMetrics = metricsByOutcome[outcome.outcome_id] || [];
      const outcomeMetricStats = metricStats.filter((stat) => stat.metric.outcome_id === outcome.outcome_id);
      const progressValue = getDerived(state, "outcome", outcome.outcome_id, "progress_pct")?.value || 0;
      const confidenceValue =
        getDerived(state, "outcome", outcome.outcome_id, "confidence_score")?.value || 0;
      const varianceAvg = outcomeMetricStats.length
        ? outcomeMetricStats.reduce((sum, stat) => sum + (stat.variance ?? 0), 0) / outcomeMetricStats.length
        : 0;
      const stalledCount = outcomeMetricStats.filter((stat) => stat.isStalled).length;
      const forecast = computeForecastDate({
        targetDate: outcome.target_date,
        progressValue,
      });
      return {
        outcome,
        progressValue,
        confidenceValue,
        varianceAvg,
        stalledCount,
        metricsCount: outcomeMetrics.length,
        forecast,
      };
    });
  }, [metricsByOutcome, metricStats, outcomes, state]);

  const sortedOutcomeStats = useMemo(
    () =>
      [...outcomeStats].sort((a, b) => (b.progressValue || 0) - (a.progressValue || 0)),
    [outcomeStats]
  );
  const topOutcomes = sortedOutcomeStats.slice(0, 2);
  const topOutcomeIds = new Set(topOutcomes.map((item) => item.outcome.outcome_id));
  const bottomOutcomes = sortedOutcomeStats
    .slice(-2)
    .filter((item) => !topOutcomeIds.has(item.outcome.outcome_id));
  const bottomOutcomeIds = new Set(bottomOutcomes.map((item) => item.outcome.outcome_id));

  const avgConfidenceScore = outcomeStats.length
    ? outcomeStats.reduce((sum, item) => sum + item.confidenceValue, 0) / outcomeStats.length
    : 0;
  const avgTargetDelta = metricStats.length
    ? metricStats.reduce((sum, item) => sum + item.delta, 0) / metricStats.length
    : 0;
  const avgVariance = metricStats.length
    ? metricStats.reduce((sum, item) => sum + (item.variance ?? 0), 0) / metricStats.length
    : 0;
  const stalledMetrics = metricStats.filter((stat) => stat.isStalled).length;

  const atRiskMilestones = milestones.filter(
    (milestone) => getDerived(state, "milestone", milestone.milestone_id, "at_risk_flag")?.value
  ).length;

  const openHighRisks = risks.filter((risk) => risk.severity === "High" && risk.status !== "Resolved").length;

  const overdueInvoices = invoices.filter((invoice) => invoice.status === "Overdue").length;

  const filterOptions = {
    regions: Array.from(new Set(accounts.map((account) => account.region))).filter(Boolean),
    segments: Array.from(
      new Set(
        accounts.map((account) =>
          getDerived(state, "client_account", account.account_id, "segment_tag")?.value || account.segment_tag
        )
      )
    ),
    accounts: accounts.map((account) => account.account_name),
    engagements: engagements.map((engagement) => engagement.engagement_name),
  };

  const configMetadata = {
    company_name: state.config.client_metadata.company_name,
    primary_objective: state.config.client_metadata.primary_objective,
    fde_lead: state.config.client_metadata.fde_lead,
    deployment_timeline: state.config.client_metadata.deployment_timeline,
  };

  const selectedInstanceType =
    instanceType || state.config.semantic_layer.object_types[0]?.id || "";

  const actionQueues = [
    {
      id: "at-risk-milestones",
      label: "At-risk milestones due soon",
      rows: milestones
        .filter(
          (milestone) =>
            getDerived(state, "milestone", milestone.milestone_id, "at_risk_flag")?.value
        )
        .map((milestone) => ({
          key: milestone.milestone_id,
          objectType: "milestone",
          objectId: milestone.milestone_id,
          name: milestone.name,
          status: milestone.status,
          due: formatDate(milestone.due_date),
          owner: milestone.owner_team_member_id,
          action: "replan_milestone",
        })),
    },
    {
      id: "high-severity-risks",
      label: "High severity risks open past threshold",
      rows: risks
        .filter((risk) => risk.severity === "High" && risk.status !== "Resolved")
        .map((risk) => ({
          key: risk.risk_issue_id,
          objectType: "risk_issue",
          objectId: risk.risk_issue_id,
          name: risk.impact_summary,
          status: risk.status,
          due: formatDate(risk.target_resolution_date),
          owner: risk.owner_team_member_id,
          action: "escalate_risk_issue",
        })),
    },
    {
      id: "renewal-collections",
      label: "Renewal upcoming + collections issues",
      rows: engagements
        .filter((engagement) =>
          invoices.some(
            (invoice) => invoice.engagement_id === engagement.engagement_id && invoice.status === "Overdue"
          )
        )
        .map((engagement) => ({
          key: engagement.engagement_id,
          objectType: "consulting_engagement",
          objectId: engagement.engagement_id,
          name: engagement.engagement_name,
          status: engagement.status,
          due: formatDate(engagement.renewal_date),
          owner: engagement.engagement_lead_team_member_id,
          action: "publish_exec_readout",
        })),
    },
    {
      id: "decisions-needed",
      label: "Decisions needed",
      rows: milestones
        .filter((milestone) => milestone.client_signoff_required_flag && !milestone.client_signoff_date)
        .map((milestone) => ({
          key: milestone.milestone_id,
          objectType: "milestone",
          objectId: milestone.milestone_id,
          name: milestone.name,
          status: "Decision needed",
          due: formatDate(milestone.due_date),
          owner: milestone.owner_team_member_id,
          action: "schedule_steering_committee",
        })),
    },
  ];

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="header-top">
          <div className="brand">
            <span className="logo">CT</span>
            <div>
              <p className="eyebrow">Client Success Control Tower</p>
              <h1>{state.config.client_metadata.company_name || "Client Success Workspace"}</h1>
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
            <h2>Control tower</h2>
            <p>Operational dashboards & object views.</p>
          </div>
          <nav>
            {NAV_ITEMS.map((item) => (
              <a key={item.path} href={toHashHref({ page: item.path })}>
                {item.label}
              </a>
            ))}
          </nav>
        </aside>

        <section className="content">
          {activePage === "home" && (
            <section className="page active" data-page="home">
              <PageHeader
                title="Home / Executive Summary"
                description="Portfolio-level signals for renewal readiness, delivery reliability, and value realization."
                action={<div className="pill">Executive Summary</div>}
              />
              <GlobalFiltersBar filters={filters} onChange={handleFilterChange} filterOptions={filterOptions} />
              <div className="kpi-row">
                <KpiCard label="# Active Accounts" value={accounts.length} />
                <KpiCard label="Avg Account Health" value={avgHealth} />
                <KpiCard label="Avg Renewal Risk" value={avgRisk} />
                <KpiCard label="# At-Risk Milestones" value={atRiskMilestones} />
                <KpiCard label="# Open High Severity Risks" value={openHighRisks} />
                <KpiCard label="# Overdue Invoices" value={overdueInvoices} />
                <KpiCard label="Outcomes On Track" value={onTrackOutcomes} />
              </div>
              <div className="visual-grid">
                <ChartCard
                  title="LTV vs Renewal Risk"
                  description="Size = total contract value; color = segment."
                />
                <ChartCard
                  title="Engagement Health Trend"
                  description="Historical engagement health snapshots."
                />
              </div>
              <div className="module-grid">
                <div className="module-main">
                  <Card className="panel">
                    <h3>Accounts needing attention</h3>
                    <DataTable
                      columns={[
                        "Account",
                        "Health",
                        "Renewal risk",
                        "Segment",
                        "Value",
                      ]}
                      rows={attentionAccounts.map(({ account, health, risk, segment }) => ({
                        key: account.account_id,
                        Account: account.account_name,
                        Health: health?.value ?? account.health_score,
                        "Renewal risk": risk?.value ?? account.renewal_risk_score,
                        Segment: segment?.value ?? account.segment_tag,
                        Value: formatNumber(account.total_contract_value_to_date),
                        onClick: () =>
                          handleSelectObject({
                            page: "home",
                            objectType: "client_account",
                            objectId: account.account_id,
                          }),
                      }))}
                    />
                  </Card>
                </div>
                <ObjectViewPanel
                  record={selectedObjectRecord}
                  objectType={selectedObjectTypeDef}
                  derivedValues={derivedForSelected}
                  relationships={relationshipsForSelected}
                  onAction={actionOptions}
                />
              </div>
            </section>
          )}

          {activePage === "portfolio" && (
            <section className="page active" data-page="portfolio">
              <PageHeader
                title="Portfolio (Accounts)"
                description="Monitor renewal readiness and value realization across the portfolio."
              />
              <GlobalFiltersBar filters={filters} onChange={handleFilterChange} filterOptions={filterOptions} />
              <div className="kpi-row">
                <KpiCard label="# Accounts" value={accounts.length} />
                <KpiCard label="Avg Health" value={avgHealth} />
                <KpiCard label="Avg Renewal Risk" value={avgRisk} />
                <KpiCard
                  label="Total Contract Value"
                  value={formatNumber(
                    accounts.reduce((sum, account) => sum + Number(account.total_contract_value_to_date || 0), 0)
                  )}
                />
              </div>
              <div className="visual-grid">
                <ChartCard title="Health vs Risk Quadrant" />
                <ChartCard title="Regional Breakdown" />
              </div>
              <div className="module-grid">
                <div className="module-main">
                  <Card className="panel">
                    <h3>Accounts</h3>
                    <DataTable
                      columns={[
                        "Account",
                        "Industry",
                        "Region",
                        "Segment",
                        "Health",
                        "Renewal risk",
                        "Total value",
                        "Estimated LTV",
                      ]}
                      rows={accounts.map((account) => {
                        const health = getDerived(state, "client_account", account.account_id, "health_score");
                        const risk = getDerived(state, "client_account", account.account_id, "renewal_risk_score");
                        const segment = getDerived(state, "client_account", account.account_id, "segment_tag");
                        return {
                          key: account.account_id,
                          Account: account.account_name,
                          Industry: account.industry,
                          Region: account.region,
                          Segment: segment?.value ?? account.segment_tag,
                          Health: health?.value ?? account.health_score,
                          "Renewal risk": risk?.value ?? account.renewal_risk_score,
                          "Total value": formatNumber(account.total_contract_value_to_date),
                          "Estimated LTV": formatNumber(account.estimated_ltv),
                          onClick: () =>
                            handleSelectObject({
                              page: "portfolio",
                              objectType: "client_account",
                              objectId: account.account_id,
                            }),
                        };
                      })}
                    />
                  </Card>
                </div>
                <ObjectViewPanel
                  record={selectedObjectRecord}
                  objectType={selectedObjectTypeDef}
                  derivedValues={derivedForSelected}
                  relationships={relationshipsForSelected}
                  onAction={actionOptions}
                />
              </div>
            </section>
          )}

          {activePage === "engagement-health" && (
            <section className="page active" data-page="engagement-health">
              <PageHeader
                title="Engagement Health"
                description="Active engagements with scope, owners, and renewal markers."
              />
              <GlobalFiltersBar filters={filters} onChange={handleFilterChange} filterOptions={filterOptions} />
              <div className="kpi-row">
                <KpiCard
                  label="Engagement Health Score"
                  value={
                    engagements.length
                      ? Math.round(
                          engagements.reduce((sum, engagement) => sum + engagement.engagement_health_score, 0) /
                            engagements.length
                        )
                      : 0
                  }
                />
                <KpiCard
                  label="Completion Rate"
                  value={formatPercent(
                    engagements.length
                      ? engagements.reduce(
                          (sum, engagement) =>
                            sum +
                            (getDerived(state, "consulting_engagement", engagement.engagement_id, "completion_rate")?.value || 0),
                          0
                        ) /
                          engagements.length
                      : 0
                  )}
                />
                <KpiCard label="Upcoming Renewal Date" value={formatDate(engagements[0]?.renewal_date)} />
                <KpiCard
                  label="Sponsor Sentiment"
                  value={formatPercent(
                    (state.instances.stakeholder || []).reduce(
                      (sum, stakeholder, index, list) => sum + Number(stakeholder.sentiment_score || 0) / list.length,
                      0
                    )
                  )}
                />
                <KpiCard label="Open Risks" value={risks.filter((risk) => risk.status !== "Resolved").length} />
                <KpiCard
                  label="On-time Milestone Rate"
                  value={formatPercent(
                    workstreams.length
                      ? workstreams.reduce(
                          (sum, workstream) =>
                            sum +
                            (getDerived(state, "workstream", workstream.workstream_id, "milestone_on_time_rate")?.value || 0),
                          0
                        ) /
                          workstreams.length
                      : 0
                  )}
                />
              </div>
              <div className="visual-grid">
                <ChartCard title="Health Composition" description="Milestones + confidence + risks + sentiment + invoices." />
                <ChartCard title="Engagement Health Trend" />
              </div>
              <div className="module-grid">
                <div className="module-main">
                  <Card className="panel">
                    <h3>Engagements</h3>
                    <DataTable
                      columns={["Engagement", "Status", "Renewal", "Health", "Completion"]}
                      rows={engagements.map((engagement) => ({
                        key: engagement.engagement_id,
                        Engagement: engagement.engagement_name,
                        Status: engagement.status,
                        Renewal: formatDate(engagement.renewal_date),
                        Health: engagement.engagement_health_score,
                        Completion: formatPercent(
                          getDerived(state, "consulting_engagement", engagement.engagement_id, "completion_rate")?.value || 0
                        ),
                        onClick: () =>
                          handleSelectObject({
                            page: "engagement-health",
                            objectType: "consulting_engagement",
                            objectId: engagement.engagement_id,
                          }),
                      }))}
                    />
                  </Card>
                </div>
                <ObjectViewPanel
                  record={selectedObjectRecord}
                  objectType={selectedObjectTypeDef}
                  derivedValues={derivedForSelected}
                  relationships={relationshipsForSelected}
                  onAction={actionOptions}
                />
              </div>
            </section>
          )}

          {activePage === "delivery-reliability" && (
            <section className="page active" data-page="delivery-reliability">
              <PageHeader
                title="Delivery Reliability"
                description="Workstreams and milestones with delivery reliability signals."
              />
              <GlobalFiltersBar filters={filters} onChange={handleFilterChange} filterOptions={filterOptions} />
              <div className="kpi-row">
                <KpiCard
                  label="Milestone On-time Rate"
                  value={formatPercent(
                    workstreams.length
                      ? workstreams.reduce(
                          (sum, workstream) =>
                            sum +
                            (getDerived(state, "workstream", workstream.workstream_id, "milestone_on_time_rate")?.value || 0),
                          0
                        ) /
                          workstreams.length
                      : 0
                  )}
                />
                <KpiCard label="# At-risk Milestones" value={atRiskMilestones} />
                <KpiCard
                  label="# Late Milestones"
                  value={milestones.filter((milestone) => milestone.status !== "Completed" && milestone.due_date && new Date(milestone.due_date) < new Date()).length}
                />
                <KpiCard
                  label="Avg Confidence"
                  value={
                    milestones.length
                      ? `${Math.round(
                          milestones.reduce((sum, milestone) =>
                            sum + (milestone.confidence_level === "High" ? 1 : milestone.confidence_level === "Medium" ? 0.6 : 0.3),
                          0) / milestones.length * 100
                        )}%`
                      : "—"
                  }
                />
                <KpiCard
                  label="# Client Signoffs Pending"
                  value={milestones.filter((milestone) => milestone.client_signoff_required_flag && !milestone.client_signoff_date).length}
                />
              </div>
              <div className="visual-grid">
                <ChartCard title="Workstream Timeline" description="Planned vs due vs completed." />
                <ChartCard title="Slippage Histogram" />
              </div>
              <div className="module-grid">
                <div className="module-main">
                  <Card className="panel">
                    <h3>Milestones</h3>
                    <DataTable
                      columns={["Milestone", "Due date", "Confidence", "Blocker", "Owner", "Signoff"]}
                      rows={milestones.map((milestone) => ({
                        key: milestone.milestone_id,
                        Milestone: milestone.name,
                        "Due date": formatDate(milestone.due_date),
                        Confidence: milestone.confidence_level,
                        Blocker: milestone.blocker_summary || "—",
                        Owner: milestone.owner_team_member_id,
                        Signoff: milestone.client_signoff_date ? "Signed" : "Pending",
                        onClick: () =>
                          handleSelectObject({
                            page: "delivery-reliability",
                            objectType: "milestone",
                            objectId: milestone.milestone_id,
                          }),
                      }))}
                    />
                  </Card>
                </div>
                <ObjectViewPanel
                  record={selectedObjectRecord}
                  objectType={selectedObjectTypeDef}
                  derivedValues={derivedForSelected}
                  relationships={relationshipsForSelected}
                  onAction={actionOptions}
                />
              </div>
            </section>
          )}

          {activePage === "value-realization" && (
            <section className="page active" data-page="value-realization">
              <PageHeader
                title="Value Realization"
                description="Outcomes and KPI progress tied to value realization."
              />
              <GlobalFiltersBar filters={filters} onChange={handleFilterChange} filterOptions={filterOptions} />
              <div className="kpi-row">
                <KpiCard label="# Outcomes On Track" value={onTrackOutcomes} />
                <KpiCard
                  label="Avg confidence score"
                  value={formatPercent(avgConfidenceScore)}
                />
                <KpiCard
                  label="Avg progress_pct"
                  value={formatPercent(
                    outcomes.length
                      ? outcomes.reduce(
                          (sum, outcome) => sum + (getDerived(state, "outcome", outcome.outcome_id, "progress_pct")?.value || 0),
                          0
                        ) / outcomes.length
                      : 0
                  )}
                />
                <KpiCard
                  label="Avg target delta"
                  value={formatSignedNumber(avgTargetDelta, 1)}
                  helper="Target vs baseline"
                />
                <KpiCard
                  label="Avg variance to target"
                  value={formatSignedNumber(avgVariance, 1)}
                  helper="Latest vs target"
                />
                <KpiCard label="# KPIs stalled" value={stalledMetrics} />
                <KpiCard
                  label="Data freshness"
                  value={snapshots.length ? formatDate(getLatestSnapshot(snapshots)?.observed_at) : "—"}
                />
              </div>
              <div className="visual-grid">
                <TrendlineCard
                  title="KPI Trendlines"
                  description="Baseline, target, and latest snapshots with variance."
                  items={metricStats.map((stat) => ({
                    key: stat.metric.metric_id,
                    label: stat.metric.name,
                    baseline: formatMetricValue(stat.metric.baseline_value, stat.metric.unit),
                    target: formatMetricValue(stat.metric.target_value, stat.metric.unit),
                    latest: stat.latest
                      ? formatMetricValue(stat.latest.value, stat.metric.unit)
                      : "—",
                    variance: stat.latest ? formatSignedNumber(stat.variance ?? 0, 1) : "—",
                    varianceTone:
                      stat.variance == null ? "muted" : stat.variance > 0 ? "text-positive" : "text-negative",
                    updatedAt: stat.latest?.observed_at,
                    status: stat.isStalled
                      ? { label: "Stalled", variant: "outline" }
                      : { label: "Active", variant: "secondary" },
                  }))}
                />
                <RollupCard
                  title="Outcome Progress Roll-up"
                  description="Highlights top and bottom outcomes by progress."
                  topOutcomes={topOutcomes.map((item) => ({
                    id: item.outcome.outcome_id,
                    label: item.outcome.name,
                    progress: item.progressValue,
                  }))}
                  bottomOutcomes={bottomOutcomes.map((item) => ({
                    id: item.outcome.outcome_id,
                    label: item.outcome.name,
                    progress: item.progressValue,
                  }))}
                />
              </div>
              <div className="module-grid">
                <div className="module-main">
                  <Card className="panel">
                    <h3>Outcomes</h3>
                    <DataTable
                      columns={[
                        "Outcome",
                        "Owner",
                        "Confidence",
                        "Variance to target",
                        "Stalled KPIs",
                        "Status",
                        "Progress",
                      ]}
                      rows={outcomeStats.map((entry) => ({
                        key: entry.outcome.outcome_id,
                        Outcome: (
                          <div className="outcome-cell">
                            <span>{entry.outcome.name}</span>
                            {topOutcomeIds.has(entry.outcome.outcome_id) ? (
                              <Badge variant="secondary">Top</Badge>
                            ) : null}
                            {bottomOutcomeIds.has(entry.outcome.outcome_id) ? (
                              <Badge variant="outline">Watch</Badge>
                            ) : null}
                          </div>
                        ),
                        Owner: entry.outcome.owner_stakeholder_id,
                        Confidence: formatPercent(entry.confidenceValue),
                        "Variance to target": formatSignedNumber(entry.varianceAvg, 1),
                        "Stalled KPIs": `${entry.stalledCount}/${entry.metricsCount}`,
                        Status: entry.outcome.status,
                        Progress: (
                          <ProgressIndicator value={entry.progressValue} forecast={entry.forecast} />
                        ),
                        onClick: () =>
                          handleSelectObject({
                            page: "value-realization",
                            objectType: "outcome",
                            objectId: entry.outcome.outcome_id,
                          }),
                      }))}
                    />
                  </Card>
                </div>
                <ObjectViewPanel
                  record={selectedObjectRecord}
                  objectType={selectedObjectTypeDef}
                  derivedValues={derivedForSelected}
                  relationships={relationshipsForSelected}
                  onAction={actionOptions}
                />
              </div>
            </section>
          )}

          {activePage === "risks-change-control" && (
            <section className="page active" data-page="risks-change-control">
              <PageHeader
                title="Risks & Change Control"
                description="Threats to delivery timelines and change requests."
              />
              <GlobalFiltersBar filters={filters} onChange={handleFilterChange} filterOptions={filterOptions} />
              <div className="kpi-row">
                <KpiCard
                  label="Open risks by severity"
                  value={risks.filter((risk) => risk.status !== "Resolved").length}
                />
                <KpiCard label="Open issues" value={risks.filter((risk) => risk.type === "Issue").length} />
                <KpiCard
                  label="Avg age"
                  value={
                    risks.length
                      ? `${Math.round(
                          risks.reduce(
                            (sum, risk) => sum + (new Date() - new Date(risk.opened_at)) / (1000 * 60 * 60 * 24),
                            0
                          ) / risks.length
                        )} days`
                      : "—"
                  }
                />
                <KpiCard
                  label="# Escalations pending"
                  value={risks.filter((risk) => risk.status === "Open").length}
                />
                <KpiCard label="# Change requests proposed" value={changeRequests.length} />
              </div>
              <div className="visual-grid">
                <ChartCard title="Risk Matrix" description="Severity x likelihood." />
                <ChartCard title="Risk Aging" />
              </div>
              <div className="module-grid">
                <div className="module-main">
                  <Card className="panel">
                    <h3>Risk & Issue Register</h3>
                    <DataTable
                      columns={["Risk/Issue", "Type", "Severity", "Status", "Owner"]}
                      rows={risks.map((risk) => ({
                        key: risk.risk_issue_id,
                        "Risk/Issue": risk.impact_summary,
                        Type: risk.type,
                        Severity: risk.severity,
                        Status: risk.status,
                        Owner: risk.owner_team_member_id,
                        onClick: () =>
                          handleSelectObject({
                            page: "risks-change-control",
                            objectType: "risk_issue",
                            objectId: risk.risk_issue_id,
                          }),
                      }))}
                    />
                  </Card>
                  <Card className="panel">
                    <h3>Change Requests</h3>
                    <DataTable
                      columns={["Change request", "Impact scope", "Impact timeline", "Impact fees", "Status"]}
                      rows={changeRequests.map((change) => ({
                        key: change.change_request_id,
                        "Change request": change.description,
                        "Impact scope": change.impact_on_scope,
                        "Impact timeline": change.impact_on_timeline,
                        "Impact fees": change.impact_on_fees,
                        Status: change.status,
                        onClick: () =>
                          handleSelectObject({
                            page: "risks-change-control",
                            objectType: "change_request",
                            objectId: change.change_request_id,
                          }),
                      }))}
                    />
                  </Card>
                </div>
                <ObjectViewPanel
                  record={selectedObjectRecord}
                  objectType={selectedObjectTypeDef}
                  derivedValues={derivedForSelected}
                  relationships={relationshipsForSelected}
                  onAction={actionOptions}
                />
              </div>
            </section>
          )}

          {activePage === "renewal-collections" && (
            <section className="page active" data-page="renewal-collections">
              <PageHeader
                title="Renewal & Collections"
                description="Upcoming renewals with invoice and payment signals."
              />
              <GlobalFiltersBar filters={filters} onChange={handleFilterChange} filterOptions={filterOptions} />
              <div className="kpi-row">
                <KpiCard label="Renewals in 30/60/90 days" value={engagements.length} />
                <KpiCard label="Overdue invoices" value={overdueInvoices} />
                <KpiCard
                  label="Total overdue amount"
                  value={formatNumber(
                    invoices.filter((invoice) => invoice.status === "Overdue").reduce((sum, invoice) => sum + invoice.amount_total, 0)
                  )}
                />
                <KpiCard
                  label="Avg days past due"
                  value={
                    invoices.filter((invoice) => invoice.status === "Overdue").length
                      ? Math.round(
                          invoices
                            .filter((invoice) => invoice.status === "Overdue")
                            .reduce((sum, invoice) => sum + invoice.days_past_due, 0) /
                            invoices.filter((invoice) => invoice.status === "Overdue").length
                        )
                      : 0
                  }
                />
                <KpiCard label="Payment failures" value={payments.filter((payment) => payment.status !== "Succeeded").length} />
              </div>
              <div className="visual-grid">
                <ChartCard title="Renewal Timeline" />
                <ChartCard title="Overdue by Account" />
              </div>
              <div className="module-grid">
                <div className="module-main">
                  <Card className="panel">
                    <h3>Invoices</h3>
                    <DataTable
                      columns={["Invoice", "Due date", "Amount", "Status", "Days past due"]}
                      rows={invoices.map((invoice) => ({
                        key: invoice.invoice_id,
                        Invoice: invoice.invoice_id,
                        "Due date": formatDate(invoice.due_date),
                        Amount: formatNumber(invoice.amount_total),
                        Status: invoice.status,
                        "Days past due": invoice.days_past_due,
                        onClick: () =>
                          handleSelectObject({
                            page: "renewal-collections",
                            objectType: "invoice",
                            objectId: invoice.invoice_id,
                          }),
                      }))}
                    />
                  </Card>
                  <Card className="panel">
                    <h3>Payments</h3>
                    <DataTable
                      columns={["Payment", "Paid at", "Amount", "Status", "Failure reason"]}
                      rows={payments.map((payment) => ({
                        key: payment.payment_id,
                        Payment: payment.payment_id,
                        "Paid at": formatDate(payment.paid_at),
                        Amount: formatNumber(payment.amount),
                        Status: payment.status,
                        "Failure reason": payment.failure_reason || "—",
                        onClick: () =>
                          handleSelectObject({
                            page: "renewal-collections",
                            objectType: "payment",
                            objectId: payment.payment_id,
                          }),
                      }))}
                    />
                  </Card>
                </div>
                <ObjectViewPanel
                  record={selectedObjectRecord}
                  objectType={selectedObjectTypeDef}
                  derivedValues={derivedForSelected}
                  relationships={relationshipsForSelected}
                  onAction={actionOptions}
                />
              </div>
            </section>
          )}

          {activePage === "governance" && (
            <section className="page active" data-page="governance">
              <PageHeader
                title="Governance"
                description="Governance cadence, decisions, and executive communications."
              />
              <GlobalFiltersBar filters={filters} onChange={handleFilterChange} filterOptions={filterOptions} />
              <div className="kpi-row">
                <KpiCard label="Meetings this period" value={meetings.length} />
                <KpiCard
                  label="Attendance avg"
                  value={
                    meetings.length
                      ? Math.round(meetings.reduce((sum, meeting) => sum + meeting.attendees_count, 0) / meetings.length)
                      : 0
                  }
                />
                <KpiCard
                  label="Action items open"
                  value={meetings.reduce((sum, meeting) => sum + meeting.action_items_count, 0)}
                />
                <KpiCard
                  label="Sentiment avg"
                  value={formatPercent(
                    meetings.length
                      ? meetings.reduce((sum, meeting) => sum + Number(meeting.sentiment_score || 0), 0) / meetings.length
                      : 0
                  )}
                />
                <KpiCard label="Decisions needed" value={milestones.filter((milestone) => milestone.client_signoff_required_flag && !milestone.client_signoff_date).length} />
              </div>
              <div className="module-grid">
                <div className="module-main">
                  <Card className="panel">
                    <h3>Meetings</h3>
                    <DataTable
                      columns={["Meeting", "Scheduled", "Sentiment", "Notes"]}
                      rows={meetings.map((meeting) => ({
                        key: meeting.meeting_id,
                        Meeting: meeting.meeting_type,
                        Scheduled: formatDate(meeting.scheduled_at),
                        Sentiment: formatPercent(meeting.sentiment_score),
                        Notes: meeting.notes_link ? "View" : "—",
                        onClick: () =>
                          handleSelectObject({
                            page: "governance",
                            objectType: "meeting",
                            objectId: meeting.meeting_id,
                          }),
                      }))}
                    />
                  </Card>
                  <Card className="panel">
                    <h3>Decisions</h3>
                    <DataTable
                      columns={["Decision", "Type", "Impact", "Decided by"]}
                      rows={decisions.map((decision) => ({
                        key: decision.decision_id,
                        Decision: decision.decision_title,
                        Type: decision.decision_type,
                        Impact: decision.impact_summary,
                        "Decided by": decision.decided_by_stakeholder_id,
                        onClick: () =>
                          handleSelectObject({
                            page: "governance",
                            objectType: "decision",
                            objectId: decision.decision_id,
                          }),
                      }))}
                    />
                  </Card>
                </div>
                <ObjectViewPanel
                  record={selectedObjectRecord}
                  objectType={selectedObjectTypeDef}
                  derivedValues={derivedForSelected}
                  relationships={relationshipsForSelected}
                  onAction={actionOptions}
                />
              </div>
            </section>
          )}

          {activePage === "action-center" && (
            <section className="page active" data-page="action-center">
              <PageHeader
                title="Action Center / Inbox"
                description="Queues with governed actions and audit trails."
              />
              <GlobalFiltersBar filters={filters} onChange={handleFilterChange} filterOptions={filterOptions} />
              <div className="kpi-row">
                <KpiCard label="Total pending actions" value={state.action_log.length} />
                <KpiCard label="SLA breaches" value={actionQueues[0].rows.length} />
                <KpiCard label="Critical blockers" value={actionQueues[1].rows.length} />
              </div>
              <div className="module-grid">
                <div className="module-main">
                  {actionQueues.map((queue) => (
                    <Card key={queue.id} className="panel">
                      <h3>{queue.label}</h3>
                      {queue.rows.length ? (
                        <DataTable
                          columns={["Item", "Status", "Due", "Owner", "Action"]}
                          rows={queue.rows.map((row) => ({
                            key: row.key,
                            Item: row.name,
                            Status: row.status,
                            Due: row.due,
                            Owner: row.owner,
                            Action: toTitle(row.action),
                            onClick: () =>
                              handleSelectObject({
                                page: "action-center",
                                objectType: row.objectType,
                                objectId: row.objectId,
                              }),
                          }))}
                        />
                      ) : (
                        <p className="help-text">Queue empty.</p>
                      )}
                      {queue.rows.length ? (
                        <div className="button-row">
                          <Button
                            onClick={() =>
                              setActionSheet({
                                action: actionMap[queue.rows[0].action],
                                context: { [`${queue.rows[0].objectType}_id`]: queue.rows[0].objectId },
                              })
                            }
                          >
                            Run top action
                          </Button>
                        </div>
                      ) : null}
                    </Card>
                  ))}
                </div>
                <ObjectViewPanel
                  record={selectedObjectRecord}
                  objectType={selectedObjectTypeDef}
                  derivedValues={derivedForSelected}
                  relationships={relationshipsForSelected}
                  onAction={actionOptions}
                />
              </div>
              <Card className="panel">
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
              </Card>
            </section>
          )}

          {activePage === "ontology-explorer" && (
            <section className="page active" data-page="ontology-explorer">
              <PageHeader
                title="Ontology Explorer"
                description="Explore object types, relationships, and module usage."
              />
              <div className="panel">
                <div className="field-grid">
                  <div>
                    <h4>Quick switcher</h4>
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
                  </div>
                  <div>
                    <h4>Search</h4>
                    <Input placeholder="Search object types and instances" disabled />
                  </div>
                </div>
                <div className="card-grid">
                  {state.config.semantic_layer.object_types.map((objectType) => (
                    <Card key={objectType.id} className="object-card">
                      <CardHeader>
                        <CardTitle>{toTitle(objectType.id)}</CardTitle>
                        <CardDescription>{objectType.description}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <Badge variant="secondary">Used in Modules</Badge>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </section>
          )}

          {activePage === "admin" && (
            <section className="page active" data-page="admin">
              <PageHeader
                title="Admin / Settings"
                description="Manage configuration, data integration, and audit history."
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
              <div className="panel">
                <h3>Data integration</h3>
                <div className="field-grid">
                  <div>
                    <h4>Sources</h4>
                    <ul>
                      {state.config.data_integration_mapping.sources.map((source) => (
                        <li key={source}>{source}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4>Pipeline tooling</h4>
                    <p>{state.config.data_integration_mapping.pipeline_tool}</p>
                  </div>
                </div>
              </div>
              <div className="panel">
                <h3>Audit & Activity</h3>
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
              </div>
              <section className="card" data-page="json-export">
                <div className="card-header">
                  <h2>Current JSON</h2>
                  <p>Configuration, instances, computed values, and action logs.</p>
                </div>
                <Textarea
                  id="json-output"
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
            </section>
          )}
        </section>
      </main>
      <ActionSheet
        action={actionSheet?.action}
        context={actionSheet?.context}
        onClose={() => setActionSheet(null)}
        onSubmit={handleActionSubmit}
        isViewer={isViewer}
      />
    </div>
  );
};

export default App;
