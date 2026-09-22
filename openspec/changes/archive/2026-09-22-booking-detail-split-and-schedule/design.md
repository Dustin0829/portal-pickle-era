## Context

Admin booking detail (`AdminBookingsPage` `AdminBookingDetailSheet`) computes `total` via `bookingTotal(plan, hours, unitPrice)` and shows a single **Amount** row. Schedule uses `timeRange` that for one slot is only the start (`formatSlotTime`), then appends ` · ${hours} hour(s)`.

`BookingDto.walletAppliedCents` already exists on the API and client schema, but `bookingDtoToRequest` drops it and `BookingRequest` has no field—so the detail sheet cannot show split pay.

Player `BookingsPage` already has a better `bookingTimeRange` (start → last+1) but still appends ` · N hour(s)` on the detail schedule line.

Applicable rules (cite only):

- `app/.cursor/rules/core/ponytail-rules.mdc`
- `app/.cursor/rules/api/response-mapping.mdc`, `api-layer.mdc`
- `app/.cursor/rules/pages/page-layout.mdc`, `copy/ui-microcopy.mdc`
- `app/.cursor/rules/testing/vitest-testing.mdc`

## Goals / Non-Goals

**Goals:**

- Surface wallet vs other payment on booking detail when credits applied
- Show schedule as a real time window for court bookings
- One shared schedule helper; map credits through UI model

**Non-Goals:**

- API / Prisma changes
- Fixing hardcoded “GCash” as the only channel name (keep existing channel row unless remaining is 0)
- Changing checkout / BookingModal pay flow
- Admin dashboard revenue aggregations

## Decisions

### Pass `walletAppliedCents` on `BookingRequest`

Add optional/required nonnegative field (default 0) and set it in `bookingDtoToRequest`. Occupancy mapper can leave 0.

### Pure helpers for display math and schedule

- Reuse or thin-wrap `walletAppliedAndRemaining`-style math: `remainingCashCents = totalCents - walletAppliedCents` with totals from existing `bookingTotal` × 100.
- Extract `bookingTimeRange(booking)` (or slotIds + plan) into `lib/booking/` (lift from player page); admin list + detail + player detail import it. Court: sorted hours, `formatHour(start) – formatHour(last + 1)`. Open Play: keep list-of-times behavior from player page.

### Payment rows in admin detail

When `walletAppliedCents > 0`:

- Total → `₱{total}`
- Wallet credits → format cents
- Other payment → remaining pesos (always show the row; use **₱0** when credits cover the full total—do not invent a separate “paid with wallet only” mode in this change)

When 0 (or missing / undefined mapped to 0): keep single **Amount** row (current behavior). Receipt / Reference / Payment channel rows stay as today.

Player detail: when credits > 0, replace lone “Estimated total” with a small breakdown (Total / Credits / Remaining) rather than only the full total.

### Drop duration suffix on schedule line

Remove ` · ${hours} hour(s)` from Schedule InfoRow / DetailRow. Duration remains visible via the range length; Type/Court still convey plan.

## Risks / Trade-offs

- **Channel still hardcoded GCash** → Follow-up; remaining cash amount is the important fix now
- **Non-contiguous court multi-court slots** → Use union of hour starts across `courtSlots` / `slotIds` same as today for hours count; range from min start to max end
- **Open Play labels** → Preserve non-court formatting to avoid wrong “contiguous block” assumption

## Migration Plan

Web-only deploy. No migrate. Rollback = revert app.

## Open Questions

- None — channel label polish deferred; full-credit Other payment ₱0 is acceptable.
