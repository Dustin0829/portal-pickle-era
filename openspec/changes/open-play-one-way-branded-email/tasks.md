## 1. api — one-way overlap + branded email

- [x] 1.1 Remove court/clinic → Open Play conflict in `assertNoCrossPlanSlotConflict` (keep Open Play → court/clinic) (`data/concurrency.mdc`, `api/http-api.mdc`)
- [x] 1.2 Update bookings tests: Open Play create allowed when court hour occupied; court create still conflicts on Open Play; drop reverse-block expectations (`testing/`)
- [x] 1.2b Drop or stop calling backend `sessionsBlockedByCourtHours` if only used for reverse-block (`core/ponytail-rules.mdc`)
- [x] 1.3 Add shared `renderBrandedEmail` (or equivalent) with logo `${resolvePublicAppUrl()}/logo.png`, yellow `#f5ed5a` CTA, footer (`integrations/external-dependencies.mdc`)
- [x] 1.4 Wrap payment-received, player invite, and password-reset HTML through branded shell with correct CTA hrefs (`integrations/external-dependencies.mdc`)
- [x] 1.5 Tests: HTML contains logo URL + yellow button markers for all three sends; Resend unset still skips without throw (`testing/`)
- [x] 1.6 Mid-apply: `cd backend &&` kit `verify_fast`
- [x] 1.7 Full `cd backend && pnpm verify` + merge-readiness before ship

## 2. web — reserved court UI + Open Play unlock

- [x] 2.1 Booking modal: stop disabling Open Play sessions for court occupancy; remove “Court booked” label (`state/async-ui.mdc`, `pages/page-composition.mdc`)
- [x] 2.2 Court rent hours held by Open Play: yellow bg, black text, label “Reserved for Open play”; keep non-selectable; do not conflate with pending/approved court holds (`copy/ui-microcopy.mdc`)
- [x] 2.3 Audit portal walk-in / day grid; apply reserved/one-way only where cross-plan UI exists (skip if none) (`state/async-ui.mdc`)
- [x] 2.4 Remove unused `sessionsBlockedByCourt` / `sessionsBlockedByCourtHours` call sites and dead helpers; keep hour-expansion (`core/ponytail-rules.mdc`)
- [x] 2.5 Vitest: reserved label “Reserved for Open play” + yellow/black classes; Open Play sessions not disabled by court occupancy (`testing/vitest-testing.mdc`)
- [x] 2.6 Mid-apply: `cd app &&` kit `verify_fast`
- [x] 2.7 Full `cd app && pnpm verify` + merge-readiness before ship

## 3. plans

- [x] 3.1 `openspec validate open-play-one-way-branded-email`
- [x] 3.2 Note in design/deploy: production `PUBLIC_APP_URL` must serve `/logo.png`

## 4. Ship

- [x] 4.1 `/opsx-verify` (api + web)
- [x] 4.2 `/opsx-pr` (branch `feat/open-play-one-way-branded-email`)
