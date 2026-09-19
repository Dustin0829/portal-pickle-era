## Context

Better Auth email/password is live (`backend/src/modules/auth/auth.ts`). Forgot/Reset pages are marketing stubs; `AuthProvider.resetPassword` throws. Resend client already exists for invite + payment-received emails (`backend/src/lib/resend/client.ts`). `PUBLIC_APP_URL` / `EMAIL_FROM` / `RESEND_API_KEY` are on Railway.

**Rule cites:** `backend/.cursor/rules/integrations/external-dependencies.mdc`, `ops/security-secrets.mdc`, `platform/platform-patterns.mdc`, `api/http-api.mdc`; `app/.cursor/rules/security/route-protection.mdc`, `api/api-layer.mdc`, `forms/forms-and-drafts.mdc`, `copy/ui-microcopy.mdc`, `state/async-ui.mdc`.

## Goals / Non-Goals

**Goals:**
- Real forgot → Resend link → token reset → login
- Enumeration-safe forgot UX
- Align invite email copy with working forgot URL

**Non-Goals:**
- Forced password change on first invite login
- Logged-in profile change-password (follow-up)
- Magic link / OTP login

## Decisions

1. **Better Auth native reset** — Configure `emailAndPassword.sendResetPassword` to call `sendPasswordResetEmail({ to, url })`. Prefer BA-generated `url`; ensure `redirectTo` on the client forget call is `{PUBLIC_APP_URL}/reset-password` so the link lands on the SPA (API `baseURL` is `api.pickleera.co`).

2. **SPA token flow** — Reset page reads `token` from query (Better Auth standard). Drop email+password-without-token stub. Min password length 8 (existing BA config).

3. **Forgot UX** — Call BA forget/request API; always show “If an account exists… check your email.” Remove the button that navigates to `/reset-password?email=` without a token.

4. **Resend** — Reuse `sendEmail` / `isResendConfigured`; new helper `sendPasswordResetEmail`. Missing env: log skip; do not throw from send hook in a way that enumerates users (follow BA’s request behavior).

5. **Invite copy** — Update `sendPlayerInviteEmail` to link `{portal}/forgot-password`.

6. **Ship** — Branch `feat/auth-password-reset-email` from `main` (or after wallet PR merges). Prefer not mixing into wallet PR.

## Risks / Trade-offs

- [Wrong redirect host] → Always pass SPA origin in `redirectTo` / PUBLIC_APP_URL
- [Token in email logs] → Do not log full reset URLs with tokens at info level
- [BA API naming drift] → Confirm current better-auth client methods (`forgetPassword` / `resetPassword`) against installed version during apply

## Migration Plan

1. Deploy API with `sendResetPassword`
2. Deploy web forgot/reset pages
3. No DB migration expected (BA verification/token tables already present if used by Better Auth schema)
4. Rollback: revert web to stub + disable sendResetPassword

## Open Questions

- None blocking — profile change-password deferred
