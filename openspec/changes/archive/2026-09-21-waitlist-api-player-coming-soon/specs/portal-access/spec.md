## Purpose

Controls who can enter student vs facility-admin portal routes using the existing client auth stub, until real backend roles exist.

## MODIFIED Requirements

### Requirement: Student routes require session

Student portal routes under `/app/*` MUST require a signed-in stub session. Unauthenticated visitors MUST be redirected to login (or equivalent) without seeing portal content. When a student session is present, `/app/*` MUST render a Coming soon shell instead of the full student portal (overview, bookings, calendar, profile). Facility admin routes are unchanged by this requirement.

#### Scenario: Signed-out visitor hits /app
- **WHEN** a signed-out visitor opens `/app` or a student portal child route
- **THEN** they do not see student portal content and are sent to the login flow

#### Scenario: Auth still loading
- **WHEN** auth stub session resolution is still loading
- **THEN** portal content is not flashed; a stable loading shell is shown instead

#### Scenario: Signed-in student reaches /app
- **WHEN** a signed-in student opens `/app` or a student portal child route
- **THEN** they see a branded Coming soon shell (not overview, bookings, calendar, or profile content)

#### Scenario: Coming soon offers join and exit
- **WHEN** a signed-in student views the Coming soon shell
- **THEN** they can open Join the club and can navigate home or log out

## ADDED Requirements

### Requirement: Login form available for stub sessions

The `/login` route MUST present the stub email/password login form so members and staff can obtain a client session. `/login` MUST NOT be a members-only Coming soon page that blocks the form.

#### Scenario: Visitor opens login
- **WHEN** a visitor opens `/login`
- **THEN** they see the email/password login form and can submit credentials against the stub auth

#### Scenario: Student login lands on coming soon portal
- **WHEN** a student successfully signs in via stub login
- **THEN** they are routed to `/app` and see the Coming soon shell

#### Scenario: Admin login lands on admin portal
- **WHEN** an admin stub user successfully signs in via stub login
- **THEN** they are routed to `/admin` and the facility admin portal remains usable

### Requirement: Admin portal remains open

Facility admin routes under `/admin/*` MUST continue to require a stub admin role and MUST remain usable (not replaced by Coming soon) while the student portal is gated.

#### Scenario: Admin reaches waitlist while players gated
- **WHEN** a signed-in admin stub user opens `/admin/waitlist`
- **THEN** the facility admin Waitlist page renders (subject to portal-access admin gate)

## UNCHANGED (reference)

The following requirements from the prior `portal-access` capability remain in force without delta edits in this change: admin routes require admin stub role; marketing stays public.
