Branch: `feat/booking-detail-split-and-schedule`

## 1. web — model + helpers

- [x] 1.1 Add `walletAppliedCents` to `BookingRequest` and map it in `bookingDtoToRequest` (`app/.cursor/rules/api/response-mapping.mdc`)
- [x] 1.2 Extract shared `bookingTimeRange` (court: min start → max start + 1h; Open Play list style; empty → TBD) into `lib/booking/` with unit tests (`app/.cursor/rules/testing/vitest-testing.mdc`)
- [x] 1.3 Add helper for payment split display amounts from total pesos + `walletAppliedCents` (missing → 0; remaining may be ₱0) (`app/.cursor/rules/core/ponytail-rules.mdc`)

## 2. web — admin + player UI

- [x] 2.1 Admin detail Payment information: split rows when credits > 0; single Amount when 0 (`app/.cursor/rules/copy/ui-microcopy.mdc`, `pages/page-layout.mdc`)
- [x] 2.2 Admin list + detail Schedule: use shared time range; remove `· N hour(s)` suffix
- [x] 2.3 Player booking detail: same schedule helper; show credits/remaining when split (`app/.cursor/rules/pages/page-composition.mdc`)
- [x] 2.4 Tests: unit tests for time-range + split helpers; add/extend admin (and player if needed) detail tests for split vs no-credits and schedule range (`app/.cursor/rules/testing/vitest-testing.mdc`)
- [x] 2.5 Run `pnpm format:check && pnpm lint && pnpm exec tsc -b --noEmit` in `app`

## 3. plans

- [x] 3.1 Run `openspec validate booking-detail-split-and-schedule --strict`

## 4. Ship

- [x] 4.1 Run `pnpm verify` in `app` + merge-readiness
- [x] 4.2 `/opsx-verify`
- [x] 4.3 `/opsx-pr` (web-only; one monorepo PR)
