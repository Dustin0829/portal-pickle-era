## 1. api — list my food orders

- [x] 1.1 `GET /me/food/orders`: service + controller + route; return current user’s orders newest-first (reuse `FoodOrderDto`, limit ~20) (`module-boundaries`, `api/http-api.mdc`, `api/role-based-access.mdc`)
- [x] 1.2 Zod/OpenAPI for list response; OpenAPI regen/check (`zod-validation`, `api/`)
- [x] 1.3 Tests: own orders only; empty list; auth required (`testing/`)
- [x] 1.4 Mid-apply: `cd backend &&` kit `verify_fast`
- [x] 1.5 Full `cd backend && pnpm verify` + merge-readiness before ship

## 2. web — Food rail, status, activities, images

- [x] 2.1 Client: `listMyFoodOrders` + React Query hook; invalidate on create (`api/api-layer.mdc`, `state/async-ui.mdc`)
- [x] 2.2 Food page: full-height Your order rail (`lg` stretch + scrollable body + pinned pay/place); active orders section cap 20 with Queued/Preparing/Ready; invalidate list on place (`pages/page-composition.mdc`, `ui/`, `copy/ui-microcopy.mdc`)
- [x] 2.3 Menu cards: enforce equal image aspect (`shrink-0` + `object-cover object-center`; placeholder same box) (`ui/icons-and-assets.mdc`)
- [x] 2.4 Player Overview: merge my food orders into recent activity; empty only when bookings + food empty; partial-failure keeps successful feed (`pages/page-layout.mdc`, `state/async-ui.mdc`)
- [x] 2.5 Admin Dashboard: merge admin food orders into activity feed (current status); href `/admin/food`; bookings/waitlist still present (`pages/page-composition.mdc`)
- [x] 2.6 Vitest: my-orders hook; Food active status after place mock; Overview merge food+booking (`testing/vitest-testing.mdc`)
- [x] 2.7 Mid-apply: `cd app &&` kit `verify_fast`
- [x] 2.8 Full `cd app && pnpm verify` + merge-readiness before ship

## 3. plans

- [x] 3.1 `openspec validate food-order-status-activity`

## 4. Ship

- [x] 4.1 `/opsx-verify` (api + web)
- [x] 4.2 `/opsx-pr` (branch `feat/food-order-status-activity`)
