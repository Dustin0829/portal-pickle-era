Branch: `feat/player-receipt-preview-and-cache`

## 1. api — player receipt URLs

- [x] 1.1 Add owner-scoped `GET /me/bookings/:id/receipt-url` reusing presigned download; ownership = `listMyBookings` rules (`http-api.mdc`, `file-uploads.mdc`)
- [x] 1.2 Add owner-scoped `GET /me/wallet/top-ups/:id/receipt-url`; ownership = top-up `userId` (`http-api.mdc`, `file-uploads.mdc`)
- [x] 1.3 OpenAPI + unit tests for both: owner OK, non-owner/unauth denied, missing `receiptKey` → not found (`testing/node-testing.mdc`, `response-contracts.mdc`)
- [x] 1.4 Confirm admin booking + wallet top-up receipt-url routes unchanged
- [x] 1.5 Run `pnpm format:check && pnpm lint && pnpm typecheck` in `backend`
- [x] 1.6 Run `pnpm verify` in `backend`
- [x] 1.7 Run merge-readiness check for api (`backend/.cursor/skills/merge-readiness-check/SKILL.md`)

## 2. web — player preview + cache

- [x] 2.1 API clients + hooks for player booking and top-up receipt-url (`api/api-layer.mdc`)
- [x] 2.2 My bookings detail: fetch signed URL when `receiptKey` present; image/PDF preview; distinct load-fail vs filename-only copy (`async-ui.mdc`, `ui-microcopy.mdc`)
- [x] 2.3 Wallet page: preview top-up receipt when `receiptKey` present (same states as bookings) (`async-ui.mdc`, `page-composition.mdc`)
- [x] 2.4 Wire `BookingModal` through `useCreatePublicBooking` (or equivalent invalidation of my/admin bookings + occupancy) (`api-layer.mdc`, `ponytail-rules.mdc`)
- [x] 2.5 Grep for other booking create/patch UI that bypasses mutation hooks; fix clear offenders only
- [x] 2.6 Vitest: booking + top-up preview with key; filename-only without key; BookingModal invalidation or hook usage (`testing/vitest-testing.mdc`)
- [x] 2.7 Run `pnpm format:check && pnpm lint && pnpm exec tsc -b --noEmit` then `pnpm verify` in `app`
- [x] 2.8 Run merge-readiness check for web (`app/.cursor/skills/merge-readiness-check/SKILL.md`)

## 3. plans

- [x] 3.1 `openspec validate player-receipt-preview-and-cache --strict`

## 4. Ship

- [x] 4.1 `/opsx-verify` (api + web) + merge-readiness for both packages
- [x] 4.2 `/opsx-pr` → branch `feat/player-receipt-preview-and-cache` (API with or before web)
