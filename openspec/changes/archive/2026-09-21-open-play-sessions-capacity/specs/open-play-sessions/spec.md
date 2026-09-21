## ADDED Requirements

### Requirement: Open Play default price and sessions

The product MUST default Open Play to ₱250 per session and to three 2-hour sessions per day with ids `07:00`, `16:00`, and `18:00` and labels `7:00–9:00 AM`, `4:00–6:00 PM`, and `6:00–8:00 PM` respectively. Session length MUST be two hours (end = start + 2h).

#### Scenario: Default catalog

- **WHEN** facility settings have not overridden open-play price or sessions
- **THEN** marketing Pricing and booking flows use ₱250 and the three default 2-hour sessions above

### Requirement: Admin can configure Open Play sessions

The facility admin Settings page MUST allow adding, editing, and removing Open Play sessions. Each session MUST have a start hour; the display label MUST reflect a 2-hour window. Edits MUST NOT publish until Save succeeds. Unsaved edits MAY live in draft state only.

#### Scenario: Save publishes sessions

- **WHEN** an admin sets Open Play sessions and clicks Save
- **THEN** the saved sessions are persisted in facility settings and a success acknowledgment is shown

#### Scenario: Typing alone does not publish

- **WHEN** an admin changes a session start time but has not clicked Save
- **THEN** booking modals continue to use the last saved sessions (or defaults)

#### Scenario: Stable session ids

- **WHEN** an admin sets a session start hour to H
- **THEN** the session id is the stable `HH:00` form for that hour

### Requirement: Shared capacity of 30 per Open Play session

For plan `open-play`, the system MUST treat bookings as shared session seats (not exclusive court holds). Capacity MUST be 30 players per date + session `slotId`. Pending and approved bookings MUST count toward capacity. Rejected bookings MUST NOT count.

#### Scenario: Register while seats remain

- **WHEN** fewer than 30 pending or approved open-play bookings exist for a date and slotId
- **THEN** a new open-play booking for that date and slotId is accepted (subject to other validations)

#### Scenario: Full session rejected

- **WHEN** 30 pending or approved open-play bookings already exist for a date and slotId
- **THEN** creating another open-play booking for that date and slotId fails with a conflict (or equivalent client-visible full error)

#### Scenario: Court exclusivity does not apply to open-play

- **WHEN** two open-play bookings share the same date and slotId but would have conflicted under court|slot exclusivity
- **THEN** both MAY succeed until capacity 30 is reached

### Requirement: Occupancy exposes Open Play seat counts

Clients MUST be able to obtain, for a selected date, each open-play session’s booked count and capacity (30) so the UI can show X/30 via **`GET /bookings/open-play-sessions?date=`** (additive; existing court occupancy endpoint MUST remain unchanged).

#### Scenario: Counts for a date

- **WHEN** a client requests open-play sessions for a date
- **THEN** the response lists per-slotId `bookedCount` and `capacity` of 30 for open-play pending/approved bookings on that date (slots with zero bookings MAY be omitted; the client treats missing as 0)

#### Scenario: Empty date

- **WHEN** a date has no open-play bookings
- **THEN** the response is an empty list (or empty items) and the UI shows 0/30 for catalog sessions

### Requirement: Booking UI shows X/30 and blocks full sessions

The public BookingModal (and admin Walk-in when creating open-play) MUST list open-play sessions from saved facility settings (fallback defaults), show booked/capacity as X/30, and MUST NOT allow selecting a full session.

#### Scenario: Partial fill

- **WHEN** a visitor opens Open Play booking for a date where a session has 12 seats taken
- **THEN** that session shows 12/30 and remains selectable

#### Scenario: Full session disabled

- **WHEN** a session is at 30/30
- **THEN** the session control is disabled and cannot be booked

#### Scenario: Capacity fetch fails

- **WHEN** open-play session counts cannot be loaded for the selected date
- **THEN** the UI shows an error (or disables session selection) and MUST NOT pretend seats are available

### Requirement: Open Play register and pay

Visitors MUST be able to select an open open-play session, pay via the existing GCash + receipt flow, and submit a pending booking without requiring multi-hour court selection. The server MUST NOT require the open-play `slotId` to match a server-side catalog (catalog is client settings); capacity is enforced by count only.

#### Scenario: Successful open-play submit

- **WHEN** a visitor selects a non-full open-play session, completes payment proof, and submits
- **THEN** a pending open-play booking is created for that date and slotId

#### Scenario: Concurrent full race

- **WHEN** two creates race for the last open-play seat on a date and slotId
- **THEN** at most one succeeds and the other receives a conflict error

### Requirement: Court rental conflict behavior unchanged

Court (and clinic) booking conflict rules MUST remain exclusive court|slot holds as today.

#### Scenario: Court still exclusive

- **WHEN** a court booking exists pending or approved for a date, courtId, and slotId
- **THEN** another court booking for the same date, courtId, and overlapping slotIds is rejected
