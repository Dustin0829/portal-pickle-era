## Why

Admin (and player) booking detail sheets show a single **Amount** equal to the full booking total, so split pay—wallet credits plus GCash/other—looks like the player paid the full price online. Schedule also shows a start time plus duration (`6:00 AM · 1 hour`) instead of the actual slot window (`6:00 AM – 7:00 AM`), which is harder to verify at a glance.

## What Changes

- Map `walletAppliedCents` through the web booking UI model so detail views can compute cash remaining.
- On booking detail **Payment information**, when credits were applied: show **Total**, **Wallet credits**, and **Other payment** (cash/GCash remainder); when no credits, keep a single amount row.
- Format booking **Schedule** as a start–end time range (last slot end = last hour + 1), without appending `· N hour(s)` on the same line.
- Apply the same schedule helper on admin list rows and player booking detail for consistency.
- Tests covering split vs full-cash display and single-/multi-hour ranges.

## Capabilities

### New Capabilities

- `booking-detail-payment-split`: Booking detail payment section shows total vs wallet vs remaining cash when `walletAppliedCents > 0`.
- `booking-schedule-time-range`: Booking schedule labels use inclusive start–exclusive end hour formatting (e.g. `6:00 AM – 7:00 AM`).

### Modified Capabilities

- (none — no existing main-spec requirement deltas; these are new UI capabilities)

## Impact

- **In scope:** `web` (`app/`), `plans` (this OpenSpec change)
- **Out of scope / non-goals:** `api` (DTO already exposes `walletAppliedCents`), `support`; changing hardcoded “GCash” channel labeling beyond showing remaining cash; phone field; receipt UX; wallet ledger behavior
- **Must not break:** Walk-in and cash-only bookings (`walletAppliedCents` 0) keep a single Amount / estimated-total presentation; Open Play schedule labeling remains non-contiguous-friendly (not forced into a false court block range)
- **Code:** `mapBooking.ts`, `BookingRequest`, `AdminBookingsPage`, `BookingsPage`, shared schedule helper under `lib/booking/`, page tests
