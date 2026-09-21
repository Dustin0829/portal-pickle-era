## Why

Players only get an email on booking approve when they are a brand-new account (credentials invite). Existing players hear nothing on approve or reject. Portal self-signup gets no welcome. After a successful password change in Profile there is also no “was this you?” confirmation, so account-security awareness is missing.

## What Changes

- Send a **booking approved** email on every successful admin approve (new and existing players), with booking context (name, date, plan/schedule summary)—no temp password in this template.
- Keep the existing **player invite** email for newly created accounts on approve (temp password + login), in addition to the approval notice.
- Send a **booking rejected** email on every successful admin reject.
- After successful **portal signup** (`POST /auth/signup`), send a branded **welcome** email (e.g. “Welcome to Pickle Era — your new era starts here.” + short CTA). Does **not** apply to accounts created only via booking approve (those keep the credentials invite).
- After a successful **change password**, send a confirmation email with the change timestamp and “if this wasn’t you” guidance (link to forgot-password / contact).
- Skip + log when Resend is not configured (same pattern as invite/reset); do not fail the approve/reject/signup/password API when email fails.
- **Out of scope:** password-reset delivery (already working); changing payment-received email copy beyond consistency if needed; welcome on approve-provisioned users (invite covers that path).

## Capabilities

### New Capabilities

- `booking-status-emails`: Transactional emails on booking approve (all players) and reject.
- `welcome-email`: Branded welcome after successful portal self-signup.
- `password-changed-email`: Confirmation email after authenticated password change.

### Modified Capabilities

- (none in main `openspec/specs/` — additive Resend + service wiring)

## Impact

- **In scope:** `api` (`backend/`), `plans` — including **welcome email after portal signup**, booking approved/rejected emails, and password-changed confirmation
- **Out of scope / non-goals:** `web` UI copy changes (optional microcopy later); `support`; forcing password reset to re-verify; sending the signup welcome template on booking-approve user create (invite covers that path)
- **Must not break:** Existing invite planner (`skip_existing_user` / `skip_not_configured` / send for new users); password-reset email; payment-received email; approve/reject/signup/change-password HTTP success when Resend down
- **Code:** `lib/resend/client.ts` builders/senders; `bookings.service.ts` approve/reject paths; `auth.service.ts` signup + change-password; unit tests; brief docs/`railway-deploy` mention if missing
