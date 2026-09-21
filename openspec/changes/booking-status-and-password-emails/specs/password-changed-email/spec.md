## ADDED Requirements

### Requirement: Confirmation email after password change
When an authenticated player successfully changes their password via `POST /auth/change-password`, the system SHALL attempt to send a branded confirmation email to that user’s email address. The email SHALL state that the password was changed, include a human-readable date/time (UTC or facility-local as documented in design), and include “if this wasn’t you” guidance with a path to reset via forgot-password (SPA URL).

#### Scenario: Successful change sends confirmation
- **WHEN** a logged-in user changes password with a valid current password
- **THEN** the password is updated and a password-changed confirmation email is attempted

#### Scenario: Failed change sends nothing
- **WHEN** change-password fails (wrong current password or validation)
- **THEN** no password-changed email is sent

#### Scenario: Resend missing does not fail change
- **WHEN** Resend is not configured and change-password succeeds
- **THEN** the API still returns success and the email is skipped with a log
