## Context

See `proposal.md` for motivation. Today: one Postgres, in-memory `express-rate-limit` with default JSON, no Timescale, no `AuditLog`, product `app` on `:5173` with a stub `ProtectedRoute` and no 429 gate. Admin tools already use `protectAdminTools` (`backend/src/middleware/adminBasicAuth.ts`). Golden module: `backend/src/modules/examples/`. Vid-U reference (behavior only, not layout): Timescale `activity_log`, capture → buffer → BullMQ → worker, `GET /admin/activity-logs` + `/:id`, admin SPA page under `vid-u-admin/src/pages/activity-logs/`.

**Rules / skills (cite, do not paste):**

- api: `.cursor/skills/SKILL.md`, `add-feature-module`, `add-external-integration` (Timescale is infra, not a vendor SDK), `prisma-client-api`, `merge-readiness-check`
- api rules: `core/module-boundaries.mdc`, `api/http-api.mdc`, `api/response-contracts.mdc`, `api/api-evolution.mdc`, `platform/platform-patterns.mdc` (audit vs access logs), `async/async-reliability.mdc`, `async/worker-scaling.mdc`, `ops/observability.mdc`, `ops/security-secrets.mdc`, `testing/node-testing.mdc`, `data/database.mdc`
- web + support: `.cursor/skills/SKILL.md`, `shadcn`, `ai-slop-check`, `merge-readiness-check`; rules `api/api-layer.mdc`, `api/zod-validation.mdc`, `state/error-handling.mdc`, `pages/page-layout.mdc`, `security/route-protection.mdc` (support is operator tools, not product auth)

Keep Express `src/modules/` layout. Do not copy Vid-U `src/routes/` / controllers tree.

## Goals / Non-Goals

**Goals:**

- Two stores: Timescale activity (ops) vs Prisma audit (business)
- List = metadata page; detail = one record with bodies (this is “admin list/detail”)
- Support SPA cloned from `app`, port 5174, activity-logs UX aligned with Vid-U admin
- Product RateLimitGate on generic 429 only
- Cursor `optimistic-ui` recipe without Vid-U domain examples
- Support 401 page; Timescale 7-day compress / 30-day retain
- 404 + `vercel.json` on `app` and `support`
- Local verify only (no GitHub Actions verify workflow)

**Non-Goals:** Product auth; email→userId lookup; Timescale in hosted production (local Docker is the template default; `LOGS_DATABASE_URL` remains optional); audit UI; Redis-backed rate-limit store; `/opsx-release`; Postman; CI-as-source-of-truth.

## Decisions

### 1. List/detail APIs (what “admin list/detail” means)

| Endpoint | Body | Use |
| -------- | ---- | --- |
| `GET /admin/activity-logs` | Metadata only (`ActivityLogListItem`) | Table |
| `GET /admin/activity-logs/:id` | Full record including request/response/payload | Detail modal |

Same `protectAdminTools` as `/docs` and `/admin/queues`. Mount with `shouldMountAdminTools()` so production without basic-auth credentials does not expose logs.

**Alternative:** Put viewer HTML on the API process (Bull Board style). Rejected — user asked for a `support/` app from the `app` template.

### 2. Timescale in local Docker

Image `timescale/timescaledb:2.17.2-pg16`, host port **5433**, db `backend_logs`, env `LOGS_DATABASE_URL`. On API/worker boot when URL is set: `CREATE TABLE IF NOT EXISTS activity_log` (Vid-U columns + PK `(id, timestamp)`), indexes, `create_hypertable(..., 'timestamp', if_not_exists => TRUE)`. Use `pg` Pool, not Prisma, for this database.

**Alternative:** Same Postgres as product. Rejected — user asked for a Timescale service.

Fail-open: unset URL → skip capture; query APIs → `503 ACTIVITY_LOGS_UNAVAILABLE`. Add `ServiceUnavailableError` (503) next to existing `AppError` subclasses. After hypertable: enable compression (`compress_orderby timestamp DESC`), `add_compression_policy(..., INTERVAL '7 days')`, `add_retention_policy(..., INTERVAL '30 days')` with `if_not_exists`. Warn and continue if policy SQL fails (same as Vid-U writer).

### 3. Capture pipeline

Middleware after request logging: sample → redact → in-memory buffer → flush every ~2s / 200 rows onto BullMQ `activity-logs` when `REDIS_URL` is set. Worker inserts batch. If Redis is unset, best-effort direct insert (template still ships Redis in root compose). Skip: OPTIONS, `/health`, `/health/db`, `/docs`, `/openapi.json`, `/admin/queues`, `/admin/activity-logs`. Wrap example job completion/failure for `kind: job`.

