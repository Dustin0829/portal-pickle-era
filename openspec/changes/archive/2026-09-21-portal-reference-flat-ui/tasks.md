## 1. web — flat surfaces, booking modal, food POS

- [x] 1.1 Sweep player + admin portal pages: remove content-card `shadow-*`; keep thin borders; preserve PE yellow/green accents (`pages/page-layout.mdc`, `ui/`, `core/ponytail-rules.mdc`)
- [x] 1.2 Rebuild `UnifiedBookingSchedule` to reference layout: light chrome, header back→close + date pill, Open Play | Private Court chooser, horizontal date strip, Times×CRT grid with Open Play colspan, Indoor|Outdoor, court photo right (omit when `compact`) (`pages/page-composition.mdc`, `copy/ui-microcopy.mdc`)
- [x] 1.3 Wire marketing `BookingModal` + admin WalkIn to the new schedule chrome; preserve selection, occupancy, capacity, pay flows (`api/api-layer.mdc`, `state/async-ui.mdc`)
- [x] 1.4 Rebuild player `FoodPage`: menu card grid + sticky order sidebar; + Add / qty; wallet|counter + Place order (`pages/page-composition.mdc`, `state/async-ui.mdc`)
- [x] 1.5 Vitest: flat smoke where practical; booking date strip / plan chooser / Open Play wide cell; Food add-to-sidebar + empty place disabled (`testing/vitest-testing.mdc`)
- [x] 1.6 Mid-apply: `cd app &&` kit `verify_fast`
- [x] 1.7 Full `cd app && pnpm verify` + merge-readiness before ship

## 2. plans

- [x] 2.1 `openspec validate portal-reference-flat-ui`

## 3. Ship

- [x] 3.1 `/opsx-verify` (web)
- [x] 3.2 `/opsx-pr` (branch `feat/portal-reference-flat-ui`; base includes `portal-flat-compact-ui` if not yet on main)
