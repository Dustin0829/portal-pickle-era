# welcome-email Specification

## Purpose
TBD - created by archiving change booking-status-and-password-emails. Update Purpose after archive.
## Requirements
### Requirement: Welcome email after portal signup
When a player successfully creates an account via `POST /auth/signup`, the system SHALL attempt to send a branded welcome email to that user’s email address. The email SHALL welcome them to Pickle Era with a short brand line in the spirit of “Welcome to Pickle Era — your new era starts here.” and SHALL include a CTA to the public app (home or login via `resolvePublicAppUrl`). The welcome email SHALL NOT include a temporary password.

#### Scenario: Successful signup sends welcome
- **WHEN** signup succeeds with a new email
- **THEN** the user is created/session headers returned and a welcome email is attempted

#### Scenario: Failed signup sends nothing
- **WHEN** signup fails (duplicate email, validation, or Better Auth error)
- **THEN** no welcome email is sent

#### Scenario: Resend missing does not fail signup
- **WHEN** Resend is not configured and signup succeeds
- **THEN** the API still returns success and the email is skipped with a log

#### Scenario: Booking-approve user create does not send this welcome
- **WHEN** an admin approves a booking and the system creates a new portal user
- **THEN** the credentials invite path remains as today and this portal-signup welcome template is not required for that path

