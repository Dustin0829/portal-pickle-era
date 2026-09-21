## 1. api — overlap + wallet book + food

- [x] 1.1 Shared helper: expand Open Play session (`hour` + `durationHours` default 2) → covered hour ids; unit tests (`testing/`)
- [x] 1.2 Enforce cross-plan conflicts in `createBookingRow` + occupancy/`open-play-sessions` (any open-play seat blocks hours) (`data/concurrency.mdc`, `api/http-api.mdc`)
- [x] 1.3 Prisma: `Booking.walletAppliedCents`; migrate (`data/database.mdc`)
- [x] 1.4 Booking create: clamp/store `walletAppliedCents` when session present; no debit while pending; require receipt when remaining > 0 (`api/http-api.mdc`)
- [x] 1.4b Approve (and walk-in create): conditional wallet debit for stored apply amount; fail approve if insufficient (`data/concurrency.mdc`)
- [x] 1.5 Prisma: `FoodMenuItem` (incl. `imageKey`), `FoodOrder`, `FoodOrderLine`; seed sample menu (`data/database.mdc`)
- [x] 1.6 Food module: menu CRUD (admin) with image key; list available + image URL (student); place order wallet|counter; admin status PATCH (`module-boundaries.mdc`, `integrations/file-uploads.mdc`, `add-feature-module/SKILL.md`)
- [x] 1.7 Tests: overlap conflicts; wallet debit / overdraw; food wallet + counter + status machine; menu image key optional (`testing/`)
- [x] 1.8 Mid-apply: `cd backend &&` kit `verify_fast`
- [x] 1.9 Full `cd backend && pnpm verify` + merge-readiness before ship

## 2. web — modals, Food tab, Settings menu

- [x] 2.1 Booking modal + portal calendar: disable court hours / Open Play sessions per overlap rules (`state/async-ui.mdc`, `api/api-layer.mdc`)
- [x] 2.1b Admin Open Play settings: persist `durationHours` (default 2); preview covered hours (`pages/page-composition.mdc`)
- [x] 2.2 Booking modal (logged-in): show wallet applied + remaining GCash; send `walletAppliedCents` (`forms/forms-and-drafts.mdc`, `copy/ui-microcopy.mdc`)
- [x] 2.3 Student Food page + nav: show photo/placeholder, name, price, order (`pages/page-layout.mdc`, `security/route-protection.mdc`, `ui/icons-and-assets.mdc`)
- [x] 2.4 Admin Settings: food menu CRUD (name, price, available, **photo upload** via presign) (`pages/page-composition.mdc`, `integrations` via uploads API)
- [x] 2.5 Admin Food orders inbox + nav (`state/async-ui.mdc`)
- [x] 2.6 Vitest: overlap UI disable; wallet remaining math; Food nav present (`testing/vitest-testing.mdc`)
- [x] 2.7 Mid-apply: `cd app &&` kit `verify_fast`
- [x] 2.8 Full `cd app && pnpm verify` + merge-readiness before ship

## 3. plans

- [x] 3.1 Mark `player-food-orders` superseded (note in that change or remove draft after this ships)
- [x] 3.2 `openspec validate portal-slots-wallet-food`

## 4. Ship

- [x] 4.1 `/opsx-verify` (api + web)
- [x] 4.2 `/opsx-pr` (branch `feat/portal-slots-wallet-food`)
