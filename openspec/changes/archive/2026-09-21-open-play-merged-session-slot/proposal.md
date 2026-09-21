## Why

Open Play sessions paint six identical cells for a 2-hour Indoor block; players want one control and a full session time window. Private court booking is locked to a single court — product wants **one booking that can cover two or more courts**. Page chrome also drifts: Food uses `AppPageShell` spacing (`px-4 sm:px-6` + `py-8 sm:py-10`) while Calendar and Admin Settings use tighter custom padding — portals should look **uniform**.

## What Changes

- Unified day grid: each Open Play session → **one** selectable control spanning the full duration; time gutter shows the full window (e.g. 4–6).
- Private court: selecting Available cells on **different courts** accumulates into one selection (does not reset).
- **api + web:** a court booking persists as a **single booking row with multiple courts** (and hours), not N separate bookings.
- Open Play create path stays one session (capacity seat); multi-court applies to `plan: court` only.
- **web:** all player and admin main tabs use the **same page padding as the player Food tab** via `AppPageShell` / shared layout constants (horizontal + vertical). Content `max-w-*` may still vary per page.
- Indoor/Outdoor toggle, yellow chrome, and no plan chooser unchanged.

## Capabilities

### New Capabilities

- `booking-open-play-merged-slot`: Merged Open Play session control + full-window time label on the day grid.
- `booking-multi-court`: One private-court booking may include multiple courts (selection UI + persist + conflict/pricing).
- `portal-uniform-page-padding`: Player + admin portal pages share Food-tab shell padding.

### Modified Capabilities

- _(none in `openspec/specs/` — additive deltas)_

## Impact

- **kit.repos in scope:** `api` (`./backend`), `web` (`./app`), `plans`
- **Excluded:** `support`; Food menu/order UX redesign; wallet/credits product changes; admin Open Play session CRUD
- **Primary touch:** Prisma `Booking`, bookings schema/service/mapper/OpenAPI, occupancy, `unifiedBookingSelection`, `UnifiedBookingSchedule`, BookingModal/WalkIn, list court labels; `AppPageShell` / `layout.constants`; Calendar + Admin Calendar + Admin Settings (and any page still on custom `py-4`)
- **Must-not-break:** single-court bookings; Open Play capacity; holds; Indoor/Outdoor; create/pay Continue; Food layout as the padding reference
- **Not documentation-only**
