## Why

`portal-flat-compact-ui` started denser portals and an Indoor/Outdoor court grid, but the booking modal still does not match the operator reference (light Courts·Times day grid), player Food is still a single-column list, and many portal surfaces still use `shadow-sm` / `shadow-md`. Ops want portals to read **plain and flat** (ARP-dashboard style: thin borders, no card shadows) with Pickle Era brand colors, a reference booking layout plus court photo on the right, and a POS-style Food order experience.

## What Changes

- **Flat portal chrome (player + admin):** Remove card/background shadows (`shadow-sm`, `shadow-md`, `shadow-lg` on content cards). Prefer white/light surfaces with thin borders on light grey content; keep dark sidebar. Soft radius OK; no heavy elevation. Pickle Era yellow/green/black branding stays (not the reference’s orange/red).
- **Booking modal (marketing + admin walk-in):** Rebuild schedule UI to match the Courts·Times reference:
  - Light cream/off-white shell (not the current dark black/yellow grid chrome)
  - Header with back + date summary (“Select Date & Time”)
  - Plan row: **Open Play** | **Private Court (₱…/hr)** (price from facility settings)
  - Horizontal date strip (not the month-grid-as-primary)
  - Grid: **Times · CRT 1 · CRT 2 · CRT 3** for the active Indoor/Outdoor group
  - Open Play session hours: **one wide cell** spanning all three court columns
  - Private hours: one cell per court
  - **Court picture on the right** (facility map/photo); grid left/center
  - Keep Indoor|Outdoor toggle (3 courts); Open Play capacity + one-way reserved behavior unchanged
- **Player Food tab:** POS-style layout — left menu card grid (+ Add / qty stepper, photo when available); right sticky order sidebar (lines, total, wallet/counter pay, place order). No restaurant multi-order tabs or Print Bill.

## Capabilities

### New Capabilities

- `portal-flat-surfaces`: Plain flat portal cards/surfaces — no content-card shadows; thin borders; brand colors retained
- `booking-modal-reference-layout`: Reference Courts·Times booking modal + court photo right
- `player-food-pos-layout`: Player Food two-column menu + order sidebar

### Modified Capabilities

- _(none from `openspec/specs/` — additive deltas; supersedes visual approach of `booking-court-grid-ux` from `portal-flat-compact-ui` for the modal)_

## Impact

- **Repos in scope:** `web` (`app` — portal pages, `UnifiedBookingSchedule` / BookingModal / WalkIn, FoodPage, portal chrome CSS), `plans`
- **Out of scope:** `api` / `backend` (no new endpoints unless a gap appears); `support`; marketing landing redesign; admin Food orders list redesign; new tax lines / Print Bill / multi-order sessions
- **Depends on / builds after:** `portal-flat-compact-ui` (yellow token, tabs, profile, Indoor/Outdoor baseline) — apply on a branch that includes that work or main after merge
- **Assumptions:** Reference cream/brown palette is adapted to Pickle Era tokens (yellow accents, black/zinc neutrals); court photo uses existing `/image.png` (or equivalent facility asset); Food categories optional — “All” only if no categories in API
- **Must not break:** Booking create/pay/receipt; Open Play capacity; one-way reserved hours; food place-order + pay modes; wallet top-up flows
