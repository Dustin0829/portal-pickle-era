## 1. api — Better Auth + Resend reset

- [x] 1.1 Add `sendPasswordResetEmail` in `src/lib/resend/client.ts` (`integrations/external-dependencies.mdc`)
- [x] 1.2 Wire `emailAndPassword.sendResetPassword` in `auth.ts`; safe when Resend unset (`platform/platform-patterns.mdc`, `ops/security-secrets.mdc`)
- [x] 1.3 Update invite email copy to mention `/forgot-password` with public app URL
- [x] 1.4 Tests for reset email helper skip/shape (`testing/`)
- [x] 1.5 Confirm docs mention password reset uses same Resend vars (`.env.example`, `railway-deploy.md`)
- [x] 1.6 Mid-apply: `cd backend &&` kit `verify_fast`
- [x] 1.7 Full `cd backend && pnpm verify` + merge-readiness before ship

## 2. web — Forgot / Reset UX

- [x] 2.1 ForgotPasswordPage: call Better Auth forget/request with `redirectTo` SPA `/reset-password`; enumeration-safe success (`forms/forms-and-drafts.mdc`, `copy/ui-microcopy.mdc`)
- [x] 2.2 ResetPasswordPage: require `token` query; call Better Auth resetPassword; remove email-only stub path (`api/api-layer.mdc`, `state/async-ui.mdc`)
- [x] 2.3 AuthProvider: remove throw stub; wire real reset or drop unused method (`security/frontend-security.mdc`)
- [x] 2.4 Vitest for forgot success UI + reset missing-token error (`testing/vitest-testing.mdc`)
- [x] 2.5 Mid-apply: `cd app &&` kit `verify_fast`
- [x] 2.6 Full `cd app && pnpm verify` + merge-readiness before ship

## 3. plans

- [x] 3.1 Keep artifacts aligned after any BA API naming fix
- [x] 3.2 `openspec validate auth-password-reset-email`

## 4. Ship

- [x] 4.1 `/opsx-verify` (api + web)
- [x] 4.2 `/opsx-pr` (branch `feat/auth-password-reset-email`)
