## 1. plans

- [x] 1.1 Add `support` to `openspec/config.yaml` `kit.repos` (path `./support`, same verify/format/skills as `web`) and verify `openspec status --change activity-logs-support` still resolves
- [x] 1.2 Add Timescale service to root `docker-compose.yml` (image `timescale/timescaledb:2.17.2-pg16`, host `5433`, db `backend_logs`) and pass `LOGS_DATABASE_URL` plus comma-separated `API_CORS_ORIGIN` (`http://localhost:5173,http://localhost:5174`) into server and worker; mirror in `backend/docker-compose.yml`; verify `docker compose config` lists timescale
- [x] 1.3 Update root `README.md` and `backend/docs/environment.md` / `docker.md` for Timescale (including 7-day compress / 30-day retain), `LOGS_DATABASE_URL`, support `:5174`, CORS list, activity-log admin URLs; verify docs mention fail-open when logs URL unset and that verify is local (`pnpm verify` / `/opsx-verify`), not GitHub Actions
- [x] 1.4 Use branch prefix `feat/activity-logs-support` for the monorepo PR

## 2. api (`./backend`)

Rules/skills: `.cursor/skills/SKILL.md`, `add-feature-module`, `prisma-client-api`, `core/module-boundaries.mdc`, `api/http-api.mdc`, `api/response-contracts.mdc`, `platform/platform-patterns.mdc`, `async/async-reliability.mdc`, `data/database.mdc`, `ops/observability.mdc`, `ops/security-secrets.mdc`, `testing/node-testing.mdc`

- [x] 2.1 Add `LOGS_DATABASE_URL` (optional URL) and comma-separated `API_CORS_ORIGIN` parsing in `src/app/env.ts`; apply CORS for each origin and allow `Authorization`; add tests; verify env tests pass for one and many origins
- [x] 2.2 Add `ServiceUnavailableError` (503) in `src/lib/errors.ts` and map it in `errorHandler`; verify a unit test or handler test returns 503 + `code`
- [x] 2.3 Implement `src/lib/activity-logs/` (schema SQL, pool, redact, sample skips per spec, buffer, flush, query list/detail, types including `ACTIVITY_LOGS_UNAVAILABLE`); boot schema when URL set including hypertable, 7-day compression, 30-day retention (`if_not_exists`, warn on policy failure); verify unit tests for redact, sample skips, 7-day range validation, and that policy failure does not throw
- [x] 2.4 Add BullMQ `activity-logs` queue + worker job (`async-reliability.mdc`); HTTP capture middleware and example-job wrap; skip listed paths; fail-open; verify tests that capture is skipped for `/health` and that flush errors do not throw to the request
- [x] 2.5 Scaffold `src/modules/activity-logs/` via `pnpm make:module` (or equivalent) — `GET /admin/activity-logs` and `GET /admin/activity-logs/:id`, Zod query/params, list omits bodies, detail includes bodies, `protectAdminTools` + `shouldMountAdminTools`; OpenAPI regen; verify 422 range, 503 store down, 404 missing id, 401 when basic auth configured
- [x] 2.6 Prisma `AuditLog` / `audit_logs` migration + `writeAuditLog` helper; `POST /examples` create in `$transaction` with `example.created`; enqueue the existing examples job only after commit; verify create success writes one audit row and failed transaction writes none (`prisma-client-api`, `database.mdc`, `async-reliability.mdc`)
- [x] 2.7 Custom rate-limit `handler` returning `{ success: false, message }` 429; skip `GET /health`, `GET /health/db`, and `GET /admin/activity-logs*`; verify those skips plus a 429 body test on `/examples`
- [x] 2.8 `pnpm format` on touched files, then `pnpm format:check && pnpm lint && pnpm typecheck` (`verify_fast`)

## 3. web (`./app`)

Rules/skills: `.cursor/skills/SKILL.md`, `api/api-layer.mdc`, `state/error-handling.mdc`, `pages/page-layout.mdc`, `ai-slop-check`, `shadcn`

- [x] 3.1 Axios interceptor: generic 429 → `useRateLimitedStore.markBlocked()`; empty product-quota skip-list helper; verify unit tests for skip vs trip
- [x] 3.2 Add `RateLimitGate` + recovery UI wrapping providers; retry clears block and invalidates queries; verify component/store tests
- [x] 3.3 Add a catch-all 404 page (`pages/page-layout.mdc`, `copy/ui-microcopy.mdc`) and `vercel.json` SPA rewrite to `index.html`; verify unknown paths render 404 and `vercel.json` rewrites `/(.*)` to `/index.html`
- [x] 3.4 Add generic `.cursor/skills/optimistic-ui/SKILL.md` (TanStack Query snapshot/patch/restore; no brand/payout/campaign examples) and link it from `.cursor/skills/SKILL.md`
- [x] 3.5 `pnpm format` on touched files, then `pnpm format:check && pnpm lint && pnpm exec tsc -b --noEmit`

## 4. support (`./support`)

Same frontend rules/skills as web after clone.

- [x] 4.1 Copy `app/` → `support/` excluding `node_modules` and dist (package name `support`, Vite port 5174, `VITE_API_URL`); remove examples demo as the home route; strip RateLimitGate if copied; verify `pnpm install` and `pnpm exec tsc -b --noEmit` succeed
- [x] 4.2 Implement activity-logs API client + queries (`api-layer.mdc`, `zod-validation.mdc`): list/detail types matching backend; Basic Auth header when Vite admin env vars set
- [x] 4.3 Activity logs page: filters, 24h default range, 7-day max, table, pagination, detail modal, auto-refresh, 503 `ACTIVITY_LOGS_UNAVAILABLE` state (Vid-U admin UX, starter tokens); verify tests for unavailable vs empty list
- [x] 4.4 Dedicated 401 page when list/detail returns 401 (basic auth configured); retry action; verify a test that 401 shows this page not a crash
- [x] 4.5 Keep or add catch-all 404 and `vercel.json` SPA rewrite (same as `app`); verify unknown support paths render 404
- [x] 4.6 Copy/adapt `optimistic-ui` skill into `support/.cursor/skills/` and skills index
- [x] 4.7 `pnpm format` on touched files, then `pnpm format:check && pnpm lint && pnpm exec tsc -b --noEmit`

## 5. Ship

- [x] 5.1 `/opsx-verify` — full `pnpm verify` + `@merge-readiness-check` in `backend`, `app`, and `support`
- [x] 5.2 `/opsx-pr` — one monorepo PR from `feat/activity-logs-support`
