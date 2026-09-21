## 1. api — clinic create retirement

- [x] 1.1 Narrow booking create Zod/OpenAPI plan enum to `court` | `open-play` (reads may still surface historical `clinic`) (`api/http-api.mdc`, `api/api-evolution.mdc`)
- [x] 1.2 Tests: create with `clinic` rejected; court/open-play still valid (`testing/`)
- [x] 1.3 Regen/check OpenAPI contract (`pnpm openapi:check`)
- [x] 1.4 Mid-apply: `cd backend &&` kit `verify_fast`
- [x] 1.5 Full `cd backend && pnpm verify` + merge-readiness before ship

## 2. web — unified schedule + clinic UI removal

- [x] 2.1 Extract shared schedule shell: left court map, date controls, right day grid (times × courts) (`pages/page-composition.mdc`, `pages/page-layout.mdc`)
- [x] 2.2 Day grid: Open Play sessions + capacity; private cells; yellow **Reserved for Open play**; single-plan selection; occupancy/capacity error states (`state/async-ui.mdc`, `copy/ui-microcopy.mdc`)
- [x] 2.3 Wire marketing `BookingModal` + provider so court/OP CTAs open the same unified schedule; keep pay/receipt + advance-booking floor (`api/api-layer.mdc`)
- [x] 2.4 Wire admin `WalkInBookingModal` (bookings + calendar) to the same schedule pattern; drop plan tabs for clinic (`state/async-ui.mdc`)
- [x] 2.5 Remove clinic from Pricing book CTA/card, settings plan prices, and `BookingPlan` bookable unions used by UI (`core/ponytail-rules.mdc`)
- [x] 2.6 Vitest: unified entry; reserved cells; clinic CTA absent; selection plan mapping (`testing/vitest-testing.mdc`)
- [x] 2.7 Mid-apply: `cd app &&` kit `verify_fast`
- [x] 2.8 Full `cd app && pnpm verify` + merge-readiness before ship

## 3. plans

- [x] 3.1 `openspec validate unified-booking-day-grid`

## 4. Ship

- [x] 4.1 `/opsx-verify` (api + web)
- [x] 4.2 `/opsx-pr` (branch `feat/unified-booking-day-grid`)
