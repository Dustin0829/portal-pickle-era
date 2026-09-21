## Context

Web portals already define the shapes to serve:

- Auth stub: [`app/src/lib/auth/auth.ts`](app/src/lib/auth/auth.ts) — users, session, student/admin roles
- Bookings stub: [`app/src/lib/booking/booking.ts`](app/src/lib/booking/booking.ts) — CRUD + occupancy helpers
- Player pages: overview / bookings / calendar / profile (gated by Coming soon today)
- Admin: bookings inbox, calendar walk-in, dashboard student counts
- Existing API pattern: waitlist module + admin Basic Auth mount

Platform guidance allows shipping cookie sessions now; Better Auth / Supabase Auth can replace later.

**Rule / skill indexes (in scope):**
- api: `backend/.cursor/skills/SKILL.md` — module-boundaries, http-api, response-contracts, platform-patterns, database, concurrency, zod/OpenAPI, node-testing

## Goals / Non-Goals

**Goals:**
- Auth module: User + Session, signup/login/logout/me/patch me
- Bookings module: public create, occupancy, `/me/bookings`, admin list/create/patch, admin list students
- Conflict + opening-date rules; soft Players upsert
- Tests + OpenAPI

**Non-Goals:**
- Wiring `./app` (CORS credentials + cookie domain docs only if needed for local)
- Receipt object storage
- Password-reset emails
- Removing Coming soon UI
- Facility settings API

## Decisions

### 1. Two modules: `auth` + `bookings`

- **Choice:** `backend/src/modules/auth/`, `backend/src/modules/bookings/`.
- **Why:** Clear boundaries; controllers stay thin per platform rules.
- **Alternatives:** Monolithic users module — reject.

### 2. Cookie sessions (MVP)

- **Choice:** Prisma `Session` (token hash, userId, expiresAt); opaque cookie `pe_session`; bcrypt password hashes.
- **Why:** Revocable, no JWT secret sprawl; matches “prepare for Better Auth later.”
- **Alternatives:** JWT-only — harder revoke; Better Auth now — heavier for this change.

### 3. Admin booking routes stay Basic Auth

- **Choice:** `/admin/bookings` and `/admin/users` use existing `protectAdminTools` / Basic Auth mount (same as waitlist).
- **Why:** SPA still can’t hold Basic Auth secrets; ops via Swagger/curl until session-admin lands. Student portal uses cookie sessions.
- **Alternatives:** Session `role=admin` for admin APIs this change — nice later; keep Basic Auth for parity with waitlist.

### 4. Player bookings by userId + email

- **Choice:** `Booking.userId` optional FK; `GET /me/bookings` filters `userId = me OR email = me.email`.
- **Why:** Guest public bookings by email still appear after signup/login with same email.
- **Alternatives:** userId-only — orphans guest history.

### 5. Occupancy endpoint is public (or lightly rate-limited)

- **Choice:** `GET /bookings/occupancy?date=` without auth; DTO omits name/email/reference/receipt.
- **Why:** Student + admin calendars need day blocks; PII unnecessary.
- **Alternatives:** Auth-only — blocks marketing calendar later.

### 6. Court / slot validation unchanged from prior design

- Zod court enum `in-1`…`out-3`; `slotIds` string array; transaction + `hasSome` conflict on pending/approved.

### 7. CORS credentials

- **Choice:** Document that web follow-up needs `credentials: true` + `API_CORS_ORIGIN` exact origin (already typical for cookie auth).
- **Why:** Session cookies won’t stick cross-origin otherwise.
- **Alternatives:** Token in localStorage — weaker; avoid.

### 8. Seed admin user optional

- **Choice:** Env `ADMIN_SEED_EMAIL` / `ADMIN_SEED_PASSWORD` (optional) create/update admin user on boot or via script — or document manual SQL. Prefer one-shot seed in docs, not required for verify.
- **Why:** Dashboard/admin session later; Basic Auth still works for admin booking APIs now.

## Risks / Trade-offs

- **[Risk] Dual admin auth (Basic vs session)** → Mitigation: document; session-admin is follow-up.
- **[Risk] Cookie CORS local/prod** → Mitigation: note in environment.md; verify with curl Set-Cookie.
- **[Risk] Email-match my bookings after guest book** → Mitigation: intentional; document privacy (same email = same inbox).
- **[Risk] Web still on localStorage until wire-up** → Mitigation: API-complete first per product ask.

## Migration Plan

1. Migrate User, Session, Booking.
2. Ship auth + booking routes + OpenAPI.
3. Deploy API; follow-up change wires `./app` and can lift Coming soon.

## Open Questions

- None blocking (password reset deferred).
