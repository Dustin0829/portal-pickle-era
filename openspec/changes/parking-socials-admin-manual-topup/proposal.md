## Why

Marketing Space carousel shows a broken parking image (`/parking.jpg` vs `Parking.jpg` on case-sensitive hosts). Footer social links are placeholders, not Pickle Era’s real Facebook/Instagram. Admins can only credit wallets by approving player-submitted GCash top-ups—there is no way to search a player and add credits manually at the desk. Admin calendar currently opens a Day Schedule with selectable open hours and walk-in create, which duplicates the Bookings page **Walk-in booking** flow and confuses ops (double calendar/schedule UI). Walk-in create hard-codes cash-ish labels and has no desk settle UX for facility payment methods or an explicit **Paid via cash** action—walk-ins are assumed guests (no account / no wallet credits). On portal refresh, players briefly see a bare loading/login-like skeleton while `GET /auth/me` resolves, then the same portal route remounts—jarring and confusing.

## What Changes

- Fix the Space section parking image so it loads in production (path/asset alignment).
- Point marketing footer (and any duplicate social links) at the real Facebook and Instagram URLs.
- Add **admin manual top-up** from Top-ups Inbox: CTA → search player by email → show player profile summary (joined date, email, name, bookings) → **Add credits** that immediately increases wallet balance and writes a ledger entry.
- Keep existing GCash pending/approve/reject **wallet top-up** inbox flow unchanged (player receipt review).
- **Admin calendar = overview + day bookings only:** month grid still shows booking counts; tapping a day opens a sheet listing that day’s bookings (name, court, time, status, etc.). Remove open-hours / available-slot picker and walk-in create from the calendar. Manual walk-in remains on the Admin Bookings page CTA (`WalkInBookingModal`).
- **Walk-in desk pay:** Assume walk-in guests have **no account and no wallet credits**. In the Admin Bookings walk-in flow, show the facility’s configured **payment methods** (same Settings list used elsewhere) and a **Paid via cash** button to settle/create without credits UI.
- Fix **portal refresh flash**: while session status is `loading`, do **not** tear down portal chrome into a bare login-like skeleton; keep layout (or a portal-branded checking-session state) and only redirect to `/login` after confirmed `unauthenticated`. URL for the current portal page SHALL be preserved across a successful session restore.

## Capabilities

### New Capabilities

- `marketing-parking-and-socials`: Fix parking Space image asset path; set real Facebook/Instagram footer links.
- `admin-manual-wallet-credit`: Admin searches a player and credits their wallet without a GCash receipt/pending top-up row (audit via ledger).
- `admin-calendar-day-bookings-only`: Admin calendar day click shows that day’s bookings list; no available-time picker or walk-in from calendar.
- `admin-walk-in-desk-pay`: Walk-in assumes no account/credits; settle with facility payment methods or **Paid via cash**.
- `portal-session-loading`: No login-skeleton flash on authenticated portal refresh; stay on same route after session resolves.

### Modified Capabilities

- (none in main `openspec/specs/` — deltas live under this change)

## Impact

- **In scope:** `web` (`app/`), `api` (`backend/` for manual credit; walk-in pay fields only if create already needs them), `plans`
- **Out of scope / non-goals:** `support`; player self-serve top-up UX; debit/clawback; recreating walk-in on the calendar; wallet credits on walk-in; changing Open Play session definitions; replacing the pending GCash **wallet top-up** inbox; full offline auth cache product (optional light persistence only if needed for flash)
- **Assumptions:** Manual credit is **immediate**; walk-in create stays on Admin Bookings; walk-in guests have no account/credits; calendar day sheet is read-only for that date’s bookings; session flash fix is UX-only (cookie/`getMe` still source of truth)
- **Code (likely):** `Space.tsx` / `public/`; `Footer.tsx`; wallet admin APIs; Top-ups page; `CourtDayGrid.tsx` / `AdminCalendarPage.tsx`; `WalkInBookingModal.tsx` (+ payment method UI); `ProtectedRoute` / `AuthLoadingShell` / portal layouts
