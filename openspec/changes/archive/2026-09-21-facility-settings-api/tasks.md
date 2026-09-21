## 1. api — facility settings module

- [x] 1.1 Prisma: `FacilitySettings` (+ `FacilityPaymentMethod` or JSON methods) with seed defaults for prices, Open Play sessions, GCash placeholder; migrate (`data/database.mdc`)
- [x] 1.2 Module `facility-settings`: Zod schemas, mapper, service GET ensure-seeded, admin PATCH (methods replace-when-present; reject empty methods / invalid sessions / non-positive prices); public GET + admin write RBAC (`module-boundaries.mdc`, `api/http-api.mdc`, `platform/platform-patterns.mdc`)
- [x] 1.3 Payment QR: accept `qrImageKey`; resolve `qrImageUrl` via presign download (`integrations/file-uploads.mdc`)
- [x] 1.4 Wire bookings Open Play sessions + default unit prices to settings when client omits `unitPricePesos` (fallback to current constants) (`data/concurrency.mdc` only if txn touch)
- [x] 1.5 Tests: public GET; admin PATCH; non-admin 403; seed defaults; empty methods rejected; invalid sessions rejected; OpenAPI regen (`testing/node-testing.mdc`)
- [x] 1.6 Mid-apply: `cd backend &&` kit `verify_fast`
- [x] 1.7 Full `cd backend && pnpm verify` + merge-readiness before ship

## 2. web — drop persist, use API

- [x] 2.1 API client + Zod + React Query hooks for facility settings (`api/api-layer.mdc`, `api/zod-validation.mdc`)
- [x] 2.2 Admin Settings: load/save via mutation; payment QR upload via existing presign (not data URL) (`pages/page-composition.mdc`, `forms/`, `state/async-ui.mdc`)
- [x] 2.3 Replace `facilitySettingsStore` persist consumers (Pricing, BookingModal, Wallet, planPrices, openPlaySlots, paymentSettings) with query (`state/data-ownership.mdc`)
- [x] 2.4 Remove Zustand persist for facility settings (delete store or strip `persist`) (`state/react-state-zustand.mdc`)
- [x] 2.5 Vitest: settings fetch/save smoke; pay methods from API mock; cleared localStorage still loads; GET error fallback does not re-persist (`testing/vitest-testing.mdc`)
- [x] 2.6 Mid-apply: `cd app &&` kit `verify_fast`
- [x] 2.7 Full `cd app && pnpm verify` + merge-readiness before ship

## 3. plans

- [x] 3.1 `openspec validate facility-settings-api`

## 4. Ship

- [x] 4.1 `/opsx-verify` (api + web)
- [x] 4.2 `/opsx-pr` (branch `feat/facility-settings-api`)
