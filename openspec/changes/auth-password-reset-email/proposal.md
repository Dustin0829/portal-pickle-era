## Why

Forgot/reset password UI exists but is a stub: Better Auth left password-reset email out of scope, and `AuthProvider.resetPassword` always throws. Players who lose the invite temp password (or any password) cannot recover access. Resend is already configured (`EMAIL_FROM` / `hello@pickleera.co`); we can wire real reset delivery now.

## What Changes

- Enable Better Auth password reset with Resend delivery of a one-time link
- Forgot-password page calls the API (enumeration-safe success copy); stop navigating to set-password without a token
- Reset-password page accepts `token` from the email link and sets a new password via Better Auth
- Update invite-email copy to point at `/forgot-password` as a working path
- Remove the stub that throws “Password reset is not available yet”

## Capabilities

### New Capabilities

- `auth-password-reset`: Forgot password → Resend reset link → SPA reset with token → login

### Modified Capabilities

- (none in main `openspec/specs/` — Better Auth portals explicitly deferred this; new capability only)

## Impact

- **In scope:** `api` (`./backend`), `web` (`./app`), `plans` (this change)
- **Out of scope:** `support`; OAuth; email verification / magic link login; forced change-password on first login after invite; Profile “change password while logged in” (follow-up)
- **Depends on:** existing Resend env (`RESEND_API_KEY`, `EMAIL_FROM`, `PUBLIC_APP_URL`) from Phase 2
- Branch prefix: `feat/auth-password-reset-email`
- **Deploy order:** API (Better Auth `sendResetPassword`) then web forgot/reset pages; same Railway Resend vars
