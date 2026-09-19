## Why

Court rental and Open Play still use different slot models without cross-blocking, so a session like Open Play 7–9 AM can coexist with court hours 7 and 8. Wallet top-ups exist but cannot reduce what players pay when booking. The Food tab is missing because `player-food-orders` was planned only (never applied), and ops also need to configure menu items and prices in Admin Settings.

## What Changes

- **Slot overlap:** Expand Open Play session windows into covered court hours (e.g. 7–9 → `07:00` + `08:00`). Pending/approved Open Play on a date blocks those court hours facility-wide; court rental of those hours blocks the overlapping Open Play session (and vice versa). Enforce in API create paths and reflect in occupancy / booking UI.
- **Wallet on booking:** Logged-in booking (session on `POST /bookings`) can apply wallet balance toward the total; UI shows remaining GCash (e.g. ₱500 balance, ₱600 total → pay ₱100). Store apply on create; **debit on admin approve** (walk-in debits on create). Guests stay GCash-only.
- **Food:** Ship student **Food** tab (menu with **photo**, name, price + place order), admin **Food orders** inbox, and **Admin Settings** menu CRUD (name, price, photo upload, availability). Wallet debit and/or pay-at-counter for food orders.
- **Supersedes** unapplied change `player-food-orders` (archive/drop that draft without implementing it separately).

## Capabilities

### New Capabilities

- `booking-slot-overlap`: Cross-plan hour expansion and mutual blocking between court rental and Open Play sessions
- `wallet-booking-pay`: Apply wallet credits to portal court/open-play bookings; show remaining cash due
- `player-food-orders`: Student Food tab (incl. item photos) + admin order inbox + admin-configurable menu/prices/photos

### Modified Capabilities

- (none in main `openspec/specs/` — prior work lives only under archived/active changes)

## Impact

- **In scope:** `api` (`./backend`), `web` (`./app`), `plans`
- **Out of scope:** `support`; clinic slot overlap rules beyond shared hour helper if not needed; POS hardware; GCash auto-capture for food; refunds restoring wallet on cancel
- **Depends on:** Live wallet + open-play capacity on `main`
- Branch prefix: `feat/portal-slots-wallet-food`
- **Deploy order:** API (overlap rules + wallet debit helpers + food tables/menu) → web (modals, Food tab, Settings menu, admin inbox)
- **Note:** Drop or supersede `openspec/changes/player-food-orders` when this change is accepted
