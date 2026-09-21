## 1. web — payment methods + portal credits

- [x] 1.1 Extend `facilitySettingsStore` with `paymentMethods[]` + migrate legacy `payment`; helpers to list/add/update/remove (`state/react-state-zustand.mdc`)
- [x] 1.2 Admin Settings Payment tab: list, add/edit/remove, QR upload (data URL), save (`pages/page-composition.mdc`, `forms/`)
- [x] 1.3 Shared pay-channel UI: Previous/Next carousel (uploaded QR or generated fallback); use in BookingModal pay step and Wallet top-up (`ui/`, `pages/`)
- [x] 1.4 Portal-only `allowCreditsPay`: explicit Cash vs Pay with credits; partial `walletAppliedCents`; marketing stays cash-only / no auto-apply (`state/async-ui.mdc`)
- [x] 1.5 Wire Overview / Bookings / Calendar `openBookingModal(..., { allowCreditsPay: true })`
- [x] 1.6 Vitest: migrate seed; carousel next; credits partial; marketing no credits; wallet page uses methods (`testing/vitest-testing.mdc`)
- [x] 1.7 Mid-apply: `cd app &&` kit `verify_fast`
- [x] 1.8 Full `cd app && pnpm verify` + merge-readiness

## 2. plans

- [x] 2.1 `openspec validate booking-payment-methods-credits`

## 3. Ship

- [x] 3.1 `/opsx-verify` (web)
- [x] 3.2 `/opsx-pr` (branch `feat/booking-payment-methods-credits`)
