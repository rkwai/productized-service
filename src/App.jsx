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
const formatDelta = (value) => {
  if (!Number.isFinite(value)) return "—";
  const rounded = Math.round(value);
  return `${rounded > 0 ? "+" : ""}${rounded}`;
};
const formatDays = (value) => (Number.isFinite(value) ? `${value}d` : "—");
const getHealthTone = (value) => {
  if (!Number.isFinite(value)) return "status-pill--neutral";
  if (value >= 75) return "status-pill--good";
  if (value >= 55) return "status-pill--warn";
  return "status-pill--bad";
};
const getRiskTone = (value) => {
  if (!Number.isFinite(value)) return "status-pill--neutral";
  if (value >= 70) return "status-pill--bad";
  if (value >= 45) return "status-pill--warn";
  return "status-pill--good";
};
const getFreshnessTone = (value) => {
  if (!Number.isFinite(value)) return "status-pill--neutral";
  if (value <= 14) return "status-pill--good";
  if (value <= 30) return "status-pill--warn";
  return "status-pill--bad";
};
const StatusPill = ({ label, tone }) => <span className={`status-pill ${tone}`}>{label}</span>;
const PORTFOLIO_COLUMNS = [
  "Select",
  "Account",
  "Industry",
  "Region",
  "Segment",
  "Health",
  "Renewal risk",
  "Churn risk",
  "Data freshness",
  "Missing data",
  "Total value",
  "Estimated LTV",
  "LTV at risk",
];
const PORTFOLIO_VIEW_PRESETS = [
  {
    name: "Default",
    groupBy: "none",
    filters: { health: "all", risk: "all", missing: "all" },
    columns: PORTFOLIO_COLUMNS,
  },
  {
    name: "High Risk Focus",
    groupBy: "region",
    filters: { health: "all", risk: "high", missing: "all" },
    columns: PORTFOLIO_COLUMNS.filter((column) =>
      ["Select", "Account", "Region", "Health", "Renewal risk", "Churn risk", "Data freshness", "LTV at risk"].includes(column)
    ),
  },
  {
    name: "Data Gaps",
    groupBy: "segment",
    filters: { health: "all", risk: "all", missing: "gaps" },
    columns: PORTFOLIO_COLUMNS.filter((column) =>
      ["Select", "Account", "Segment", "Region", "Missing data", "Data freshness", "Health"].includes(column)
    ),
  },
];

const getHealthStatus = (score) => {
  if (score >= 80) {
    return { label: "Healthy", className: "border border-emerald-200 bg-emerald-100 text-emerald-800" };
  }
  if (score >= 65) {
    return { label: "Watch", className: "border border-amber-200 bg-amber-100 text-amber-800" };
  }
  return { label: "Low", className: "border border-rose-200 bg-rose-100 text-rose-800" };
};

const clampScore = (value) => Math.max(0, Math.min(100, Math.round(value)));

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

const getDaysBetween = (startDate, endDate) =>
  Math.round((endDate - startDate) / (1000 * 60 * 60 * 24));

const getMilestoneSlippageDays = (milestone, referenceDate = new Date()) => {
  if (!milestone?.due_date) return null;
  const due = new Date(milestone.due_date);
  const actual = milestone.completed_date ? new Date(milestone.completed_date) : referenceDate;
  return getDaysBetween(due, actual);
};

