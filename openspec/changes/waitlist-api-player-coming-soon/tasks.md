## 1. plans

- [x] 1.1 Use branch prefix `feat/waitlist-api-player-coming-soon` for the monorepo PR
- [x] 1.2 Keep OpenSpec artifacts under `openspec/changes/waitlist-api-player-coming-soon/` in sync if scope shifts during apply
- [x] 1.3 `openspec validate` (plans verify)

## 2. api (`./backend`)

Rules/skills: `backend/.cursor/skills/SKILL.md`, `add-feature-module/SKILL.md`, `prisma-cli/SKILL.md`, `prisma-client-api/SKILL.md`, `merge-readiness-check/SKILL.md`; `core/module-boundaries.mdc`, `core/ponytail-rules.mdc`, `api/http-api.mdc`, `api/response-contracts.mdc`, `api/api-protection.mdc`, `api/search-query-guidelines.mdc`, `data/database.mdc`, `ops/security-secrets.mdc`, `ops/activity-logs.mdc` (peer pattern), `testing/node-testing.mdc`

- [x] 2.1 Add Prisma `WaitlistEntry` model (name, unique lowercased email, optional phone, source enum/string, timestamps) and migrate (`database.mdc`, `prisma-cli`)
- [x] 2.2 Scaffold `waitlist` module (routes/controller/service/schema/mapper/openapi) following `examples` + `activity-logs` admin list (`module-boundaries.mdc`, `http-api.mdc`, `response-contracts.mdc`)
- [x] 2.3 Implement public `POST /waitlist` with Zod validation, email normalize, upsert-by-email (`http-api.mdc`)
- [x] 2.4 Implement `GET /admin/waitlist` with pagination/search, mount behind `protectAdminTools` like activity-logs (`api-protection.mdc`, `search-query-guidelines.mdc`)
- [x] 2.5 Register OpenAPI + regenerate `contracts/openapi.json`; add module tests for schema/mapper/upsert behavior (`node-testing.mdc`)
- [x] 2.6 Document Railway-only API + Postgres deploy (Root Directory `backend`, `DATABASE_URL`, migrate on release, `API_CORS_ORIGIN` → web service origin, `ADMIN_BASIC_AUTH_*`); no Supabase/Vercel required (`security-secrets.mdc`)
- [x] 2.7 `pnpm format` on touched files, then `pnpm format:check && pnpm lint && pnpm typecheck` (`verify_fast`)

## 3. web (`./app`)

Rules/skills: `app/.cursor/skills/SKILL.md`, `merge-readiness-check/SKILL.md`; `core/ponytail-rules.mdc`, `core/naming-conventions.mdc`, `api/api-layer.mdc`, `api/zod-validation.mdc`, `api/frontend-feature-boundaries.mdc`, `api/api-error-routing.mdc`, `security/route-protection.mdc`, `pages/page-layout.mdc`, `pages/page-composition.mdc`, `state/error-handling.mdc`, `state/async-ui.mdc`, `forms/forms-and-drafts.mdc`, `copy/marketing-copy.mdc`, `copy/ui-microcopy.mdc`, `testing/vitest-testing.mdc`

- [x] 3.1 Add `src/api/features/waitlist/` (schemas, service, types, hooks) using shared `VITE_API_URL` client (`api-layer.mdc`, `zod-validation.mdc`)
- [x] 3.2 Wire `JoinClubModal` + homepage `Waitlist.tsx` to `POST /waitlist`; surface field/toast errors; stop treating localStorage as source of truth for new captures (`api-error-routing.mdc`, `forms-and-drafts.mdc`)
- [x] 3.3 Wire `AdminWaitlistPage` to `GET /admin/waitlist` with no Vite Basic Auth secrets; loading/empty/success + 401/404/network ops states; stop using localStorage fixtures as primary list (`error-handling.mdc`, `async-ui.mdc`)
- [x] 3.4 Restore full stub login form on `LoginPage` (remove member coming-soon + staff disclosure) (`route-protection.mdc`, `ui-microcopy.mdc`)
- [x] 3.5 Gate `StudentPortalLayout` `/app/*` with branded Coming soon shell (Join the club, home, log out); keep admin portal open (`page-layout.mdc`, `marketing-copy.mdc`)
- [x] 3.6 Document Railway web service (Root Directory `app`, SPA fallback, `VITE_API_URL` → API service URL); note CORS + SPA waitlist list vs Swagger/ops in prod
- [x] 3.7 Vitest: waitlist client/schema smoke; Coming soon when student session; login form present; admin waitlist error-state smoke if practical (`vitest-testing.mdc`)
- [x] 3.8 `pnpm format` on touched files, then `pnpm format:check && pnpm lint && pnpm exec tsc -b --noEmit` (`verify_fast`)

## 4. Ship

- [x] 4.1 `/opsx-verify` — full `pnpm verify` + merge-readiness in `backend` and `app`
- [x] 4.2 `/opsx-pr` — one monorepo PR from `feat/waitlist-api-player-coming-soon`
