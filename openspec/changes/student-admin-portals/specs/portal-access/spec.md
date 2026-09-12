## Purpose

Controls who can enter student vs facility-admin portal routes using the existing client auth stub, until real backend roles exist.

## ADDED Requirements

### Requirement: Student routes require session

Student portal routes under `/app/*` MUST require a signed-in stub session. Unauthenticated visitors MUST be redirected to login (or equivalent) without seeing portal content.

#### Scenario: Signed-out visitor hits /app
- **WHEN** a signed-out visitor opens `/app` or a student portal child route
- **THEN** they do not see student portal content and are sent to the login flow

#### Scenario: Auth still loading
- **WHEN** auth stub session resolution is still loading
- **THEN** portal content is not flashed; a stable loading shell is shown instead

#### Scenario: Signed-in student reaches /app
- **WHEN** a signed-in student opens `/app`
- **THEN** the student portal renders

### Requirement: Admin routes require admin stub role

Facility admin routes under `/admin/*` MUST require a stub admin role (or equivalent client flag) in addition to a session. Non-admin signed-in users MUST NOT see admin portal content.

#### Scenario: Non-admin signed-in user hits /admin
- **WHEN** a signed-in user without the admin stub role opens `/admin`
- **THEN** they do not see facility admin content (redirect or forbidden UI)

#### Scenario: Admin stub user reaches /admin
- **WHEN** a signed-in admin stub user opens `/admin`
- **THEN** the facility admin portal renders

### Requirement: Marketing stays public

Public marketing and auth routes MUST remain reachable without a portal session.

#### Scenario: Marketing without login
- **WHEN** a visitor opens `/`
- **THEN** the marketing landing still renders without requiring portal auth
