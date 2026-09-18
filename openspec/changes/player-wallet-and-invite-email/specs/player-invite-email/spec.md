## ADDED Requirements

### Requirement: Create student on booking approve when missing

When an admin sets a booking status to `approved`, if no User exists for the booking email (normalized), the system MUST create a student User with a credential Account and a generated temporary password. The booking MUST be linked to that user (`userId`) when created or if previously null. Temporary passwords MUST NOT appear in API responses.

#### Scenario: First approve creates student

- **WHEN** an admin approves a pending booking whose email has no existing User
- **THEN** a student User and credential Account are created, `booking.userId` is set, and the booking status is `approved`

#### Scenario: Existing user is reused

- **WHEN** an admin approves a booking whose email already has a User
- **THEN** no new User is created, `booking.userId` is set to that User if null, and status becomes `approved`

#### Scenario: Reject does not create users

- **WHEN** an admin rejects a booking
- **THEN** no User is created and no invite email is sent

### Requirement: Send invite credentials email via Resend

After a successful approve that created a new student, the system MUST send an email via Resend containing the portal login URL, the player email, the temporary password, and guidance to change the password after login. Sends MUST use `RESEND_API_KEY` and `EMAIL_FROM` from server env.

#### Scenario: New user receives credentials

- **WHEN** approve creates a new student in that request and Resend is configured
- **THEN** one invite email is sent to the booking email with portal URL, email, and temp password

#### Scenario: Existing user skips invite credentials

- **WHEN** approve finds an existing User for the email
- **THEN** the system MUST NOT send a credentials invite email (and MUST NOT regenerate a password)

#### Scenario: Email failed once does not resend on later approve

- **WHEN** a new student was created on a prior approve but invite email failed, and an admin patches `approved` again
- **THEN** the system MUST NOT regenerate the password or send another credentials invite

#### Scenario: Email failure does not undo approve

- **WHEN** user creation and approve succeed but Resend send fails
- **THEN** the booking remains approved, the User remains created, and the failure is logged (admin MAY see a non-fatal warning); the system MUST NOT roll back the approval solely due to email failure

#### Scenario: Missing Resend config

- **WHEN** `RESEND_API_KEY` or `EMAIL_FROM` is unset and a new student is created on approve
- **THEN** approve still succeeds; invite email is skipped; failure/skip is logged

### Requirement: Approve is idempotent for invites

Re-approving or repeating the invite path for the same booking/user MUST NOT create duplicate Users or re-send the same credentials email.

#### Scenario: Second approve is a no-op for invite

- **WHEN** a booking is already approved and an admin patches status to `approved` again (or the invite hook re-runs)
- **THEN** no duplicate User is created and no credentials invite is re-sent

### Requirement: Env documentation for Resend

`RESEND_API_KEY` and `EMAIL_FROM` MUST be documented in `backend/.env.example` and Railway deploy notes. Runtime MUST read them only through the backend env module (never from the SPA).

#### Scenario: Docs list required vars

- **WHEN** an operator configures production email
- **THEN** `.env.example` and Railway docs name `RESEND_API_KEY` and `EMAIL_FROM`
