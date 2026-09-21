## Context

Marketing Join the club and newsletter forms write to `localStorage` (`app/src/lib/waitlist/waitlistStorage.ts`). Admin Waitlist reads the same store. There is no Prisma waitlist model. Login currently shows a member Coming soon page with a staff-login disclosure. Student `/app/*` would otherwise show the full stub portal.

The monorepo already has one product API (`backend/`: Express + Prisma + Postgres) and one product app (`app/` with Axios `VITE_API_URL`). This change makes that API the shared backend for marketing, waitlist, admin waitlist, and (later) player portal domain features — shipping waitlist + UX gates now.

**Rule / skill indexes (in scope):**
- api: `backend/.cursor/skills/SKILL.md` — module boundaries, http-api, response-contracts, database, api-protection, activity-logs peer, add-feature-module, prisma-cli / prisma-client-api, merge-readiness-check
- web: `app/.cursor/skills/SKILL.md` — api-layer, zod-validation, frontend-feature-boundaries, route-protection, page-layout / page-composition, forms, marketing-copy / ui-microcopy, merge-readiness-check

## Goals / Non-Goals

**Goals:**
- One product API host for waitlist capture (marketing) and waitlist list (admin)
- Postgres persistence with upsert-by-email
- Restore stub login; gate student portal with Coming soon
- Keep admin portal open; AdminWaitlistPage requests API list (ops fallback when Basic Auth blocks SPA)

**Non-Goals:**
- Real auth sessions / JWT
- Booking, catalog, settings APIs
- Removing Coming soon for players
- Changing `support/`
- Dual-write to localStorage as required behavior (may leave helpers for offline demos only if needed during migration; API is source of truth)
- Supabase / Resend
- Vercel (Railway hosts web + API + DB)

## Decisions

### 1. Single shared product API (not a waitlist-only service)

- **Choice:** Extend `backend/` with a `waitlist` module; all app surfaces use existing `app/src/api` + `VITE_API_URL`.
- **Why:** User requirement that the API serves marketing, waitlist, admin, and player; avoids a second backend.
- **Alternatives:** Separate form SaaS / edge function — rejected (splits ops and data).

### 2. Waitlist module shape

- **Choice:** `pnpm make:module` / mirror `examples` + admin list pattern from `activity-logs` (`POST` public on `/waitlist`, `GET` under `/admin/waitlist` with `protectAdminTools`).
- **Why:** Matches existing OpenAPI, Zod, mapper, and Basic Auth mount policy.
- **Alternatives:** Nest under `/examples` — rejected (wrong domain).

### 3. Data model

- **Choice:** Prisma `WaitlistEntry`: `id`, `name` (default `""`), `email` (unique, normalized lowercase), `phone?`, `source` (`join_club` | `newsletter`), `createdAt`, `updatedAt`.
- **Why:** Matches JoinClubModal + newsletter fields; unique email for upsert.
- **List defaults:** page/limit pagination aligned with activity-logs / examples list patterns (stable `createdAt` desc).

### 4. Admin UI auth vs API Basic Auth

- **Choice:**
  - `POST /waitlist` — public (marketing).
  - `GET /admin/waitlist` — mount + `protectAdminTools` like activity-logs (Basic Auth when `ADMIN_BASIC_AUTH_*` set; unmounted in production if those env vars are missing).
  - **AdminWaitlistPage** calls `GET /admin/waitlist` with the shared API client and **no** Basic Auth headers in the Vite bundle.
  - **Local / non-prod** (or prod without Basic Auth configured — tools unmounted): pass-through or 404; page shows API rows when the request succeeds.
  - **Prod with Basic Auth:** SPA receives 401/404 → show clear ops empty/error (use `/docs`, curl, or TablePlus). Portal stub session still gates who sees that page UI.
- **Why:** One shared API for admin list ops without shipping waitlist PII credentials in the public marketing+portal SPA.
- **Alternatives considered:** `VITE_ADMIN_BASIC_AUTH_*` in the browser — rejected (extractable from the bundle). Session-authenticated admin list — deferred until real auth (Phase 2).

### 5. Student Coming soon gate

- **Choice:** Gate inside `StudentPortalLayout` (after `ProtectedRoute`) so all `/app/*` children show one Coming soon shell; do not leave deep links to stub pages.
- **Why:** Single choke point; matches portal-access delta.

### 6. Login restore

- **Choice:** Restore full form in `LoginPage.tsx`; remove staff disclosure / member coming-soon; navbar Log in unchanged.

### 7. Hosting — Railway only (same monorepo)

- **Choice:** **No Vercel required.** Keep the **single git monorepo** and deploy **three Railway resources** from it:
  1. **Postgres** plugin
  2. **API** service — Root Directory `backend` (build/start `backend/package.json`, Prisma migrate)
  3. **Web** service — Root Directory `app` (Vite build → static/`serve` with SPA fallback for client routes)
- **Why:** One vendor for DB + API + SPA; monorepo works via per-service root directories; simpler ops than Vercel + Railway.
- **Alternatives:** Vercel for SPA only — optional, not planned. Supabase Postgres — optional via same `DATABASE_URL`. Separate git repos — rejected.
- **Out of this change:** Resend email; actually provisioning Railway in-app (docs/tasks only unless apply adds `railway.toml` / SPA static config).
- **Wire-up:** API `DATABASE_URL` → Railway Postgres; web `VITE_API_URL` → public API service URL (build-time); API `API_CORS_ORIGIN` → public web service origin(s).

### 8. Deploy order

1. Provision Railway Postgres + `backend` service; set `DATABASE_URL`, migrate, deploy API with CORS for the web service origin.
2. Provision Railway `app` static/web service; set `VITE_API_URL` to the API URL; deploy SPA with client-route fallback.
3. Rollback: redeploy previous web service first; keep Railway DB table (forward-only migration).

## Risks / Trade-offs

- **[Risk] Prod SPA admin list blocked by Basic Auth** → Mitigate: ops copy on 401/404; Swagger/curl/DB for lead review until session-authenticated admin list ships with real auth.
- **[Risk] API down → Join the club fails** → Mitigate: clear form error / toast; no silent localStorage success that diverges from DB.
- **[Risk] Duplicate UX: login open but portal Coming soon** → Mitigate: clear copy on Coming soon; Join the club still available.
- **[Risk] CORS misconfig** → Mitigate: set `API_CORS_ORIGIN` for marketing host(s); verify POST from prod origin.
- **[Risk] Demo fixtures in localStorage confuse admins** → Mitigate: AdminWaitlistPage must not present localStorage fixtures as the primary list once API wiring lands.

## Migration Plan

1. Add Prisma model + migration; generate client.
2. Implement waitlist module + OpenAPI regen + tests.
3. App feature `api/features/waitlist`; wire JoinClubModal, Waitlist.tsx, AdminWaitlistPage (API attempt + ops error states).
4. Restore LoginPage; Coming soon in StudentPortalLayout.
5. Env docs (all Railway): API `DATABASE_URL`, `ADMIN_BASIC_AUTH_*`, `API_CORS_ORIGIN`; web `VITE_API_URL`.
6. Rollback: redeploy previous web service; leave empty waitlist table on Railway harmless.

## Open Questions

None blocking.