const getMilestoneRisk = (milestone, atRiskFlag, referenceDate = new Date()) => {
  const confidenceMap = { High: 0.2, Medium: 0.5, Low: 0.8 };
  const base = confidenceMap[milestone?.confidence_level] ?? 0.45;
  const dueInDays = milestone?.due_date ? getDaysBetween(referenceDate, new Date(milestone.due_date)) : 30;
  const urgency =
    milestone?.status === "Completed"
      ? 0
      : dueInDays <= 7
        ? 0.25
        : dueInDays <= 21
          ? 0.15
          : 0.05;
  const blockerPenalty = milestone?.blocker_summary ? 0.15 : 0;
  const riskScore = Math.min(1, base + urgency + blockerPenalty + (atRiskFlag ? 0.2 : 0));
  const label = riskScore > 0.66 ? "High" : riskScore > 0.4 ? "Medium" : "Low";
  return { score: riskScore, label };
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

  const portfolioBulkActions = [
    {
      id: "assign_owner",
      description: "Assign a primary owner to the selected accounts.",
      parameters: ["owner", "account_ids"],
      side_effects: ["update_account_owner", "notify_owner"],
    },
    {
      id: "create_task",
      description: "Create a follow-up task tied to the selected accounts.",
      parameters: ["task_title", "due_date", "account_ids"],
      side_effects: ["create_task", "notify_account_team"],
    },
  ];

  const portfolioExportActions = [
    {
      id: "schedule_export",
      description: "Schedule a recurring export or portfolio report.",
      parameters: ["export_type", "frequency", "recipients"],
      side_effects: ["schedule_export_job", "email_report"],
    },
    {
      id: "generate_export",
      description: "Generate an on-demand portfolio export.",
      parameters: ["export_type", "format", "recipients"],
      side_effects: ["generate_export", "deliver_export"],
    },
  ];

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

const ChartCard = ({ title, description, children }) => (
  <Card className="chart-card">
    <CardHeader>
      <CardTitle>{title}</CardTitle>
      {description ? <CardDescription>{description}</CardDescription> : null}
    </CardHeader>
    <CardContent>
      {children ?? <div className="chart-placeholder">Chart placeholder</div>}
    </CardContent>
  </Card>
);

const TrendIndicator = ({ value }) => {
  const direction = value > 0 ? "up" : value < 0 ? "down" : "flat";
  const label = `${value > 0 ? "+" : ""}${value} pts vs last period`;
  return <span className={`trend-indicator ${direction}`}>{label}</span>;
};

const RiskValueScatter = ({ data }) => {
  const width = 360;
  const height = 200;
  const padding = 30;
  const maxValue = Math.max(...data.map((point) => point.value), 1);
  const segments = Array.from(new Set(data.map((point) => point.segment))).filter(Boolean);
  const palette = ["#2563eb", "#16a34a", "#f97316", "#7c3aed"];
  const colorFor = (segment) => {
    const index = Math.max(segments.indexOf(segment), 0);
    return palette[index % palette.length];
  };

  return (
    <div className="chart-body">
      <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Risk vs value scatter plot">
        <rect x="0" y="0" width={width} height={height} rx="12" fill="var(--secondary)" />
        <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="var(--border-color)" />
        <line x1={padding} y1={padding} x2={padding} y2={height - padding} stroke="var(--border-color)" />
        {[25, 50, 75].map((tick) => (
          <line
            key={`x-${tick}`}
            x1={padding + ((width - padding * 2) * tick) / 100}
            y1={height - padding}
            x2={padding + ((width - padding * 2) * tick) / 100}
            y2={padding}
            stroke="var(--border-color)"
            strokeDasharray="4 4"
          />
        ))}
        {data.map((point) => {
          const x = padding + ((width - padding * 2) * point.risk) / 100;
          const y =
            height -
            padding -
            ((height - padding * 2) * point.value) / maxValue;
          return (
            <circle
              key={point.id}
              cx={x}
              cy={y}
              r={6}
              fill={colorFor(point.segment)}
              stroke="white"
              strokeWidth="2"
            />
          );
        })}
        <text x={padding} y={height - 8} fontSize="10" fill="var(--muted-text)">
          Lower risk
        </text>
        <text x={width - padding - 40} y={height - 8} fontSize="10" fill="var(--muted-text)">
          Higher risk
        </text>
        <text x={8} y={padding - 8} fontSize="10" fill="var(--muted-text)">
          Contract value
        </text>
      </svg>
      <div className="chart-legend">
        {segments.map((segment) => (
          <div key={segment} className="legend-item">
            <span className="legend-dot" style={{ background: colorFor(segment) }} />
            {segment}
          </div>
        ))}
      </div>
    </div>
  );
};

const HealthTrendChart = ({ data }) => {
  const width = 360;
  const height = 200;
  const padding = 30;
  const minValue = Math.min(...data.map((point) => point.value), 0);
  const maxValue = Math.max(...data.map((point) => point.value), 100);
  const range = maxValue - minValue || 1;
  const step = (width - padding * 2) / (data.length - 1);
  const points = data.map((point, index) => {
    const x = padding + index * step;
    const y = height - padding - ((point.value - minValue) / range) * (height - padding * 2);
    return { ...point, x, y };
  });
  const path = points
    .map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`)
    .join(" ");

  return (
    <div className="chart-body">
      <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Portfolio health trend line">
        <rect x="0" y="0" width={width} height={height} rx="12" fill="var(--secondary)" />
        <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="var(--border-color)" />
        <line x1={padding} y1={padding} x2={padding} y2={height - padding} stroke="var(--border-color)" />
        {[25, 50, 75].map((tick) => (
          <line
            key={`y-${tick}`}
            x1={padding}
            y1={height - padding - ((height - padding * 2) * tick) / 100}
            x2={width - padding}
            y2={height - padding - ((height - padding * 2) * tick) / 100}
            stroke="var(--border-color)"
            strokeDasharray="4 4"
          />
        ))}
        <path d={path} fill="none" stroke="#2563eb" strokeWidth="3" />
        {points.map((point) => (
          <circle key={point.label} cx={point.x} cy={point.y} r={5} fill="#2563eb" stroke="white" strokeWidth="2" />
        ))}
        {points.map((point) => (
          <text
            key={`${point.label}-label`}
            x={point.x}
            y={height - 8}
            fontSize="10"
            textAnchor="middle"
            fill="var(--muted-text)"
          >
            {point.label}
          </text>
        ))}
      </svg>
      <div className="trend-summary">
        <span className="trend-current">{data[data.length - 1]?.value ?? 0}%</span>
        <span className="trend-note">Current portfolio health score</span>
      </div>
    </div>
  );
};

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
          <tr
            key={row.key}
            className={row.className}
            onClick={row.onClick || (() => onRowClick?.(row))}
          >
            {columns.map((column) => (
              <td key={`${row.key}-${column}`}>{row[column] ?? "—"}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

const StatusChip = ({ status }) => {
  const statusLabel = status || "Unspecified";
  return (
    <Badge className={`status-chip status-${statusLabel.toLowerCase().replace(/\s+/g, "-")}`} variant="secondary">
      {statusLabel}
    </Badge>
  );
};

const RiskChip = ({ label }) => (
  <Badge className={`risk-chip risk-${label.toLowerCase()}`} variant="subtle">
    {label} risk
  </Badge>
);

const TrendBars = ({ values }) => (
  <div className="trend-bars">
    {values.map((value, index) => (
      <span
        key={`${value}-${index}`}
        className="trend-bar"
        style={{ height: `${Math.max(12, Math.round(value * 48))}px` }}
      />
    ))}
  </div>
);

const WorkstreamTimeline = ({ workstreams, milestoneInsights, onSelect }) => {
  const dates = milestoneInsights
    .flatMap(({ milestone }) => [milestone.planned_date, milestone.due_date, milestone.completed_date])
    .filter(Boolean)
    .map((date) => new Date(date));

  if (!dates.length) {
    return (
      <Card className="timeline-card">
        <CardHeader>
          <CardTitle>Workstream Timeline</CardTitle>
          <CardDescription>Planned vs due vs completed.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="muted">No timeline data available.</p>
        </CardContent>
      </Card>
    );
  }

  const start = new Date(Math.min(...dates));
  const end = new Date(Math.max(...dates));
  const range = Math.max(1, end - start);
  const getPosition = (dateValue) =>
    Math.min(100, Math.max(0, ((new Date(dateValue) - start) / range) * 100));

  const milestonesByWorkstream = workstreams.map((workstream) => ({
    workstream,
    milestones: milestoneInsights.filter((item) => item.milestone.workstream_id === workstream.workstream_id),
  }));

  return (
    <Card className="timeline-card">
      <CardHeader>
        <CardTitle>Workstream Timeline</CardTitle>
        <CardDescription>Planned vs due vs completed with critical path highlights.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="timeline-scale">
          <span>{formatDate(start)}</span>
          <span>{formatDate(end)}</span>
        </div>
        <div className="timeline-grid">
          {milestonesByWorkstream.map(({ workstream, milestones }) => (
            <div key={workstream.workstream_id} className="timeline-group">
              <div className="timeline-group-header">
                <strong>{workstream.name}</strong>
                <span className="muted">{workstream.status}</span>
              </div>
              {milestones.map(({ milestone, isCritical }) => {
                const plannedStart = milestone.planned_date || milestone.due_date;
                const plannedEnd = milestone.due_date || milestone.planned_date;
                if (!plannedStart || !plannedEnd) return null;
                const plannedLeft = getPosition(plannedStart);
                const plannedWidth = Math.max(2, getPosition(plannedEnd) - plannedLeft);
                const completedPosition = milestone.completed_date
                  ? getPosition(milestone.completed_date)
                  : null;
                return (
                  <div
                    key={milestone.milestone_id}
                    className={`timeline-row-item ${isCritical ? "critical" : ""}`}
                    onClick={() =>
                      onSelect?.({
                        page: "delivery-reliability",
                        objectType: "milestone",
                        objectId: milestone.milestone_id,
                      })
                    }
                  >
                    <div className="timeline-label">
                      <span>{milestone.name}</span>
                      {isCritical ? <Badge className="critical-chip">Critical path</Badge> : null}
                    </div>
                    <div className="timeline-track">
                      <div
                        className="timeline-bar planned"
                        style={{ left: `${plannedLeft}%`, width: `${plannedWidth}%` }}
                      />
                      {completedPosition != null ? (
                        <span className="timeline-marker" style={{ left: `${completedPosition}%` }} />
                      ) : null}
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

const SlippageHistogram = ({ milestoneInsights }) => {
  const buckets = [
    { label: "On time / early", min: Number.NEGATIVE_INFINITY, max: 0 },
    { label: "1-7 days", min: 1, max: 7 },
    { label: "8-14 days", min: 8, max: 14 },
    { label: "15+ days", min: 15, max: Number.POSITIVE_INFINITY },
  ];

  const bucketCounts = buckets.map((bucket) => ({
    ...bucket,
    count: milestoneInsights.filter(({ slippageDays }) => {
      if (slippageDays == null) return false;
      return slippageDays >= bucket.min && slippageDays <= bucket.max;
    }).length,
  }));

  const maxCount = Math.max(1, ...bucketCounts.map((bucket) => bucket.count));

  return (
    <Card className="histogram-card">
      <CardHeader>
        <CardTitle>Slippage Histogram</CardTitle>
        <CardDescription>Distribution of days late or early.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="histogram">
          {bucketCounts.map((bucket) => (
            <div key={bucket.label} className="histogram-row">
              <span>{bucket.label}</span>
              <div className="histogram-bar">
                <div style={{ width: `${(bucket.count / maxCount) * 100}%` }} />
              </div>
              <strong>{bucket.count}</strong>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

const OwnerReliabilityCard = ({ ownerReliability }) => (
  <Card className="owner-reliability-card">
    <CardHeader>
      <CardTitle>Owner Reliability</CardTitle>
      <CardDescription>Historical on-time delivery trend by owner.</CardDescription>
    </CardHeader>
    <CardContent>
      <div className="owner-reliability-grid">
        {ownerReliability.map((owner) => (
          <div key={owner.id} className="owner-reliability-row">
            <div>
              <strong>{owner.name}</strong>
              <span className="muted">{owner.role}</span>
            </div>
            <div className="owner-reliability-metrics">
              <div>
                <span className="label">On-time rate</span>
                <strong>{formatPercent(owner.onTimeRate)}</strong>
              </div>
              <TrendBars values={owner.trend} />
            </div>
          </div>
        ))}
      </div>
    </CardContent>
  </Card>
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
  const [homeTopRiskOnly, setHomeTopRiskOnly] = useState(false);
  const [actionSheet, setActionSheet] = useState(null);
  const [portfolioSavedViews, setPortfolioSavedViews] = useState(PORTFOLIO_VIEW_PRESETS);
  const [portfolioView, setPortfolioView] = useState(PORTFOLIO_VIEW_PRESETS[0].name);
  const [portfolioGroupBy, setPortfolioGroupBy] = useState(PORTFOLIO_VIEW_PRESETS[0].groupBy);
  const [portfolioFilters, setPortfolioFilters] = useState(PORTFOLIO_VIEW_PRESETS[0].filters);
  const [portfolioColumns, setPortfolioColumns] = useState(PORTFOLIO_VIEW_PRESETS[0].columns);
  const [selectedPortfolioAccounts, setSelectedPortfolioAccounts] = useState([]);

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

  const handlePortfolioViewChange = (value) => {
    const view = portfolioSavedViews.find((item) => item.name === value);
    if (!view) return;
    setPortfolioView(view.name);
    setPortfolioGroupBy(view.groupBy);
    setPortfolioFilters(view.filters);
    setPortfolioColumns(view.columns);
  };

  const handlePortfolioFilterChange = (key, value) => {
    setPortfolioFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handlePortfolioColumnToggle = (column) => {
    setPortfolioColumns((prev) =>
      prev.includes(column) ? prev.filter((item) => item !== column) : [...prev, column]
    );
  };

  const handlePortfolioSaveView = () => {
    const name = window.prompt("Name this view");
    if (!name) return;
    const newView = {
      name,
      groupBy: portfolioGroupBy,
      filters: portfolioFilters,
      columns: portfolioColumns,
    };
    setPortfolioSavedViews((prev) => [...prev.filter((view) => view.name !== name), newView]);
    setPortfolioView(name);
  };

  const handlePortfolioAction = (action) => {
    setActionSheet({
      action,
      context: { account_ids: selectedPortfolioAccounts.join(", ") },
    });
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
  const teamMembers = state?.instances.team_member || [];
  const outcomes = state?.instances.outcome || [];
  const risks = state?.instances.risk_issue || [];
  const invoices = state?.instances.invoice || [];
  const payments = state?.instances.payment || [];
  const meetings = state?.instances.meeting || [];
  const decisions = state?.instances.decision || [];
  const changeRequests = state?.instances.change_request || [];
  const stakeholders = state?.instances.stakeholder || [];
  const teamMembers = state?.instances.team_member || [];
  const statementsOfWork = state?.instances.statement_of_work || [];
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
      consulting_engagement: [
        "schedule_steering_committee",
        "publish_exec_readout",
        "run_value_realization_workshop",
        "launch_recovery_playbook",
      ],
      outcome: ["run_value_realization_workshop"],
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

  const deliveryActionContext =
    selectedObjectType === "milestone"
      ? selectedObjectRecord || {}
      : {
          engagement_id: engagements[0]?.engagement_id,
        };

  const deliveryActions = [
    {
      id: "request_signoff",
      description: "Request client sign-off for a milestone deliverable with explicit due date.",
      parameters: ["milestone_id", "requested_by", "due_date", "notes"],
    },
    {
      id: "escalate_blocker",
      description: "Escalate an active blocker with a clear decision request and mitigation ask.",
      parameters: ["milestone_id", "blocker_summary", "requested_decision_by_date"],
    },
    {
      id: "export_calendar",
      description: "Export milestones to an .ics calendar for stakeholders.",
      parameters: ["engagement_id", "date_range_start", "date_range_end", "distribution_list"],
    },
    {
      id: "schedule_reminder",
      description: "Schedule reminders for upcoming milestones and sign-offs.",
      parameters: ["milestone_id", "reminder_date", "reminder_message"],
    },
  ];

  if (!state) {
    return <div className="loading">Loading workspace…</div>;
  }

  const isViewer = state.role === "Viewer";

  const RENEWAL_RISK_THRESHOLD = 70;
  const MILESTONE_AT_RISK_WINDOW_DAYS = 14;
  const now = new Date();

  const isMilestoneAtRisk = (milestone) => {
    if (!milestone?.due_date || milestone.status === "Completed") return false;
    const dueDate = new Date(milestone.due_date);
    const daysToDue = (dueDate - now) / (1000 * 60 * 60 * 24);
    return (
      daysToDue <= MILESTONE_AT_RISK_WINDOW_DAYS ||
      getDerived(state, "milestone", milestone.milestone_id, "at_risk_flag")?.value
    );
  };

  const workstreamById = new Map(workstreams.map((workstream) => [workstream.workstream_id, workstream]));
  const engagementById = new Map(engagements.map((engagement) => [engagement.engagement_id, engagement]));
  const milestonesByAccountId = new Map();
  milestones.forEach((milestone) => {
    const workstream = workstreamById.get(milestone.workstream_id);
    const engagement = workstream ? engagementById.get(workstream.engagement_id) : null;
    if (!engagement) return;
    const list = milestonesByAccountId.get(engagement.account_id) ?? [];
    list.push(milestone);
    milestonesByAccountId.set(engagement.account_id, list);
  });
  const highRisksByAccountId = new Map();
  risks.forEach((risk) => {
    if (risk.severity !== "High" || risk.status === "Resolved") return;
    const engagement = engagementById.get(risk.engagement_id);
    if (!engagement) return;
    const list = highRisksByAccountId.get(engagement.account_id) ?? [];
    list.push(risk);
    highRisksByAccountId.set(engagement.account_id, list);
  });

  const filteredAccounts = accounts.filter((account) => {
    const segmentValue =
      getDerived(state, "client_account", account.account_id, "segment_tag")?.value || account.segment_tag;
    const regionMatches = !filters.region || account.region === filters.region;
    const segmentMatches = !filters.segment || segmentValue === filters.segment;
    const accountMatches = !filters.account || account.account_name === filters.account;
    return regionMatches && segmentMatches && accountMatches;
  });

  const accountInsights = filteredAccounts.map((account) => {
    const health = getDerived(state, "client_account", account.account_id, "health_score");
    const risk = getDerived(state, "client_account", account.account_id, "renewal_risk_score");
    const segment = getDerived(state, "client_account", account.account_id, "segment_tag");
    const accountMilestones = milestonesByAccountId.get(account.account_id) ?? [];
    const atRiskMilestoneCount = accountMilestones.filter(isMilestoneAtRisk).length;
    const highRiskCount = highRisksByAccountId.get(account.account_id)?.length ?? 0;
    return {
      account,
      health,
      risk,
      segment,
      atRiskMilestoneCount,
      highRiskCount,
    };
  });

  const attentionCandidates = accountInsights
    .filter(
      ({ risk, atRiskMilestoneCount, highRiskCount }) =>
        (risk?.value || 0) >= RENEWAL_RISK_THRESHOLD ||
        atRiskMilestoneCount > 0 ||
        highRiskCount > 0
    )
    .sort((a, b) => (b.risk?.value || 0) - (a.risk?.value || 0));

  const accountsAboveRiskThreshold = accountInsights.filter(
    ({ risk }) => (risk?.value || 0) >= RENEWAL_RISK_THRESHOLD
  ).length;

  const attentionAccounts = homeTopRiskOnly
    ? [...accountInsights].sort((a, b) => (b.risk?.value || 0) - (a.risk?.value || 0)).slice(0, 10)
    : attentionCandidates.slice(0, 6);

  const avgHealth = filteredAccounts.length
    ? Math.round(
        filteredAccounts.reduce(
          (sum, account) =>
            sum + (getDerived(state, "client_account", account.account_id, "health_score")?.value || 0),
          0
        ) / filteredAccounts.length
      )
    : 0;

  const avgRisk = filteredAccounts.length
    ? Math.round(
        filteredAccounts.reduce(
          (sum, account) =>
            sum + (getDerived(state, "client_account", account.account_id, "renewal_risk_score")?.value || 0),
          0
        ) / filteredAccounts.length
      )
    : 0;

  const freshAccounts = accountSignals.filter((item) => Number.isFinite(item.freshnessDays) && item.freshnessDays <= 30)
    .length;
  const missingDataAccounts = accountSignals.filter((item) => item.missingFields.length).length;

  const buildBreakdown = (items, keyFn) => {
    const groups = items.reduce((acc, item) => {
      const key = keyFn(item) || "Unassigned";
      if (!acc[key]) acc[key] = [];
      acc[key].push(item);
      return acc;
    }, {});
    return Object.entries(groups).map(([key, group]) => {
      const avgHealthScore = Math.round(group.reduce((sum, item) => sum + (item.healthValue || 0), 0) / group.length);
      const avgRiskScore = Math.round(group.reduce((sum, item) => sum + (item.riskValue || 0), 0) / group.length);
      return {
        key,
        count: group.length,
        avgHealthScore,
        avgRiskScore,
        healthDelta: avgHealthScore - avgHealth,
        riskDelta: avgRiskScore - avgRisk,
      };
    });
  };

  const segmentBreakdown = useMemo(
    () => buildBreakdown(accountSignals, (item) => item.segmentValue),
    [accountSignals, avgHealth, avgRisk]
  );

  const regionBreakdown = useMemo(
    () => buildBreakdown(accountSignals, (item) => item.account.region),
    [accountSignals, avgHealth, avgRisk]
  );

  const segmentCohortRows = segmentBreakdown.map((segment) => ({
    key: `segment-${segment.key}`,
    Cohort: segment.key,
    Accounts: segment.count,
    "Avg health": (
      <div className="delta-cell">
        <StatusPill label={segment.avgHealthScore} tone={getHealthTone(segment.avgHealthScore)} />
        <span>{formatDelta(segment.healthDelta)}</span>
      </div>
    ),
    "Avg risk": (
      <div className="delta-cell">
        <StatusPill label={segment.avgRiskScore} tone={getRiskTone(segment.avgRiskScore)} />
        <span>{formatDelta(segment.riskDelta)}</span>
      </div>
    ),
  }));

  const regionCohortRows = regionBreakdown.map((region) => ({
    key: `region-${region.key}`,
    Cohort: region.key,
    Accounts: region.count,
    "Avg health": (
      <div className="delta-cell">
        <StatusPill label={region.avgHealthScore} tone={getHealthTone(region.avgHealthScore)} />
        <span>{formatDelta(region.healthDelta)}</span>
      </div>
    ),
    "Avg risk": (
      <div className="delta-cell">
        <StatusPill label={region.avgRiskScore} tone={getRiskTone(region.avgRiskScore)} />
        <span>{formatDelta(region.riskDelta)}</span>
      </div>
    ),
  }));

  const onTrackOutcomes = (state.instances.outcome || []).filter(
    (outcome) => (getDerived(state, "outcome", outcome.outcome_id, "progress_pct")?.value || 0) >= 0.6
  ).length;

  const atRiskMilestones = milestones.filter(isMilestoneAtRisk).length;

  const openHighRisks = risks.filter((risk) => risk.severity === "High" && risk.status !== "Resolved").length;

  const overdueInvoices = invoices.filter((invoice) => invoice.status === "Overdue").length;

  const teamMemberMap = new Map(teamMembers.map((member) => [member.team_member_id, member]));
  const workstreamMap = new Map(workstreams.map((workstream) => [workstream.workstream_id, workstream]));
  const today = new Date();

  const milestoneInsights = milestones.map((milestone) => {
    const atRiskFlag = Boolean(
      getDerived(state, "milestone", milestone.milestone_id, "at_risk_flag")?.value
    );
    const risk = getMilestoneRisk(milestone, atRiskFlag, today);
    const slippageDays = getMilestoneSlippageDays(milestone, today);
    const workstream = workstreamMap.get(milestone.workstream_id);
    const dependencies = [];
    if (milestone.blocker_summary) {
      dependencies.push({ label: "Blocker", tone: "high" });
    }
    if (milestone.client_signoff_required_flag && !milestone.client_signoff_date) {
      dependencies.push({ label: "Client sign-off", tone: "medium" });
    }
    if (workstream?.status === "At Risk") {
      dependencies.push({ label: "Workstream risk", tone: "medium" });
    }
    if (milestone.due_date && new Date(milestone.due_date) < today && milestone.status !== "Completed") {
      dependencies.push({ label: "Overdue", tone: "high" });
    }
    const dueInDays = milestone.due_date ? getDaysBetween(today, new Date(milestone.due_date)) : 999;
    const isCritical =
      risk.label === "High" ||
      (milestone.status !== "Completed" && slippageDays > 0) ||
      (milestone.status !== "Completed" && dueInDays <= 14);
    return {
      milestone,
      workstream,
      atRiskFlag,
      risk,
      slippageDays,
      dependencies,
      isCritical,
    };
  });

  const ownerReliability = teamMembers.map((member) => {
    const ownerMilestones = milestoneInsights.filter(
      ({ milestone }) => milestone.owner_team_member_id === member.team_member_id
    );
    const completed = ownerMilestones.filter(({ milestone }) => milestone.completed_date);
    const onTimeCompleted = completed.filter(
      ({ milestone }) => milestone.due_date && new Date(milestone.completed_date) <= new Date(milestone.due_date)
    ).length;
    const onTimeRate = completed.length ? onTimeCompleted / completed.length : 0;
    const trend = ownerMilestones
      .slice()
      .sort((a, b) => new Date(a.milestone.due_date || 0) - new Date(b.milestone.due_date || 0))
      .slice(-4)
      .map(({ milestone }) => {
        if (milestone.completed_date && milestone.due_date) {
          return new Date(milestone.completed_date) <= new Date(milestone.due_date) ? 0.9 : 0.4;
        }
        if (milestone.due_date && new Date(milestone.due_date) >= today) {
          return 0.7;
        }
        return 0.3;
      });
    return {
      id: member.team_member_id,
      name: member.name,
      role: member.role,
      onTimeRate,
      trend: trend.length ? trend : [0.5, 0.6, 0.4, 0.7],
    };
  });

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

  const portfolioFilterOptions = {
    health: [
      { label: "All", value: "all" },
      { label: "Healthy", value: "healthy" },
      { label: "Needs attention", value: "watch" },
      { label: "Critical", value: "critical" },
    ],
    risk: [
      { label: "All", value: "all" },
      { label: "Low", value: "low" },
      { label: "Medium", value: "medium" },
      { label: "High", value: "high" },
    ],
    missing: [
      { label: "All", value: "all" },
      { label: "Only gaps", value: "gaps" },
      { label: "Complete", value: "complete" },
    ],
  };

  const portfolioHealthTier = (value) => {
    if (!Number.isFinite(value)) return "critical";
    if (value >= 75) return "healthy";
    if (value >= 55) return "watch";
    return "critical";
  };

  const portfolioRiskTier = (value) => {
    if (!Number.isFinite(value)) return "high";
    if (value >= 70) return "high";
    if (value >= 45) return "medium";
    return "low";
  };

  const portfolioFilteredAccounts = accountSignals.filter((item) => {
    if (portfolioFilters.health !== "all" && portfolioHealthTier(item.healthValue) !== portfolioFilters.health) {
      return false;
    }
    if (portfolioFilters.risk !== "all" && portfolioRiskTier(item.riskValue) !== portfolioFilters.risk) {
      return false;
    }
    const missingTier = item.missingFields.length ? "gaps" : "complete";
    if (portfolioFilters.missing !== "all" && missingTier !== portfolioFilters.missing) {
      return false;
    }
    return true;
  });

  const portfolioAccountIds = portfolioFilteredAccounts.map((item) => item.account.account_id);
  const allPortfolioSelected =
    portfolioAccountIds.length > 0 &&
    portfolioAccountIds.every((id) => selectedPortfolioAccounts.includes(id));

  const setPortfolioSelection = (accountId, checked) => {
    setSelectedPortfolioAccounts((prev) => {
      if (checked) {
        return prev.includes(accountId) ? prev : [...prev, accountId];
      }
      return prev.filter((item) => item !== accountId);
    });
  };

  const togglePortfolioSelectAll = (checked) => {
    setSelectedPortfolioAccounts(checked ? portfolioAccountIds : []);
  };

  const visiblePortfolioColumns = PORTFOLIO_COLUMNS.filter((column) => portfolioColumns.includes(column));

  const portfolioGroupedRows = useMemo(() => {
    if (portfolioGroupBy === "none") {
      return portfolioFilteredAccounts.map((item) => ({ type: "row", item }));
    }
    const groupKey = portfolioGroupBy === "region" ? "region" : "segment";
    const groups = portfolioFilteredAccounts.reduce((acc, item) => {
      const key = groupKey === "region" ? item.account.region || "Unassigned" : item.segmentValue || "Unassigned";
      if (!acc[key]) acc[key] = [];
      acc[key].push(item);
      return acc;
    }, {});
    return Object.entries(groups).flatMap(([key, items]) => [
      { type: "group", key, count: items.length },
      ...items.map((item) => ({ type: "row", item })),
    ]);
  }, [portfolioFilteredAccounts, portfolioGroupBy]);

  const portfolioTableRows = useMemo(
    () =>
      portfolioGroupedRows.map((entry) => {
        if (entry.type === "group") {
          return {
            key: `group-${entry.key}`,
            className: "table-group-row",
            Select: "",
            Account: (
              <div className="group-label">
                <strong>{portfolioGroupBy === "region" ? "Region" : "Segment"}:</strong> {entry.key}
                <span>{entry.count} accounts</span>
              </div>
            ),
            Industry: "",
            Region: "",
            Segment: "",
            Health: "",
            "Renewal risk": "",
            "Churn risk": "",
            "Data freshness": "",
            "Missing data": "",
            "Total value": "",
            "Estimated LTV": "",
            "LTV at risk": "",
          };
        }
        const { account, healthValue, riskValue, churnValue, freshnessDays, missingFields, ltvAtRisk, segmentValue } =
          entry.item;
        const isSelected = selectedPortfolioAccounts.includes(account.account_id);
        return {
          key: account.account_id,
          Select: (
            <div className="checkbox-cell" onClick={(event) => event.stopPropagation()}>
              <Checkbox
                checked={isSelected}
                onCheckedChange={(checked) => setPortfolioSelection(account.account_id, Boolean(checked))}
                disabled={isViewer}
                aria-label={`Select ${account.account_name}`}
              />
            </div>
          ),
          Account: account.account_name,
          Industry: account.industry,
          Region: account.region,
          Segment: segmentValue,
          Health: <StatusPill label={healthValue ?? "—"} tone={getHealthTone(healthValue)} />,
          "Renewal risk": <StatusPill label={riskValue ?? "—"} tone={getRiskTone(riskValue)} />,
          "Churn risk": <StatusPill label={churnValue ?? "—"} tone={getRiskTone(churnValue)} />,
          "Data freshness": (
            <StatusPill label={formatDays(freshnessDays)} tone={getFreshnessTone(freshnessDays)} />
          ),
          "Missing data": missingFields.length ? (
            <div className="missing-data">
              <StatusPill label={`${missingFields.length} gaps`} tone="status-pill--warn" />
              <span>{missingFields.slice(0, 2).map(toTitle).join(", ")}</span>
            </div>
          ) : (
            <StatusPill label="Complete" tone="status-pill--good" />
          ),
          "Total value": formatNumber(account.total_contract_value_to_date),
          "Estimated LTV": formatNumber(account.estimated_ltv),
          "LTV at risk": formatNumber(ltvAtRisk),
          onClick: () =>
            handleSelectObject({
              page: "portfolio",
              objectType: "client_account",
              objectId: account.account_id,
            }),
        };
      }),
    [
      handleSelectObject,
      isViewer,
      portfolioGroupBy,
      portfolioGroupedRows,
      selectedPortfolioAccounts,
      setPortfolioSelection,
    ]
  );

  const configMetadata = {
    company_name: state.config.client_metadata.company_name,
    primary_objective: state.config.client_metadata.primary_objective,
    fde_lead: state.config.client_metadata.fde_lead,
    deployment_timeline: state.config.client_metadata.deployment_timeline,
  };

  const unassignedMilestones = milestoneInsights.filter((item) => !item.workstream);
  const deliveryWorkstreams = [
    ...workstreams.map((workstream) => ({
      workstream,
      milestones: milestoneInsights.filter(
        (item) => item.milestone.workstream_id === workstream.workstream_id
      ),
    })),
    ...(unassignedMilestones.length
      ? [
          {
            workstream: {
              workstream_id: "unassigned",
              name: "Unassigned",
              status: "Needs assignment",
              owner_team_member_id: "",
            },
            milestones: unassignedMilestones,
          },
        ]
      : []),
  ].filter((group) => group.milestones.length);

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
      id: "critical-engagements",
      label: "Critical engagements (low health)",
      rows: lowHealthEngagements.map((signal) => ({
        key: signal.id,
        objectType: "consulting_engagement",
        objectId: signal.id,
        name: signal.name,
        status: `${signal.healthScore} health`,
        due: formatDate(signal.renewalDate),
        owner: signal.owner,
        action: "launch_recovery_playbook",
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

  const slaBreachCount = actionQueues.find((queue) => queue.id === "at-risk-milestones")?.rows.length || 0;
  const criticalBlockerCount = actionQueues.find((queue) => queue.id === "high-severity-risks")?.rows.length || 0;
  const recoveryQueueCount = actionQueues.find((queue) => queue.id === "critical-engagements")?.rows.length || 0;

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
                action={
                  <div className="page-actions">
                    <div className="pill">Executive Summary</div>
                    <button
                      type="button"
                      className={`filter-chip ${homeTopRiskOnly ? "active" : ""}`}
                      onClick={() => setHomeTopRiskOnly((prev) => !prev)}
                    >
                      Top 10 at-risk
                    </button>
                  </div>
                }
              />
              <GlobalFiltersBar filters={filters} onChange={handleFilterChange} filterOptions={filterOptions} />
              <div className="kpi-groups">
                <div className="kpi-group">
                  <div className="kpi-group-header">
                    <h3>Portfolio health</h3>
                    <p>Weighted score across health, risk, milestones, and outcomes.</p>
                  </div>
                  <div className="kpi-row">
                    <KpiCard
                      label="Portfolio Health Score"
                      value={`${portfolioHealthScore}%`}
                      helper={<TrendIndicator value={portfolioHealthTrend} />}
                    />
                    <KpiCard label="# Active Accounts" value={filteredAccounts.length} />
                    <KpiCard label="Avg Account Health" value={avgHealth} />
                    <KpiCard label="Outcomes On Track" value={onTrackOutcomes} />
                  </div>
                </div>
                <div className="kpi-group">
                  <div className="kpi-group-header">
                    <h3>Renewal risk</h3>
                    <p>Exposure to renewal slippage across top accounts.</p>
                  </div>
                  <div className="kpi-row">
                    <KpiCard label="Avg Renewal Risk" value={avgRisk} />
                    <KpiCard
                      label="Pipeline Risk Exposure"
                      value={`$${formatNumber(pipelineRiskExposure)}`}
                      helper="Top 5 accounts above risk threshold."
                    />
                    <KpiCard label="# Accounts Above Risk Threshold" value={accountsAboveRiskThreshold} />
                  </div>
                </div>
                <div className="kpi-group">
                  <div className="kpi-group-header">
                    <h3>Delivery & finance</h3>
                    <p>Commitments and collections requiring escalation.</p>
                  </div>
                  <div className="kpi-row">
                    <KpiCard label="# At-Risk Milestones" value={atRiskMilestones} />
                    <KpiCard label="# Open High Severity Risks" value={openHighRisks} />
                    <KpiCard label="# Overdue Invoices" value={overdueInvoices} />
                  </div>
                </div>
              </div>
              <Card className="panel formula-card">
                <h3>Portfolio health definition</h3>
                <p>
                  Weighted score = 40% average health + 25% inverse renewal risk + 20% milestone reliability + 15%
                  outcome confidence. Reliability = 100 - (% milestones at risk).
                </p>
                <div className="formula-meta">
                  <div>
                    <strong>At-risk milestone threshold</strong>
                    <span>Due in ≤ {MILESTONE_AT_RISK_WINDOW_DAYS} days or flagged at risk.</span>
                  </div>
                  <div>
                    <strong>Renewal risk threshold</strong>
                    <span>Score ≥ {RENEWAL_RISK_THRESHOLD} triggers renewal risk alerts.</span>
                  </div>
                </div>
              </Card>
              <div className="visual-grid">
                <ChartCard
                  title="Risk vs Value scatter"
                  description="Renewal risk plotted against total contract value, colored by segment."
                >
                  <RiskValueScatter
                    data={accountInsights.map(({ account, risk, segment }) => ({
                      id: account.account_id,
                      risk: risk?.value ?? 0,
                      value: Number(account.total_contract_value_to_date || 0),
                      segment: segment?.value ?? account.segment_tag ?? "Core",
                    }))}
                  />
                </ChartCard>
                <ChartCard
                  title="Portfolio health trend"
                  description="Trailing six checkpoints (simulated from current health drivers)."
                >
                  <HealthTrendChart
                    data={[
                      { label: "Apr", value: clamp(portfolioHealthScore - 12, 0, 100) },
                      { label: "May", value: clamp(portfolioHealthScore - 8, 0, 100) },
                      { label: "Jun", value: clamp(portfolioHealthScore - 5, 0, 100) },
                      { label: "Jul", value: clamp(portfolioHealthScore - 3, 0, 100) },
                      { label: "Aug", value: clamp(portfolioHealthScore - 1, 0, 100) },
                      { label: "Sep", value: portfolioHealthScore },
                    ]}
                  />
                </ChartCard>
              </div>
              <div className="module-grid">
                <div className="module-main">
                  <Card className="panel">
                    <div className="panel-header">
                      <div>
                        <h3>Accounts needing attention</h3>
                        <p>
                          {homeTopRiskOnly
                            ? "Top 10 accounts by renewal risk score."
                            : "Accounts above renewal or delivery risk thresholds."}
                        </p>
                      </div>
                      <Badge variant="secondary">{attentionAccounts.length} accounts</Badge>
                    </div>
                    <DataTable
                      columns={[
                        "Account",
                        "Health",
                        "Renewal risk",
                        "Alerts",
                        "Segment",
                        "Value",
                        "Quick actions",
                      ]}
                      rows={attentionAccounts.map(
                        ({ account, health, risk, segment, atRiskMilestoneCount, highRiskCount }) => {
                          const renewalRiskValue = risk?.value ?? account.renewal_risk_score;
                          const alertBadges = [];
                          if (renewalRiskValue >= RENEWAL_RISK_THRESHOLD) {
                            alertBadges.push(
                              <Badge key="renewal" className="alert-badge" variant="secondary">
                                Renewal risk
                              </Badge>
                            );
                          }
                          if (atRiskMilestoneCount > 0) {
                            alertBadges.push(
                              <Badge key="milestone" className="alert-badge" variant="outline">
                                {atRiskMilestoneCount} milestone{atRiskMilestoneCount > 1 ? "s" : ""} due
                              </Badge>
                            );
                          }
                          if (highRiskCount > 0) {
                            alertBadges.push(
                              <Badge key="risk" className="alert-badge danger" variant="outline">
                                High severity risk
                              </Badge>
                            );
                          }
                          return {
                            key: account.account_id,
                            Account: account.account_name,
                            Health: health?.value ?? account.health_score,
                            "Renewal risk": renewalRiskValue,
                            Alerts: <div className="alert-badges">{alertBadges}</div>,
                            Segment: segment?.value ?? account.segment_tag,
                            Value: formatNumber(account.total_contract_value_to_date),
                            "Quick actions": (
                              <div className="table-actions">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={(event) => {
                                    event.stopPropagation();
                                    const action = actionMap.publish_exec_readout;
                                    if (action) {
                                      setActionSheet({ action, context: account });
                                    }
                                  }}
                                >
                                  Open exec brief
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={(event) => {
                                    event.stopPropagation();
                                    const action = actionMap.escalate_risk_issue;
                                    if (action) {
                                      setActionSheet({ action, context: account });
                                    }
                                  }}
                                >
                                  Start escalation
                                </Button>
                              </div>
                            ),
                            onClick: () =>
                              handleSelectObject({
                                page: "home",
                                objectType: "client_account",
                                objectId: account.account_id,
                              }),
                          };
                        }
                      )}
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
                <KpiCard label="Avg Churn Risk" value={avgChurnRisk} />
                <KpiCard
                  label="Data Freshness"
                  value={formatDays(avgFreshnessDays)}
                  helper={`${freshAccounts}/${accounts.length} updated <30d`}
                />
                <KpiCard
                  label="LTV at Risk"
                  value={formatNumber(totalLtvAtRisk)}
                  helper={`${missingDataAccounts} accounts with data gaps`}
                />
              </div>
              <Card className="panel">
                <h3>Cohort metrics</h3>
                <p className="help-text">Segment and region cohorts with deltas vs portfolio averages.</p>
                <div className="cohort-grid">
                  <div>
                    <h4>Segment cohorts</h4>
                    <DataTable columns={["Cohort", "Accounts", "Avg health", "Avg risk"]} rows={segmentCohortRows} />
                  </div>
                  <div>
                    <h4>Regional cohorts</h4>
                    <DataTable columns={["Cohort", "Accounts", "Avg health", "Avg risk"]} rows={regionCohortRows} />
                  </div>
                </div>
              </Card>
              <div className="visual-grid">
                <ChartCard
                  title="Segment breakdown"
                  description="Account mix with average health and renewal risk."
                >
                  <div className="chart-breakdown">
                    {segmentBreakdown.map((segment) => (
                      <div key={segment.key} className="breakdown-row">
                        <div>
                          <strong>{segment.key}</strong>
                          <span>{segment.count} accounts</span>
                        </div>
                        <div>
                          <StatusPill label={`H ${segment.avgHealthScore}`} tone={getHealthTone(segment.avgHealthScore)} />
                          <StatusPill label={`R ${segment.avgRiskScore}`} tone={getRiskTone(segment.avgRiskScore)} />
                        </div>
                      </div>
                    ))}
                  </div>
                </ChartCard>
                <ChartCard title="Regional breakdown" description="Health and risk by region.">
                  <div className="chart-breakdown">
                    {regionBreakdown.map((region) => (
                      <div key={region.key} className="breakdown-row">
                        <div>
                          <strong>{region.key}</strong>
                          <span>{region.count} accounts</span>
                        </div>
                        <div>
                          <StatusPill label={`H ${region.avgHealthScore}`} tone={getHealthTone(region.avgHealthScore)} />
                          <StatusPill label={`R ${region.avgRiskScore}`} tone={getRiskTone(region.avgRiskScore)} />
                        </div>
                      </div>
                    ))}
                  </div>
                </ChartCard>
                <ChartCard
                  title="Health vs Risk Quadrant"
                  description="Quadrant view of portfolio health vs renewal risk."
                />
              </div>
              <div className="module-grid">
                <div className="module-main">
                  <Card className="panel">
                    <h3>Accounts</h3>
                    <div className="table-toolbar">
                      <div className="toolbar-group">
                        <div className="toolbar-block">
                          <span>Saved view</span>
                          <Select value={portfolioView} onValueChange={handlePortfolioViewChange}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select view" />
                            </SelectTrigger>
                            <SelectContent>
                              {portfolioSavedViews.map((view) => (
                                <SelectItem key={view.name} value={view.name}>
                                  {view.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <Button variant="ghost" onClick={handlePortfolioSaveView} disabled={isViewer}>
                            Save view
                          </Button>
                        </div>
                        <div className="toolbar-block">
                          <span>Group by</span>
                          <Select value={portfolioGroupBy} onValueChange={setPortfolioGroupBy}>
                            <SelectTrigger>
                              <SelectValue placeholder="None" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="none">None</SelectItem>
                              <SelectItem value="region">Region</SelectItem>
                              <SelectItem value="segment">Segment</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="toolbar-block">
                          <span>Health</span>
                          <Select
                            value={portfolioFilters.health}
                            onValueChange={(value) => handlePortfolioFilterChange("health", value)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="All health" />
                            </SelectTrigger>
                            <SelectContent>
                              {portfolioFilterOptions.health.map((option) => (
                                <SelectItem key={option.value} value={option.value}>
                                  {option.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="toolbar-block">
                          <span>Risk</span>
                          <Select
                            value={portfolioFilters.risk}
                            onValueChange={(value) => handlePortfolioFilterChange("risk", value)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="All risk" />
                            </SelectTrigger>
                            <SelectContent>
                              {portfolioFilterOptions.risk.map((option) => (
                                <SelectItem key={option.value} value={option.value}>
                                  {option.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="toolbar-block">
                          <span>Missing data</span>
                          <Select
                            value={portfolioFilters.missing}
                            onValueChange={(value) => handlePortfolioFilterChange("missing", value)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="All data" />
                            </SelectTrigger>
                            <SelectContent>
                              {portfolioFilterOptions.missing.map((option) => (
                                <SelectItem key={option.value} value={option.value}>
                                  {option.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="toolbar-group">
                        <div className="selection-toggle" onClick={(event) => event.stopPropagation()}>
                          <Checkbox
                            checked={allPortfolioSelected}
                            onCheckedChange={(checked) => togglePortfolioSelectAll(Boolean(checked))}
                            disabled={isViewer}
                          />
                          <span>
                            Select all ({portfolioAccountIds.length})
                          </span>
                        </div>
                        <span className="selection-summary">
                          Selected: {selectedPortfolioAccounts.length}
                        </span>
                        <Button
                          variant="ghost"
                          onClick={() => setSelectedPortfolioAccounts([])}
                          disabled={isViewer || selectedPortfolioAccounts.length === 0}
                        >
                          Clear selection
                        </Button>
                      </div>
                    </div>
                    <div className="column-picker">
                      <span>Columns</span>
                      <div className="column-grid">
                        {PORTFOLIO_COLUMNS.filter((column) => column !== "Select").map((column) => (
                          <label key={column}>
                            <Checkbox
                              checked={portfolioColumns.includes(column)}
                              onCheckedChange={() => handlePortfolioColumnToggle(column)}
                            />
                            {column}
                          </label>
                        ))}
                      </div>
                    </div>
                    <DataTable columns={visiblePortfolioColumns} rows={portfolioTableRows} />
                    <div className="table-actions">
                      <div>
                        <h4>Bulk actions</h4>
                        <p className="help-text">Apply owner assignments or tasks to the selected accounts.</p>
                        <div className="button-row">
                          {portfolioBulkActions.map((action) => (
                            <Button
                              key={action.id}
                              onClick={() => handlePortfolioAction(action)}
                              disabled={isViewer || selectedPortfolioAccounts.length === 0}
                            >
                              {toTitle(action.id)}
                            </Button>
                          ))}
                        </div>
                      </div>
                      <div>
                        <h4>Exports & scheduling</h4>
                        <p className="help-text">
                          Schedule recurring exports or generate one-off reports.
                        </p>
                        <div className="button-row">
                          {portfolioExportActions.map((action) => (
                            <Button key={action.id} variant="ghost" onClick={() => handlePortfolioAction(action)}>
                              {toTitle(action.id)}
                            </Button>
                          ))}
                        </div>
                      </div>
                    </div>
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
              <div className="card-grid">
                {engagementSignals.map((signal) => (
                  <Card key={signal.id} className="object-card">
                    <header>
                      <strong>{signal.name}</strong>
                      <Badge className={signal.healthStatus.className}>{signal.healthStatus.label}</Badge>
                    </header>
                    <div className="summary-grid compact">
                      <div className="summary-tile">
                        <span className="label">Owner</span>
                        <strong>{signal.owner || "—"}</strong>
                      </div>
                      <div className="summary-tile">
                        <span className="label">Renewal</span>
                        <strong>{formatDate(signal.renewalDate)}</strong>
                      </div>
                      <div className="summary-tile">
                        <span className="label">Open risks</span>
                        <strong>{signal.openRisks.length}</strong>
                        <span className="helper">{signal.highRisks.length} high severity</span>
                      </div>
                      <div className="summary-tile">
                        <span className="label">Renewal forecast</span>
                        <strong>{signal.renewalForecastScore}</strong>
                        <span className="helper">Composite score</span>
                      </div>
                      <div className="summary-tile">
                        <span className="label">Scope creep</span>
                        <strong>{signal.activeScopeChanges.length ? "Active" : "Clear"}</strong>
                        <span className="helper">
                          {signal.activeScopeChanges.length
                            ? `${signal.activeScopeChanges.length} change request${signal.activeScopeChanges.length > 1 ? "s" : ""}`
                            : "No open changes"}
                        </span>
                      </div>
                    </div>
                    {signal.healthStatus.label === "Low" && actionMap.launch_recovery_playbook ? (
                      <Button
                        onClick={() =>
                          setActionSheet({
                            action: actionMap.launch_recovery_playbook,
                            context: { engagement_id: signal.id },
                          })
                        }
                      >
                        Launch recovery playbook
                      </Button>
                    ) : null}
                  </Card>
                ))}
              </div>
              <div className="visual-grid">
                <ChartCard
                  title="Health Composition (Donut)"
                  description="Milestones, sentiment, risks, and scope signals."
                />
                <ChartCard title="Engagement Health Trend" description="Weekly score trend line over the last 90 days." />
              </div>
              <div className="module-grid">
                <div className="module-main">
                  <Card className="panel">
                    <h3>Engagement health drivers</h3>
                    <DataTable
                      columns={["Engagement", "Milestones", "Sponsor sentiment", "Open risks", "Scope creep"]}
                      rows={engagementSignals.map((signal) => ({
                        key: `${signal.id}-drivers`,
                        Engagement: signal.name,
                        Milestones: formatPercent(signal.milestoneOnTimeRate),
                        "Sponsor sentiment": formatPercent(signal.sentimentScore),
                        "Open risks": `${signal.openRisks.length} (${signal.highRisks.length} high)`,
                        "Scope creep": signal.activeScopeChanges.length ? (
                          <Badge className="border border-rose-200 bg-rose-100 text-rose-800">Active</Badge>
                        ) : (
                          <Badge variant="secondary">Clear</Badge>
                        ),
                        onClick: () =>
                          handleSelectObject({
                            page: "engagement-health",
                            objectType: "consulting_engagement",
                            objectId: signal.id,
                          }),
                      }))}
                    />
                  </Card>
                  <Card className="panel">
                    <h3>Engagements</h3>
                    <DataTable
                      columns={[
                        "Engagement",
                        "Status",
                        "Renewal",
                        "Health",
                        "Health status",
                        "Renewal forecast",
                        "Scope creep",
                        "Completion",
                        "Action",
                      ]}
                      rows={engagementSignals.map((signal) => ({
                        key: signal.id,
                        Engagement: signal.name,
                        Status: signal.engagement.status,
                        Renewal: formatDate(signal.renewalDate),
                        Health: signal.healthScore,
                        "Health status": (
                          <Badge className={signal.healthStatus.className}>{signal.healthStatus.label}</Badge>
                        ),
                        "Renewal forecast": signal.renewalForecastScore,
                        "Scope creep": signal.activeScopeChanges.length ? (
                          <Badge className="border border-rose-200 bg-rose-100 text-rose-800">Active</Badge>
                        ) : (
                          <Badge variant="secondary">Clear</Badge>
                        ),
                        Completion: formatPercent(signal.completionRate),
                        Action:
                          signal.healthStatus.label === "Low" && actionMap.launch_recovery_playbook ? (
                            <Button
                              onClick={(event) => {
                                event.stopPropagation();
                                setActionSheet({
                                  action: actionMap.launch_recovery_playbook,
                                  context: { engagement_id: signal.id },
                                });
                              }}
                            >
                              Launch recovery playbook
                            </Button>
                          ) : (
                            "—"
                          ),
                        onClick: () =>
                          handleSelectObject({
                            page: "engagement-health",
                            objectType: "consulting_engagement",
                            objectId: signal.id,
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
                action={
                  <div className="action-row">
                    {deliveryActions.map((action) => (
                      <Button
                        key={action.id}
                        variant="secondary"
                        onClick={() => setActionSheet({ action, context: deliveryActionContext })}
                      >
                        {toTitle(action.id)}
                      </Button>
                    ))}
                  </div>
                }
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
                <WorkstreamTimeline
                  workstreams={workstreams}
                  milestoneInsights={milestoneInsights}
                  onSelect={handleSelectObject}
                />
                <SlippageHistogram milestoneInsights={milestoneInsights} />
              </div>
              <div className="insight-grid">
                <OwnerReliabilityCard ownerReliability={ownerReliability} />
              </div>
              <div className="module-grid">
                <div className="module-main">
                  <Card className="panel">
                    <h3>Milestones</h3>
                    <div className="workstream-sections">
                      {deliveryWorkstreams.map(({ workstream, milestones: groupedMilestones }) => (
                        <div key={workstream.workstream_id} className="workstream-section">
                          <div className="workstream-header">
                            <div>
                              <h4>{workstream.name}</h4>
                              <span className="muted">Owner: {teamMemberMap.get(workstream.owner_team_member_id)?.name || "—"}</span>
                            </div>
                            <StatusChip status={workstream.status} />
                          </div>
                          <DataTable
                            columns={["Milestone", "Status", "Due date", "Risk", "Dependencies", "Owner", "Signoff"]}
                            rows={groupedMilestones.map(({ milestone, risk, dependencies, isCritical }) => ({
                              key: milestone.milestone_id,
                              className: isCritical ? "critical-row" : "",
                              Milestone: (
                                <div className="milestone-cell">
                                  <strong>{milestone.name}</strong>
                                  {isCritical ? <Badge className="critical-chip">Critical path</Badge> : null}
                                </div>
                              ),
                              Status: <StatusChip status={milestone.status} />,
                              "Due date": formatDate(milestone.due_date),
                              Risk: <RiskChip label={risk.label} />,
                              Dependencies: dependencies.length ? (
                                <div className="dependency-list">
                                  {dependencies.map((dependency) => (
                                    <Badge
                                      key={`${milestone.milestone_id}-${dependency.label}`}
                                      className={`dependency-chip dependency-${dependency.tone}`}
                                      variant="outline"
                                    >
                                      {dependency.label}
                                    </Badge>
                                  ))}
                                </div>
                              ) : (
                                "—"
                              ),
                              Owner: teamMemberMap.get(milestone.owner_team_member_id)?.name || milestone.owner_team_member_id,
                              Signoff: milestone.client_signoff_date ? "Signed" : "Pending",
                              onClick: () =>
                                handleSelectObject({
                                  page: "delivery-reliability",
                                  objectType: "milestone",
                                  objectId: milestone.milestone_id,
                                }),
                            }))}
                          />
                        </div>
                      ))}
                    </div>
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
                  label="# Metrics improving"
                  value={snapshots.filter((snapshot) => snapshot.value > 0).length}
                />
                <KpiCard
                  label="# Metrics stalled"
                  value={snapshots.filter((snapshot) => snapshot.value <= 0).length}
                />
                <KpiCard
                  label="Data freshness"
                  value={snapshots.length ? formatDate(snapshots[0].observed_at) : "—"}
                />
              </div>
              <div className="visual-grid">
                <ChartCard title="KPI Trendlines" description="Baseline vs target vs latest snapshots." />
                <ChartCard title="Outcome Progress Roll-up" />
              </div>
              <div className="module-grid">
                <div className="module-main">
                  <Card className="panel">
                    <h3>Outcomes</h3>
                    <DataTable
                      columns={["Outcome", "Owner", "Target date", "Status", "Progress"]}
                      rows={outcomes.map((outcome) => ({
                        key: outcome.outcome_id,
                        Outcome: outcome.name,
                        Owner: outcome.owner_stakeholder_id,
                        "Target date": formatDate(outcome.target_date),
                        Status: outcome.status,
                        Progress: formatPercent(
                          getDerived(state, "outcome", outcome.outcome_id, "progress_pct")?.value || 0
                        ),
                        onClick: () =>
                          handleSelectObject({
                            page: "value-realization",
                            objectType: "outcome",
                            objectId: outcome.outcome_id,
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
                <KpiCard label="SLA breaches" value={slaBreachCount} />
                <KpiCard label="Critical blockers" value={criticalBlockerCount} />
                <KpiCard label="Recovery playbooks" value={recoveryQueueCount} />
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
