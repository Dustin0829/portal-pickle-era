## Why

Bookings and player accounts still live in browser `localStorage`. We need the full product **API surface** (auth + bookings for marketing, admin, and player portal) so a later web change is mostly wiring—no more missing endpoints.

## What Changes

- **Auth:** Postgres `User` + session; `POST /auth/signup`, `POST /auth/login`, `POST /auth/logout`, `GET /auth/me`, optional `PATCH /auth/me` (name). Roles `student` | `admin`. HttpOnly session cookie.
- **Bookings:** Prisma `Booking` matching current client shape (plan, date, court, slotIds, guest fields, status, reference, optional receipt metadata).
- **Public:** `POST /bookings` (pending; opening-date floor **2026-10-05** for court; conflict rules); soft-upsert Players with `source: booking`.
- **Calendar occupancy:** `GET /bookings/occupancy?date=` — pending/approved rows for day grid (no PII required beyond what’s needed for blocks; return court/slots/status/id enough for UI).
- **Player portal:** `GET /me/bookings` (session) — bookings for the logged-in user’s email (and `userId` when set).
- **Admin (Basic Auth mount):** `GET/POST /admin/bookings`, `PATCH /admin/bookings/:id`; `GET /admin/users?role=student` for dashboard player counts.
- OpenAPI + tests; regenerate `contracts/openapi.json`.

## Capabilities

### New Capabilities

- `auth-api`: Signup/login/logout/me session auth for student (and admin role field for future session admin)
- `booking-api`: Server-backed bookings — public create, occupancy, player “my bookings”, admin list/create/status, conflicts, opening-date floor

### Modified Capabilities

- (none)

## Impact

**kit.repos in scope:** `api` (`./backend`), `plans` (this OpenSpec change).

**Non-goals / excluded:**
- `web` (`./app`) — **no SPA wiring** this change (localStorage stubs remain until a follow-up apply)
- `support` — unchanged
- Receipt binary upload (R2) — optional `receiptKey` fields only; existing `POST /uploads/presign` unchanged
- GCash verification / email / password-reset email tokens
- Unlocking `PlayerComingSoon` shell / removing Coming soon UI
- Facility settings API (prices/GCash remain client Zustand)
- Better Auth / Supabase Auth migration (cookie sessions are MVP; swappable later)

**Must not break:** `POST /waitlist`, `GET /admin/waitlist`, uploads/presign, examples/health, admin Basic Auth mount behavior.
