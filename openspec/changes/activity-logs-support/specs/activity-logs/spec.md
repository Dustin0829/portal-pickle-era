## Purpose

Captures HTTP and job activity into a Timescale store and lets operators inspect it from a support app via list and detail APIs, without product-user authentication.

## ADDED Requirements

### Requirement: Activity capture is fail-open

The system MUST record sampled HTTP requests and BullMQ job outcomes into the activity-log store when `LOGS_DATABASE_URL` is configured. Capture MUST NOT fail the original HTTP response or job when the logs store is unset, unreachable, or a flush fails.

#### Scenario: Logs store configured
- **WHEN** an in-scope HTTP request completes and `LOGS_DATABASE_URL` is set
- **THEN** a redacted activity record of kind `http` is eventually persisted in the logs store

#### Scenario: Logs store unset
- **WHEN** `LOGS_DATABASE_URL` is unset
- **THEN** product HTTP routes still succeed and no activity-log write is required

### Requirement: Sampling and redaction

The system MUST skip capture for health, OpenAPI/docs, Bull Board, activity-log read APIs, and OPTIONS. Captured bodies MUST redact secrets and truncate oversized payloads. List responses MUST omit request/response/payload bodies; detail responses MAY include those fields.

#### Scenario: Health is not logged
- **WHEN** a client calls `GET /health`
- **THEN** no activity-log row is written for that request

#### Scenario: List omits bodies
- **WHEN** an authorized client lists activity logs
- **THEN** each item includes metadata (id, timestamp, kind, method, path, status, duration, job fields) and MUST NOT include request, response, or payload JSON

### Requirement: Activity log list API

The system MUST expose `GET /admin/activity-logs` behind the same admin-tools access policy as Swagger and Bull Board (open in development when basic auth is unset; HTTP Basic required when credentials are configured; not mounted in production unless credentials are configured).

Query MUST require `from` and `to` (max range 7 days, `from` before `to`). Optional filters: `kind` (`http` | `job`), `method`, `status_class` (`2xx` | `3xx` | `4xx` | `5xx`), `path_contains`, `user_id`, `queue`, `job_name`, `job_status` (`completed` | `failed`). Pagination MUST use the template’s existing page/limit contract. There is no email filter. CORS MUST allow the support origin and the `Authorization` header so the support app can send HTTP Basic when credentials are configured. The HTTP rate limiter MUST skip `GET /admin/activity-logs` and `GET /admin/activity-logs/:id` so auto-refresh cannot 429 the operator.

#### Scenario: Valid list
- **WHEN** an allowed caller requests logs with a 24-hour `from`/`to` window
- **THEN** the API returns `success: true` with `data` items and pagination `meta`

#### Scenario: Range too large
- **WHEN** `to - from` is greater than 7 days
- **THEN** the API returns 422 validation error

#### Scenario: Store unavailable
- **WHEN** an allowed caller lists logs and the logs store is unset or down
- **THEN** the API returns 503 with code `ACTIVITY_LOGS_UNAVAILABLE`

#### Scenario: Unauthorized when protected
- **WHEN** admin basic auth is configured and the caller omits valid credentials
- **THEN** the API returns 401

#### Scenario: Activity-log reads are not rate-limited
- **WHEN** the support app auto-refreshes list or detail under the normal product rate-limit window
- **THEN** those GET `/admin/activity-logs` requests MUST NOT receive 429 from the global HTTP limiter

### Requirement: Activity log detail API

The system MUST expose `GET /admin/activity-logs/:id` under the same access policy. `:id` MUST be a UUID. A found record MUST include bodies (request/response/payload) subject to stored redaction. Missing id MUST return 404.

#### Scenario: Detail found
- **WHEN** an allowed caller fetches an existing log id
- **THEN** the API returns that record including body fields

#### Scenario: Detail missing
- **WHEN** an allowed caller fetches an unknown UUID
- **THEN** the API returns 404

### Requirement: Support activity logs UI

The support app MUST provide an activity-logs screen equivalent in UX to Vid-U admin activity logs: kind and field filters, datetime range (default last 24 hours, max 7 days), paginated table, row opens a detail modal, optional auto-refresh, and a distinct empty/unavailable state when the API returns `ACTIVITY_LOGS_UNAVAILABLE`. When admin basic auth is configured and the API returns 401, the support app MUST show a dedicated unauthorized page with retry. Product auth MUST NOT be required; the support client MUST use the same admin-tools credential policy as the API (no credentials in open local development).

#### Scenario: Operator browses HTTP logs
- **WHEN** the operator opens the support activity-logs page with the logs store healthy
- **THEN** they see a filterable table of HTTP (and, when selected, job) rows and can open a detail modal for one row

#### Scenario: Store down in UI
- **WHEN** the list API returns 503 `ACTIVITY_LOGS_UNAVAILABLE`
- **THEN** the page shows an unavailable state instead of a generic crash

#### Scenario: Unauthorized in UI
- **WHEN** admin basic auth is configured and the list or detail API returns 401
- **THEN** the support app shows a dedicated unauthorized page (not a blank crash) with a retry action

### Requirement: Timescale retention and compression

When the logs store is configured, schema boot MUST enable Timescale compression (compress chunks older than 7 days) and a retention policy (drop chunks older than 30 days). Policy setup failure MUST NOT prevent the API or worker from booting (log and continue).

#### Scenario: Policies applied
- **WHEN** the logs store is healthy Timescale and schema boot succeeds
- **THEN** compression and 30-day retention policies exist on `activity_log` (or equivalent if already present)

#### Scenario: Policy SQL fails
- **WHEN** compression or retention SQL fails at boot
- **THEN** the process still serves HTTP and capture remains fail-open
