## Context

Resend helpers already exist for payment-received, player invite (approve + new user only), and password reset. `planInviteCredentialsEmail` returns `skip_existing_user` so existing players get silence on approve. Reject path updates status with no email. `signupWithBetterAuth` and `changePasswordWithBetterAuth` do not notify.

Applicable rules (cite):

- `backend/.cursor/rules/integrations/external-dependencies.mdc`
- `backend/.cursor/rules/ops/security-secrets.mdc`, `observability.mdc`
- `backend/.cursor/rules/core/ponytail-rules.mdc`, `module-boundaries.mdc`
- `backend/.cursor/rules/testing/node-testing.mdc`

## Goals / Non-Goals

**Goals:**

- Always notify on approve and reject (when Resend configured)
- Welcome new portal self-signups with branded tone
- Security confirmation after password change
- Reuse branded email shell; never fail core mutations on email errors

**Non-Goals:**

- Changing password-reset flow
- Sending the portal-signup welcome template on booking-approve user provisioning (invite remains that path’s mail; welcome after `/auth/signup` is in scope)
- Admin-facing email preference UI
- Queuing via Bull for these sends (fire-and-await or void+log like payment-received is enough unless volume forces otherwise)

## Decisions

### Two emails on new-user approve

Keep invite (credentials) separate from approved (status). Existing users get approved only. Avoid putting temp passwords in the approved template.

### Reject email is status-only

No refund/wallet details required in v1 (wallet refund already happens in service); optional one-liner “credits returned if any were held” is Nice-to-have—default omit for YAGNI unless copy is trivial.

### Welcome only on portal signup

Wire `sendWelcomeEmail` after successful `signupWithBetterAuth` (post Better Auth + user row load), using the signup email/name. Do **not** call welcome from the booking approve path—invite already covers first credentials for that flow. Copy: headline/body in the spirit of “Welcome to Pickle Era — your new era starts here.” with CTA to `resolvePublicAppUrl()` (home or login).

### Password-changed email after successful BA change

Call `sendPasswordChangedEmail` after Better Auth succeeds, using the **session user’s email from DB/session** (not a client-supplied address). Use `void` or await without throwing to client. Timestamp: ISO formatted in email body as UTC labeled “UTC” for simplicity.

### Fire pattern

Match payment-received / invite: `sendEmail` never throws; callers check `{ sent }` and log. Approve/reject/signup return without requiring new warning fields for these status/welcome mails (invite warning remains for credentials path).

## Risks / Trade-offs

- **Double email for new users on approve (invite + approved)** → Accepted; clearer than overloading invite
- **Signup + later approve still two different templates** → Welcome only on self-signup; approve path stays invite + approved
- **Email delay on approve/signup request** → Await sends; keep timeouts short via Resend SDK; Follow-up: enqueue if needed
- **Wrong PUBLIC_APP_URL in CTA / “wasn’t you” link** → Same resolver as reset/invite

## Migration Plan

Deploy API only. No migrate. Ensure Railway `RESEND_*` set (already for reset).

## Open Questions

- None — reject reason text omitted (no admin reason field today); welcome tone locked as brand-forward short copy above.
