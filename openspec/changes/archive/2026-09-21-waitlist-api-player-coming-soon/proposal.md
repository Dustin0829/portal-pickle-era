## Why

Pre-signups and newsletter emails only live in each browser’s localStorage, so leads never reach a shared database and staff cannot review them across devices. We need one product API (`backend/`) that serves every surface — marketing, waitlist capture, facility admin, and (when unlocked) the player portal — starting with waitlist now. Member login should be open again, but the player portal is not ready: students who sign in see Coming soon while admins keep using `/admin`.

## What Changes

- Establish **one shared product API** (`./backend`) as the backend for marketing, waitlist, admin portal, and player portal clients (same origin/`VITE_API_URL`; no second BaaS or portal-only API).
- Add a **Postgres-backed waitlist** on that API: public `POST /waitlist` and Basic Auth `GET /admin/waitlist` (same admin-tool pattern as activity-logs).
- Wire **marketing waitlist UIs** (Join the club + homepage newsletter) to `POST /waitlist` (API as source of truth for new captures).
- Expose **admin waitlist list** on the same product API (`GET /admin/waitlist`, Basic Auth when configured). Admin Waitlist page **attempts** that list (works in local/pass-through); when production Basic Auth blocks the SPA, show ops guidance (Swagger/curl/DB) — do **not** embed Basic Auth secrets in the public Vite bundle.
- **Restore** the full stub login form on `/login` (remove member coming-soon page and staff-login disclosure).
- Gate **student** `/app/*` behind a branded **Coming soon** shell (Join the club CTA, home / log out). Overview, bookings, calendar, and profile are not usable yet.
- Keep **facility admin** `/admin/*` open.
- Document deploy: **Railway-only** for the monorepo — Postgres + API (`backend/` root) + web SPA (`app/` root). No Vercel required. Env: `DATABASE_URL`, `VITE_API_URL`, `API_CORS_ORIGIN`, `ADMIN_BASIC_AUTH_*`.

## Capabilities

### New Capabilities

- `waitlist-api`: Public capture + admin list for pre-signup / newsletter leads in Postgres on the shared product API; marketing posts to the API; admin list endpoint for ops (+ SPA when pass-through allows)

### Modified Capabilities

- `portal-access`: Signed-in students reaching `/app` see a Coming soon shell instead of the full student portal; admin portal access unchanged; login form usable again for stub sessions

## Impact

**kit.repos in scope:** `api` (`./backend`), `web` (`./app`), `plans` (this OpenSpec change).

**Non-goals / excluded:**
- `support` — operator SPA unchanged (separate product surface)
- Real server auth / sessions (localStorage stub login remains); session-authenticated admin waitlist list (follow-up after real auth)
- Booking, catalog, settings, or other player-portal domain APIs (same API host later; not this change)
- Opening full player portal features (Coming soon gate stays until a follow-up)
- Separate portal repository
- Supabase (use Railway Postgres via `DATABASE_URL` instead)
- Resend / transactional email (follow-up)
- Vercel (optional; not part of this deploy plan)
- Splitting the monorepo into separate git repos

**Must not break:** marketing home CTAs (Join the club), admin portal route gates, existing `/examples` / `/health` / `/uploads`, admin Basic Auth mount policy for activity-logs and docs.
