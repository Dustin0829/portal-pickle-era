## Why

The starter is a shared foundation for many products, not a day-one SaaS kit. Operators still need request/job visibility and a generic HTTP 429 experience, without shipping product auth. Vid-U already proved a Timescale activity-log pipeline plus an admin list/detail UI; this change ports that as template plumbing, plus a Prisma `audit_logs` table for future business events.

## What Changes

- Add a Timescale service to local Docker (`LOGS_DATABASE_URL`) and an HTTP/job activity-log pipeline (sample, redact, buffer, BullMQ flush). Fail-open when the logs store is unset or down.
- Add support list/detail APIs: `GET /admin/activity-logs` (metadata only) and `GET /admin/activity-logs/:id` (includes bodies). Same HTTP Basic Auth policy as existing admin tools (Swagger / Bull Board).
- Add a new **`support/`** Vite+React package cloned from `app/` (same UI stack). Primary screen matches Vid-U admin activity logs: filters, table, pagination, detail modal, auto-refresh, store-unavailable empty state. Default local URL `http://localhost:5174`.
- Add Prisma `AuditLog` (`audit_logs`) on the product Postgres database and a service-layer write helper. Wire the examples create path so the table is exercised. This is **not** the Timescale activity log.
- Product `app`: generic 429 interceptor + `RateLimitGate` full-page recovery. API 429 body stays generic (no product quota codes). Skip health and activity-log GETs on the limiter.
- Cursor: generic `optimistic-ui` skill on `app` and `support` (recipe only; no Vid-U domain examples).
- Register `support` in `openspec/config.yaml` `kit.repos`. Expand CORS so both `app` and `support` origins work in local Docker.
- Timescale: compression after 7 days, drop chunks older than 30 days (fail-open if policy SQL fails).
- Support: dedicated 401 screen when admin basic auth is configured and the API returns 401.
- Both Vite apps (`app` and `support`): SPA catch-all **404 page** and `vercel.json` rewrite to `index.html`. Verify stays **local** (`pnpm verify` / `/opsx-verify`) — no GitHub Actions verify workflow.

**Not breaking** for product HTTP routes (`/examples`, `/health`, `/uploads`). CORS env may accept multiple origins (document the new shape).

## Capabilities

### New Capabilities

- `activity-logs`: Timescale store, capture pipeline, list/detail API, support SPA viewer, 401 screen, retention/compression
- `audit-logs`: Prisma `audit_logs` + transactional write helper
- `rate-limit-ux`: generic API 429 envelope and product-app RateLimitGate
- `spa-hosting`: catch-all 404 pages and Vercel SPA rewrites for `app` and `support`

### Modified Capabilities

- (none — `openspec/specs/` is empty)

## Impact

**kit.repos in scope:** `api` (`./backend`), `web` (`./app`), new `support` (`./support`), `plans` (OpenSpec + root README/compose).

**Non-goals / excluded:** Product auth, sessions, TOTP, waitlist, notifications inbox, Stripe, orgs, Postman, `/opsx-release`, Vid-U Express `src/routes/` layout, dedicated audit-log UI, email filter on activity logs (no User table), GitHub Actions verify workflow.

**Must not break:** `GET/POST /examples`, `GET /examples/:id`, `POST /uploads/presign`, `GET /health` (+ `/health/db`), existing admin tools mount policy, OpenAPI generate/check for current example routes.

- `backend`: env, Docker Timescale, activity-log lib/queue/worker, retention/compression, admin activity-log module, Prisma migration, CORS, OpenAPI, tests
- `app`: RateLimitGate + axios 429; 404 page; `vercel.json`; `optimistic-ui` skill
- `support`: new package; activity-logs page; 401 screen; 404 page; `vercel.json`; same admin Basic Auth via API
- Root: `docker-compose.yml`, README, `openspec/config.yaml`
