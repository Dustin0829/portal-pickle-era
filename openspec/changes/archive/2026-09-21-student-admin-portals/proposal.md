## Why

The marketing site already sells court booking, waitlist signup, and member login, but there is no student or facility-admin surface to view bookings, review pending GCash payments, or manage waitlist leads. We need portal UI shells now (stub/fixture data) so product UX can land before backend APIs.

## What Changes

- Add a **student portal** under `/app/*`: overview, my bookings, **court calendar**, and profile — gated by the existing localStorage auth stub session.
- Add a **facility admin portal** under `/admin/*` (product admin, not `support/` activity-logs): bookings inbox (approve/reject pending), court day calendar, waitlist list, and light settings (prices / slots / GCash display fields) — stub data and local status updates only.
- Wire `ProtectedRoute` (and a stub admin role/gate) so unauthenticated users cannot see portal pages; non-admins cannot see `/admin/*`.
- Keep marketing `/` and public auth pages; portals consume existing booking/waitlist localStorage shapes where useful, plus fixtures when empty.
- **No** `backend` APIs, real email, file upload storage, or payment processor in this change.

## Capabilities

### New Capabilities

- `student-portal`: Authenticated student app shell and MVP pages (overview, bookings, court calendar, profile) on stub data
- `facility-admin-portal`: Facility staff admin shell and MVP ops pages (bookings inbox, calendar, waitlist, settings) on stub data
- `portal-access`: Client-only route gates for student vs admin portal entry using the auth stub

### Modified Capabilities

- (none — main `openspec/specs/` remains empty; marketing/auth-stub/booking-stub behaviors stay as shipped)

## Impact

**kit.repos in scope:** `web` (`./app`), `plans` (this OpenSpec change).

**Non-goals / excluded:**
- `api` (`./backend`) — no real auth, bookings, waitlist, or admin APIs
- `support` — activity-logs operator SPA unchanged; facility admin is separate
- Real email confirmation, receipt file storage/preview, or GCash QR validation
- CMS for marketing brand copy (hero/vibe/pillars)
- Expanding waitlist marketing form fields (admin may still show name/phone columns)

**Must not break:** marketing home, public auth routes, booking modal + waitlist stubs, 404 + SPA rewrite, AppProviders / RateLimitGate / `api/client.ts`.
