## Why

Bookers only see a single hard-coded GCash channel, and portal players cannot choose to spend wallet credits. Ops need multiple cash channels (GCash, Maya, bank, etc.) with QR + account details, and players booking in the portal need an explicit **Pay with credits** option that supports partial wallet + cash remainder.

## What Changes

- **Multiple payment methods:** Admin Settings → Payment Method becomes a list: add/edit/remove methods (bank/channel label, account name, account number, QR image upload).
- **Pay-step carousel:** Booking modal pay UI shows Previous / Next to cycle methods; QR, bank/method label, name, and number update together.
- **Portal Pay with credits:** On player-portal bookings only — explicit GCash/cash vs **Pay with credits** (not auto-apply). Partial: apply `min(balance, total)` from wallet; remainder via the selected cash method + receipt.
- **Marketing bookings:** Cash methods carousel only (no credits toggle). Default first payment method replaces today’s single `PAYMENT` / store `payment` object.
- Migrate existing single `payment` settings into the first list entry.

## Capabilities

### New Capabilities

- `facility-payment-methods`: Admin-managed list of payment methods (label, name, number, QR) + booking pay carousel
- `portal-booking-credits-pay`: Explicit portal-only Pay with credits with partial wallet + cash remainder

### Modified Capabilities

- _(none from `openspec/specs/` — additive)_

## Impact

- **Repos in scope:** `web` (facility settings store, Admin Settings payment tab, BookingModal pay step, portal `openBookingModal` options), `plans`
- **Out of scope:** `api` payment-methods CRUD (keep client `facilitySettingsStore` like prices/Open Play slots for v1); `support`; changing wallet debit-on-approve semantics; Food pay modes
- **Must not break:** Create booking + receipt upload; wallet apply API field; walk-in admin modal; existing GCash default as first method after migrate
