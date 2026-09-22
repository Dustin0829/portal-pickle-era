Branch: `feat/booking-status-and-password-emails`

## 1. api — Resend templates

- [x] 1.1 Add `buildBookingApprovedEmail` / `sendBookingApprovedEmail` (name, date, optional reference; CTA portal/home) (`backend/.cursor/rules/integrations/external-dependencies.mdc`)
- [x] 1.2 Add `buildBookingRejectedEmail` / `sendBookingRejectedEmail` (same context fields; no temp password)
- [x] 1.3 Add `buildWelcomeEmail` / `sendWelcomeEmail` (name; brand line “Welcome to Pickle Era — your new era starts here.”; CTA via `resolvePublicAppUrl`)
- [x] 1.4 Add `buildPasswordChangedEmail` / `sendPasswordChangedEmail` (timestamp UTC; wasn’t-you + forgot-password URL via `resolvePublicAppUrl`) (`ops/security-secrets.mdc`)
- [x] 1.5 Unit tests for builders + skip-when-unconfigured senders (`testing/node-testing.mdc`)

## 2. api — wire bookings + auth

- [x] 2.1 On approve: always attempt approved email; keep invite path for `createdNewUser` via existing planner (`bookings.service.ts`, `core/module-boundaries.mdc`)
- [x] 2.2 On reject: after status (+ wallet refund) completes successfully, attempt rejected email (do not fail reject on email error) (`observability.mdc`)
- [x] 2.3 After successful `signupWithBetterAuth`, attempt welcome email to the new user’s email without failing signup (`auth.service.ts`)
- [x] 2.4 After successful `changePasswordWithBetterAuth`, attempt password-changed email to the authenticated user’s email (from session/DB) without failing the API response
- [x] 2.5 Tests: builders; existing-user approve still skips invite but approved sender is invoked; reject invokes rejected sender; signup success triggers welcome helper; change-password success triggers password-changed helper (`testing/node-testing.mdc`)
- [x] 2.6 Run `pnpm format:check && pnpm lint && pnpm typecheck` in `backend`
- [x] 2.7 Run `pnpm verify` in `backend`

## 3. plans

- [x] 3.1 Run `openspec validate booking-status-and-password-emails --strict`
- [x] 3.2 Note in `backend/docs/railway-deploy.md` (brief) that approve/reject/welcome/password-changed use same Resend vars if not already listed

## 4. Ship

- [x] 4.1 `/opsx-verify`
- [x] 4.2 `/opsx-pr` (api-focused; one monorepo PR)
