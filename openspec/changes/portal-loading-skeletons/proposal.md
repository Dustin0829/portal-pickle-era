## Why

Portal and marketing screens often flash empty content while React Query loads, and several mutations (approve/reject, logout, export) give no busy feedback. Operators also edit Plan prices in Settings but marketing Pricing / booking totals still use hardcoded `PLAN_META` — Settings even says sync does not work yet. Operators need skeletons, action busy states, and a Save control so saved plan prices appear on the marketing site.

## What Changes

- Add page/list **skeletons** for admin dashboard, bookings inbox, calendar, players table; player overview, bookings, calendar; booking modal occupancy slots; booking detail receipt preview
- Add **action loading** states: admin approve/reject, players export, logout, **plan prices Save**; strengthen booking submit / walk-in create busy UX
- **Plan prices:** draft + **Save** on admin Settings (same pattern as GCash display); persist via existing `facilitySettingsStore`; marketing `Pricing` + `BookingModal` / booking totals read saved prices (not hardcoded-only)
- Standardize: `isPending` + no data → skeleton layout; busy actions → disable + label; refetch with cache → no full skeleton swap
- Reuse existing `Skeleton` / `AuthLoadingShell` patterns; keep portal chrome mounted during content load
- **Non-goals:** backend facility-settings API / multi-device sync; support app; optimistic approve/reject UI; redesign of page layouts beyond placeholders and the Save affordance

## Capabilities

### New Capabilities

- `portal-loading-ux`: Skeleton placeholders and action busy states across marketing booking flow, player portal, and admin portal
- `facility-plan-prices`: Admin saves plan prices that drive marketing Pricing and booking amount display (client-persisted settings)

### Modified Capabilities

- (none — no main `openspec/specs/` baseline; new capabilities only)

## Impact

- **In scope:** `web` (`./app`), `plans` (this change)
- **Out of scope:** `api` (`./backend`), `support`
- Touches admin/player pages, `AdminSettingsPage`, `facilitySettingsStore`, `Pricing.tsx`, `BookingModal`, `WalkInBookingModal`, `PortalChrome`, shared skeleton helpers
- Client-only persist (`pickle-era-facility-settings`); same browser sees marketing update after Save — not a server source of truth yet
