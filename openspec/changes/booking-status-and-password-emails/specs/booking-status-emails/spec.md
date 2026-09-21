## ADDED Requirements

### Requirement: Email on every booking approve
When an admin successfully sets a booking status to `approved`, the system SHALL attempt to send a branded booking-approved email to the booking’s customer email. The email SHALL include the player name and booking date (and reference when present). The approved email SHALL NOT include a temporary password. Newly created portal accounts on that approve SHALL still receive the existing credentials invite email in addition to the approved notice when Resend is configured.

#### Scenario: Existing player approved
- **WHEN** an admin approves a pending booking for an email that already has a user account
- **THEN** a booking-approved email is attempted to that address and no credentials invite is sent

#### Scenario: New player approved
- **WHEN** an admin approves a booking and a new student account is created
- **THEN** both a booking-approved email and the existing invite (temp password) email are attempted when Resend is configured

#### Scenario: Resend not configured
- **WHEN** Resend is not configured and an admin approves a booking
- **THEN** the booking status update still succeeds and approval/invite emails are skipped with a log (and existing invite warning behavior may still apply for new users)

#### Scenario: Provider failure does not roll back approve
- **WHEN** Resend returns an error after approve
- **THEN** the booking remains approved and the failure is logged (optional warning field may surface for invite path as today)

### Requirement: Email on every booking reject
When an admin successfully sets a booking status to `rejected`, the system SHALL attempt to send a branded booking-rejected email to the booking’s customer email, including name and booking date (and reference when present).

#### Scenario: Reject notifies player
- **WHEN** an admin rejects a pending booking
- **THEN** a booking-rejected email is attempted to the booking email and the status update succeeds even if email is skipped or fails

#### Scenario: Reject with Resend unset
- **WHEN** Resend is not configured and an admin rejects a booking
- **THEN** the booking is rejected and the email is skipped with a log

#### Scenario: Must not break credentials invite gating
- **WHEN** an admin approves a booking for an existing user
- **THEN** the credentials invite email is still skipped (no temp password email) while the approved status email is attempted
