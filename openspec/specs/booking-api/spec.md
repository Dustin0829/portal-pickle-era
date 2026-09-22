# booking-api Specification

## Purpose
Persist and expose court / Open Play / clinic bookings via public and authenticated APIs, including occupancy, admin review, and conflict rules.

## Requirements

### Requirement: Persist court bookings
The system SHALL store bookings in Postgres with plan (`court` | `open-play` | `clinic`), calendar date (`YYYY-MM-DD`), court id, one or more slot ids, guest name, email, optional `userId`, GCash/reference id, optional receipt metadata (`receiptName`, `receiptKey`, `receiptMimeType`), status (`pending` | `approved` | `rejected`), and timestamps.

#### Scenario: Public booking is created pending
- **WHEN** a client `POST /bookings` with a valid body for a court date on or after 2026-10-05 and non-overlapping slots
- **THEN** the system persists a booking with status `pending` and returns the booking DTO

### Requirement: Opening-date floor for public court bookings
The system MUST reject public creates whose `date` is before `2026-10-05` for plan `court`.

#### Scenario: Date before opening
- **WHEN** a client posts a public court booking with `date` earlier than 2026-10-05
- **THEN** the system responds with a validation error and does not create a row

### Requirement: Slot conflict detection
The system MUST reject creates that share any slot id with an existing **pending** or **approved** booking on the same `date` + `courtId`. Rejected bookings MUST NOT block slots.

#### Scenario: Overlapping pending booking
- **WHEN** a create request includes a slot already held by a pending booking on that court and date
- **THEN** the system responds with a conflict error and does not create a row

#### Scenario: Rejected booking frees the slot
- **WHEN** the only prior booking for a slot is `rejected`
- **THEN** a new create for that slot succeeds

### Requirement: Day occupancy for calendars
The system SHALL expose `GET /bookings/occupancy?date=YYYY-MM-DD` returning pending and approved bookings for that date with at least `id`, `courtId`, `slotIds`, `status`, `plan` (enough for day-grid blocking). Guest PII MAY be omitted on this endpoint.

#### Scenario: Occupancy for a date
- **WHEN** a client requests occupancy for a date that has two approved bookings
- **THEN** the response includes both bookings’ court and slot ids

### Requirement: Player lists own bookings
The system SHALL expose `GET /me/bookings` for an authenticated session, returning bookings owned by that user (`userId` match or email match).

#### Scenario: My bookings
- **WHEN** a logged-in student requests `GET /me/bookings`
- **THEN** only that student’s bookings are returned

#### Scenario: Unauthenticated my bookings
- **WHEN** a client calls `GET /me/bookings` without a valid session
- **THEN** the system responds `401`

### Requirement: Attach user on public create when logged in
When `POST /bookings` is made with a valid session, the system SHALL set `userId` from the session (and MAY prefer session email when body email is empty).

#### Scenario: Logged-in public create
- **WHEN** an authenticated student creates a public booking
- **THEN** the booking stores their `userId`

### Requirement: Admin list bookings
The system SHALL expose `GET /admin/bookings` (admin Basic Auth mount) returning a paginated list with optional `status` and `search` filters.

#### Scenario: List pending inbox
- **WHEN** an admin requests `GET /admin/bookings?status=pending`
- **THEN** the system returns only pending bookings for the page

### Requirement: Admin walk-in create
The system SHALL allow `POST /admin/bookings` to create an **approved** booking (walk-in / cash) with the same conflict rules as public create, without requiring the opening-date floor (admin may book any date for ops).

#### Scenario: Walk-in approved
- **WHEN** an admin posts a valid walk-in body
- **THEN** the booking is stored with status `approved`

### Requirement: Admin approve or reject
The system SHALL allow `PATCH /admin/bookings/:id` to set status to `approved` or `rejected`.

#### Scenario: Approve pending
- **WHEN** an admin patches a pending booking with status `approved`
- **THEN** the booking status becomes `approved`

#### Scenario: Reject pending
- **WHEN** an admin patches a pending booking with status `rejected`
- **THEN** the booking status becomes `rejected` and its slots become available for new creates

### Requirement: Admin list students
The system SHALL expose `GET /admin/users?role=student` (admin Basic Auth mount) returning paginated users with `id`, `name`, `email`, `role`, `createdAt` (no password fields).

#### Scenario: List students
- **WHEN** an admin requests students
- **THEN** only users with role `student` are returned

### Requirement: Players lead on public booking
After a successful public booking create with a non-empty email, the system SHOULD upsert a waitlist/Players entry with `source: booking`. Failure of that upsert MUST NOT roll back the booking.

#### Scenario: Soft-fail Players upsert
- **WHEN** public booking create succeeds but waitlist upsert throws
- **THEN** the booking response remains successful
