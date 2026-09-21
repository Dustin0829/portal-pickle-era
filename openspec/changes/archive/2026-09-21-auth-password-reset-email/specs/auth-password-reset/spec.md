## ADDED Requirements

### Requirement: Request password reset sends Resend email

When a visitor submits a non-empty email on forgot-password, the system MUST request a Better Auth password reset and, when Resend is configured and a matching user exists, send an email from `EMAIL_FROM` containing a one-time link to the SPA reset page with a token. The API/UI MUST present a generic success message whether or not the email exists (no user enumeration).

#### Scenario: Known email receives reset link

- **WHEN** a user with an existing account requests a password reset and Resend is configured
- **THEN** an email is sent with a link to `{PUBLIC_APP_URL}/reset-password` including a reset token

#### Scenario: Unknown email still shows success

- **WHEN** a visitor submits an email that has no account
- **THEN** the UI shows the same success/check-your-email state and does not reveal that the account is missing

#### Scenario: Resend unset does not crash forgot

- **WHEN** `RESEND_API_KEY` or `EMAIL_FROM` is unset and forgot is submitted
- **THEN** the request still completes with generic success (or a safe error that does not leak existence); the server logs the skip/failure

### Requirement: Reset password with token

The reset-password page MUST require a valid reset token from the query string. Submitting a new password (min length per Better Auth, currently 8) with a valid token MUST update the credential password. Missing/invalid/expired tokens MUST show a clear error and MUST NOT set a password.

#### Scenario: Valid token sets password

- **WHEN** a player opens the reset link with a valid token and submits matching new passwords meeting min length
- **THEN** the password is updated and they can log in with the new password

#### Scenario: Mismatched confirmation rejected

- **WHEN** the new password and confirm fields do not match
- **THEN** the UI shows an error and does not call the reset API

#### Scenario: Missing token rejected

- **WHEN** a player opens `/reset-password` without a token
- **THEN** the UI shows an error (or disabled submit) and does not call a successful reset

#### Scenario: Stub path removed

- **WHEN** the product ships this change
- **THEN** `AuthProvider` no longer throws “Password reset is not available yet” for the token-based flow

### Requirement: Invite email points at working forgot path

The booking-approve invite credentials email MUST tell players they can use `/forgot-password` if they lose the temporary password (not a non-working stub path).

#### Scenario: Invite copy mentions forgot-password

- **WHEN** an invite credentials email is sent
- **THEN** the body includes guidance to use the forgot-password page on the public app origin

### Requirement: Login and signup unchanged

Existing email/password login and signup MUST continue to work. Password reset MUST NOT change session cookie domain behavior established for Better Auth portals.

#### Scenario: Login still works after reset

- **WHEN** a player resets their password successfully
- **THEN** they can log in with the new password and receive a normal session
