## Purpose

Gives facility staff a product admin UI to review pending bookings, view court occupancy, browse waitlist leads, and adjust stub pricing/slots/payment display settings — local/stub only until backend APIs exist. Distinct from the `support/` activity-logs app.

## ADDED Requirements

### Requirement: Admin portal routes

The product `app` MUST expose facility-admin routes under `/admin/*` including at least: bookings inbox, court day calendar, waitlist, and settings (prices / slots / GCash display fields).

#### Scenario: Open bookings inbox
- **WHEN** an admin opens the bookings inbox route
- **THEN** they see pending (and other stub statuses) booking rows with plan, date, court, slots, contact, GCash reference, and receipt filename

#### Scenario: Bookings inbox empty
- **WHEN** there are no stub bookings
- **THEN** the inbox shows an empty state (not a crash or silent blank)

#### Scenario: Approve or reject pending booking
- **WHEN** an admin approves or rejects a pending booking in the stub UI
- **THEN** that booking’s status updates in the local stub store and the inbox reflects the new status

#### Scenario: Court day calendar
- **WHEN** an admin opens the calendar for a selected date
- **THEN** they see courts and occupied slots derived from stub bookings for that date

#### Scenario: Waitlist list
- **WHEN** an admin opens the waitlist route
- **THEN** they see waitlist entries from the local waitlist store (email required; name/phone columns allowed even if empty)

#### Scenario: Waitlist empty
- **WHEN** the waitlist store has no entries
- **THEN** the waitlist page shows an empty state

#### Scenario: Stub settings
- **WHEN** an admin edits stub pricing, slot windows, or GCash display fields in settings
- **THEN** those values persist in a client stub store for the session/device and are available to portal UI (marketing hard-coded copy need not hot-reload in this change)

### Requirement: Distinct from support activity-logs

Facility admin under `/admin/*` in `app` MUST NOT replace or require the `support/` activity-logs SPA.

#### Scenario: Facility admin is product UI
- **WHEN** staff use facility admin bookings/waitlist screens
- **THEN** those screens live in the product `app` package routes, not the support activity-log viewer
