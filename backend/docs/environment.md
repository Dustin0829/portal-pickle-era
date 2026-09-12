# Environment

Copy `.env.example` to `.env`.

## Core

| Variable                | Purpose                                | Default / notes                               |
| ----------------------- | -------------------------------------- | --------------------------------------------- |
| `NODE_ENV`              | `development`, `test`, or `production` | `development`                                 |
| `PORT`                  | API listen port                        | `3000`                                        |
| `DATABASE_URL`          | PostgreSQL connection string           | local docker default in `.env.example`        |
| `API_CORS_ORIGIN`       | Comma-separated CORS origins           | `http://localhost:5173,http://localhost:5174` |
| `RATE_LIMIT_WINDOW_MS`  | Rate limit window                      | `60000`                                       |
| `RATE_LIMIT_MAX`        | Max requests per window per IP         | `300`                                         |
| `LOG_LEVEL`             | Winston log level                      | `info`                                        |
| `OBSERVABILITY_SERVICE` | Service name in logs/alerts            | `backend`                                     |

## Admin tools (Swagger, OpenAPI JSON, Bull Board)

| URL                                         | Purpose                                                  |
| ------------------------------------------- | -------------------------------------------------------- |
| `http://localhost:3000/docs`                | Swagger UI (uses in-memory spec — same as repo contract) |
| `http://localhost:3000/openapi.json`        | Download OpenAPI JSON (not public in production)         |
| `http://localhost:3000/admin/queues`        | Bull Board (requires `REDIS_URL`)                        |
| `http://localhost:3000/admin/activity-logs` | Activity log list (Timescale; 503 if store unset)        |

All of these routes live on the **same API server** as your product routes. Activity-log reads use the same basic-auth policy as Swagger. The **support** SPA (`http://localhost:5174`) is the operator UI.

Timescale boot enables compression after **7 days** and retention of **30 days**. Policy SQL failures are logged and do not block boot.

| Environment   | Without `ADMIN_BASIC_AUTH_*` | With both `ADMIN_BASIC_AUTH_*` set        |
| ------------- | ---------------------------- | ----------------------------------------- |
| `development` | Admin tools open             | Admin tools require HTTP Basic Auth       |
| `production`  | Admin tools **not mounted**  | Admin tools mounted + Basic Auth required |

Set both `ADMIN_BASIC_AUTH_USER` and `ADMIN_BASIC_AUTH_PASSWORD` on deployed environments.

The committed file `contracts/openapi.json` in the repo is unchanged — only the HTTP endpoint is protected.

## Optional: Activity logs (Timescale)

| Variable            | Purpose                                                                                                            |
| ------------------- | ------------------------------------------------------------------------------------------------------------------ |
| `LOGS_DATABASE_URL` | Connection string for the logs database. Unset = skip capture; list/detail return 503 `ACTIVITY_LOGS_UNAVAILABLE`. |

Local Docker exposes Timescale on host port **5433** (`backend_logs`). Compress after 7 days; drop after 30 days.

### Activity-logs anomaly agents

For scheduled hunter/fixer Cursor Automations, create a **read-only** role (`activity_logs_reader`) and store its connection string as the Automation secret `LOGS_DATABASE_URL`. The app runtime writer URL stays separate — see [activity-logs-anomaly-agents.md](./activity-logs-anomaly-agents.md).

Day-1 filing policy: hunter files **CRITICAL** only to Workspace; HIGH/IMPROVE stay Discord digest only.

## Optional: Async SaaS Mode

| Variable    | Purpose                                        |
| ----------- | ---------------------------------------------- |
| `REDIS_URL` | Enables BullMQ producers and worker processing |

Leave `REDIS_URL` unset for Minimal SaaS Mode.

## Optional: Admin basic auth

| Variable                    | Purpose                                                                                    |
| --------------------------- | ------------------------------------------------------------------------------------------ |
| `ADMIN_BASIC_AUTH_USER`     | HTTP Basic Auth user for `/docs`, `/openapi.json`, `/admin/queues`, `/admin/activity-logs` |
| `ADMIN_BASIC_AUTH_PASSWORD` | HTTP Basic Auth password (set both or neither)                                             |

## Optional: R2 uploads

Set these only when using `POST /uploads/presign`:

- `R2_ACCOUNT_ID`
- `R2_ACCESS_KEY_ID`
- `R2_SECRET_ACCESS_KEY`
- `R2_BUCKET`
- `R2_PUBLIC_BASE_URL`

## Optional: Discord alerts

- `DISCORD_API_ALERT_WEBHOOK_URL`
- `DISCORD_ALERT_SLOW_MS` (default `5000`)

4xx Discord alerts follow `NODE_ENV`:

- `development` — alert on all 4xx (except `401`)
- `production` — skip `400`, `403`, `404`, `409`, `422` (expected user-behavior errors)
