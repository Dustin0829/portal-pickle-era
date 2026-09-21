## ADDED Requirements

### Requirement: Expand Open Play sessions into court hours

The system MUST map each Open Play session to the set of hourly court slot ids it covers (e.g. session labeled 7:00–9:00 AM with start hour 7 MUST cover `07:00` and `08:00`). Each session MUST declare `durationHours` (default **2**). Admin-configured Open Play slots MUST store or default the same duration and use the same expansion rules. Cross-plan blocks apply when **any** pending/approved Open Play seat exists for that session (not only when the session is full).

#### Scenario: Two-hour morning session expands to two hours

- **WHEN** an Open Play session starts at hour 7 with `durationHours` 2
- **THEN** the covered court hour ids include `07:00` and `08:00`

#### Scenario: Single seat still blocks court hours

- **WHEN** only one Open Play booking exists for the 7:00–9:00 session on date D (capacity not full)
- **THEN** court hours `07:00` and `08:00` on date D remain blocked for court rental

### Requirement: Open Play blocks court hours

When a pending or approved Open Play booking exists for a date and session, court rental (and clinic if it uses hourly ids) MUST NOT accept bookings whose `slotIds` intersect the expanded hours of that session, on any court for that date (facility-wide block for those hours).

#### Scenario: Court hour blocked by Open Play

- **WHEN** Open Play has a pending or approved booking for the 7:00–9:00 session on date D
- **THEN** creating a court booking on date D that includes `07:00` or `08:00` is rejected as a conflict

#### Scenario: Non-overlapping court hour allowed

- **WHEN** Open Play has a booking only for the 7:00–9:00 session on date D
- **THEN** a court booking on date D for `10:00` only is allowed (subject to normal court exclusivity)

### Requirement: Court rental blocks overlapping Open Play sessions

When a pending or approved court (or clinic) booking occupies an hourly slot on a date, Open Play bookings for any session whose expanded hours intersect that slot MUST be rejected for that date (facility-wide), regardless of court id.

#### Scenario: Open Play blocked by court hour

- **WHEN** a court booking exists for date D at `08:00` on any court
- **THEN** creating an Open Play booking for the 7:00–9:00 session on date D is rejected as a conflict

### Requirement: Occupancy and UI reflect cross-plan blocks

Occupancy APIs and booking UIs (marketing modal and portal calendar) MUST treat cross-plan conflicts as unavailable so players cannot select blocked hours/sessions.

#### Scenario: Court UI hides blocked hour

- **WHEN** Open Play occupies 7:00–9:00 on date D
- **THEN** court rental UI for date D marks hours 7 and 8 as unavailable

#### Scenario: Open Play UI hides blocked session

- **WHEN** a court booking occupies `16:00` on date D
- **THEN** Open Play UI marks the 4:00–6:00 session unavailable on date D
