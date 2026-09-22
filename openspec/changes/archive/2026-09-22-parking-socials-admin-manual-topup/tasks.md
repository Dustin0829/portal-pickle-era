Branch: `feat/parking-socials-admin-manual-topup`

## 1. web — marketing fixes

- [x] 1.1 Align Space parking image path with `app/public/` asset (case-safe for Linux) (`pages/page-composition.mdc`)
- [x] 1.2 Update Footer Instagram/Facebook hrefs to official Pickle Era URLs; keep external link safety attrs
- [x] 1.3 Smoke/test or assert hrefs in existing marketing/footer tests if present (`testing/vitest-testing.mdc`)

## 2. api — search + manual credit

- [x] 2.1 Admin player search by email/name (extend `GET /admin/users` or dedicated search) (`http-api.mdc`, `search-query-guidelines.mdc`)
- [x] 2.2 Admin player wallet-profile summary: name, email, joined, bookings count/recent (`response-contracts.mdc`)
- [x] 2.3 `POST` admin manual credit: validate amount, `applyWalletDelta` `top_up` + `referenceType: admin_manual`, admin session only (`concurrency.mdc`, `module-boundaries.mdc`)
- [x] 2.4 OpenAPI + unit tests for credit validation and unauthorized (`testing/node-testing.mdc`)
- [x] 2.5 Run `pnpm format:check && pnpm lint && pnpm typecheck` in `backend`
- [x] 2.6 Run `pnpm verify` in `backend`

## 3. web — Top-ups Inbox manual flow

- [x] 3.1 API client + hooks for search, profile, manual credit (`api/api-layer.mdc`)
- [x] 3.2 Top-ups Inbox: Top up CTA → modal: search → select → profile → amount → Add credits (`async-ui.mdc`, `forms/`)
- [x] 3.3 Success invalidates admin top-ups / relevant queries; errors via toast or field (`api-error-routing.mdc`)
- [x] 3.4 Focused Vitest for modal search empty/success paths where practical

## 4. web — admin calendar day bookings only

- [x] 4.1 Admin day sheet: list that day’s bookings only; remove open-hours / available-slot picker and walk-in footer (`pages/page-composition.mdc`)
- [x] 4.2 Strip walk-in wiring from `AdminCalendarPage` (`onBookSlot` / `WalkInBookingModal`); keep month counts + day click (`page-composition.mdc`)
- [x] 4.3 Update calendar copy so walk-in is directed to Admin Bookings
- [x] 4.4 Vitest: day open shows bookings list / empty state; no walk-in / open-hour book path on admin calendar (`testing/vitest-testing.mdc`)

## 5. web — walk-in desk pay

- [x] 5.1 Walk-in modal: no credits / wallet-apply UI (guest assumption) (`forms/`, `page-composition.mdc`)
- [x] 5.2 Show facility payment methods on walk-in settle (same Settings source as marketing/portal)
- [x] 5.3 Add explicit **Paid via cash** action that creates approved walk-in cash booking
- [x] 5.4 Vitest: methods visible when configured; Paid via cash path; no credits control (`testing/vitest-testing.mdc`)

## 6. web — portal session loading flash

- [x] 6.1 Change `ProtectedRoute` loading UX so portal chrome (or portal-styled shell) stays up during `loading`; never show Login/AuthLayout (`state/async-ui.mdc`)
- [x] 6.2 Ensure `/login` Navigate only on confirmed `unauthenticated`; refresh of `/app/*` or `/admin/*` keeps path when `getMe` succeeds
- [x] 6.3 Vitest/portal access: loading state does not render login; authenticated refresh path preserved (`testing/vitest-testing.mdc`)
- [x] 6.4 Run `pnpm format:check && pnpm lint && pnpm exec tsc -b --noEmit` then `pnpm verify` in `app`

## 7. plans

- [x] 7.1 `openspec validate parking-socials-admin-manual-topup --strict`

## 8. Ship

- [x] 8.1 `/opsx-verify`
- [x] 8.2 `/opsx-pr` (one monorepo PR: web + api)