Do not log support-app polling as a flood: sampling already skips the activity-log routes; optional skip of `X-Support-Poll` later is out of scope.

`userId` / `role` columns stay nullable (no product auth). Query `user_id` remains for forward compatibility. **No `email` filter.**

### 4. Support package

Copy `app/` → `support/` (package name `support`, Vite port **5174**). Strip the examples demo from the home route; default route is activity logs. Reuse `api/client.ts` pattern; send `Authorization: Basic` when `VITE_ADMIN_BASIC_AUTH_USER` / `PASSWORD` are set (dev compose leaves them unset → open, matching API). CORS: parse `API_CORS_ORIGIN` as comma-separated origins; Docker default `http://localhost:5173,http://localhost:5174`. Allow header `Authorization` (support Basic Auth). Keep `credentials: true` with explicit origins (never `*`).

Copy `app/` → `support/` **excluding** `node_modules` and build output. If RateLimitGate already exists on `app`, do **not** keep it as a support requirement — strip the gate from `support` after clone so product 429 UX stays on `app` only.

UI: port Vid-U `ActivityLogsPage` structure (filters, table, pagination, detail modal, auto-refresh, 503 empty state) onto starter tokens/shadcn — not Vid-U brand colors. Axios 401 (when basic auth is configured) → dedicated unauthorized page with retry (clear/retry request; do not invent product login). Catch-all `*` 404 in both SPAs; `vercel.json` SPA rewrite (`source: /(.*)` → `/index.html`) in `app/` and `support/`.

Register `kit.repos` id `support` path `./support` with the same verify/format/skills as `web`.

### 5. Prisma `audit_logs`

Model `AuditLog` / table `audit_logs`: `id` uuid, `actorId` String?, `action` String, `resource` String, `metadata` Json, `createdAt`. Helper `writeAuditLog(tx, { actorId, action, resource, metadata })`. `POST /examples` create uses `prisma.$transaction` to insert example + `example.created`. Enqueue the existing examples BullMQ job **after** that transaction commits (`async-reliability.mdc`). Distinct from Timescale.

### 6. RateLimitGate (product `app` only)

Custom `handler` on existing `rateLimit()` to error JSON (`success: false`, generic message). `skip` health and activity-log GETs. Axios interceptor in `app` calls `markBlocked()` on 429 when `code` is not in an empty skip-list. Provider wraps the product tree. Support app is not required to implement the gate.

### 7. optimistic-ui skill

Add `app/.cursor/skills/optimistic-ui/SKILL.md` and the same file under `support/.cursor/skills/` after clone. Recipe: TanStack Query snapshot / patch / restore / invalidate. Golden path: examples list after create is **not** optimistic (needs server id). Use a tiny in-repo comment example (toggle or mark-read style) or the recipe alone — **no** brand/payout/campaign names. Link from both `SKILL.md` indexes.

### 8. Local verify, not GitHub Actions

Ship checks are `/opsx-verify` (`pnpm verify` per package). Do **not** add `.github/workflows/verify.yml`. Adopters can add CI later.

## Risks / Trade-offs

- **[Risk] Support clone drifts from `app`** → Mitigation: copy once; document “treat support as a sibling Vite app”; share rules by copying `.cursor` with the package.
- **[Risk] Activity-log volume in local Docker** → Mitigation: 7-day query cap, 30-day retention, 7-day compression, sampling skips, truncate bodies (16KiB), buffer cap.
- **[Risk] CORS misconfig blocks support** → Mitigation: comma-separated origins in compose and `.env.example`.
- **[Risk] PII in bodies** → Mitigation: redact Authorization, cookies, password/token/otp keys; list endpoint omits bodies.
- **[Trade-off] Extra Timescale container** → Accepted for template fidelity to Vid-U ops; optional URL keeps hosted deploys simple.

## Migration Plan

1. Compose: Timescale + `LOGS_DATABASE_URL` on server and worker; restart stack.
2. Prisma migrate product `audit_logs` (backward compatible add).
3. Deploy API/worker before relying on support UI.
4. Rollback: unset `LOGS_DATABASE_URL` (fail-open); leave unused Timescale volume; Prisma migrate down only if needed.

**Deploy order:** Timescale → api+worker → support + app (RateLimitGate can ship with api 429 handler).

## Open Questions

None that change specs. Hosted Timescale is an adopter choice via `LOGS_DATABASE_URL`.
