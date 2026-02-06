# Observability Spec — Productized Service Decision Cockpit (Local)

## SLIs/SLOs (guardrails)
- Availability: App loads successfully on local launch (target 99% sessions).
- p95 latency: < 250ms for primary interactions (page switches, action submissions).
- Error rate: < 1% of action submissions fail.
- Cost budget: $0 (local-only, no external services).
- Quality proxy: Recommendation follow-through rate >= 50% of lead recommendations acted on in-session.
- Safety metrics: 0 PII leakage in telemetry (no emails/phone numbers captured).
- Data health: >= 70% of leads have next step + last contact captured.

## Instrumentation
- Metrics:
  - `telemetry_log` counts by event type (page_view, action_submitted, marketing_focus_logged, import_completed).
  - Coverage metrics computed in UI (lead next-step coverage, CAC/margin coverage).
- Logs (schema + redaction):
  - `action_log`: action_type, timestamps, object ids only (no contact details).
  - `audit_log`: config and instance changes.
  - `telemetry_log`: event_type, timestamp, page, object ids; no PII.
- Traces (propagation + spans):
  - Not applicable for local-only app. Use action/telemetry IDs as lightweight correlation IDs.

## Dashboards
- Product:
  - Recommendation actions per session.
  - Lead next-step coverage.
- System:
  - Page views and action submissions (last 7 days).
- AI/Agent:
  - Decision-engine focus count vs. acted-on count.
- Safety:
  - Telemetry events with missing object ids (signal for logging gaps).

## Alerts + runbooks
- Paging: None (local-only).
- Tickets: Create backlog items when coverage or follow-through drops below thresholds.
- Owners: Product owner (quality/coverage), engineering owner (logging + UI signals).
