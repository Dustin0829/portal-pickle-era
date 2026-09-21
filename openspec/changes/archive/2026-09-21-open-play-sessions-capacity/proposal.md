## Why

Open Play is still priced at ₱150 with four hardcoded 2-hour slots and treated like exclusive court holds. Operators need ₱250 sessions, three default 2-hour windows (editable in Admin Settings), shared capacity of 30 players per session with X/30 in the booking UI, and register+pay from the marketing booking modal.

## What Changes

- Default Open Play price → **₱250** / session; default catalog → **three 2-hour** example sessions (7–9 AM, 4–6 PM, 6–8 PM)
- Admin Settings: edit Open Play **sessions** (add/remove/start hour; end = start+2h) with draft + Save (client-persisted, same pattern as plan prices)
- **BREAKING** for open-play conflict semantics: open-play becomes a **shared session** (capacity 30 per date+slotId), not exclusive court|slot blocking
- Public/admin booking flows show **X/30**, disable full sessions, reject create when full
- Occupancy (or dedicated endpoint) exposes open-play session counts for UI
- Marketing BookingModal + WalkIn use saved/default open-play slots and capacity UX

## Capabilities

### New Capabilities

- `open-play-sessions`: Admin-configurable 2-hour open-play sessions, ₱250 default, shared capacity 30 with X/30 booking UX and server-side enforcement

### Modified Capabilities

- (none — no main `openspec/specs/` baseline for bookings; new capability only)

## Impact

- **In scope:** `api` (`./backend`), `web` (`./app`), `plans` (this change)
- **Out of scope:** `support`; wallet; Resend/credentials email; Food tab; server-side facility catalog API (slots stay in client `facilitySettingsStore` like prices for this change)
- Touches: `PLAN_META` / `SLOTS`, `facilitySettingsStore`, `AdminSettingsPage`, `BookingModal`, `WalkInBookingModal`, bookings service conflict + occupancy APIs, Prisma usage of open_play rows (behavior change, not necessarily schema migration)
