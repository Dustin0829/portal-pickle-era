## ADDED Requirements

### Requirement: Live session keyed by date and Open Play slot
The system SHALL represent an Open Play live session uniquely by facility `date` (`YYYY-MM-DD`) and Open Play session `slotId` (existing facility session start id). Session status MUST be one of `UPCOMING`, `LIVE`, `COMPLETED`, `CANCELLED`.

#### Scenario: Session created for band
- **WHEN** staff opens or the system materializes a live session for a valid date and Open Play `slotId`
- **THEN** the session exists with status `UPCOMING` or `LIVE` as appropriate and is addressable by that date + slotId

#### Scenario: Invalid session key rejected
- **WHEN** a client requests a session with a missing/invalid date or empty slotId
- **THEN** the system responds with a validation error

### Requirement: Session status transitions
The system SHALL allow staff-authenticated transitions among session statuses according to operational rules: `UPCOMING` → `LIVE` → `COMPLETED`, and allow `CANCELLED` from `UPCOMING` or `LIVE` when staff cancels. Completed or cancelled sessions MUST NOT accept new check-ins or new game starts.

#### Scenario: Go live
- **WHEN** staff marks an `UPCOMING` session `LIVE`
- **THEN** the session status becomes `LIVE` and live board operations are allowed

#### Scenario: Complete session
- **WHEN** staff marks a `LIVE` session `COMPLETED` and no courts are `PLAYING`
- **THEN** active games cannot be started and check-in is rejected

#### Scenario: Complete blocked while games playing
- **WHEN** staff attempts to mark the session `COMPLETED` while any court is `PLAYING`
- **THEN** the system rejects the transition until those games are ended

### Requirement: Participants from approved Open Play bookings
The system SHALL attach session participants from bookings where `plan` is open-play, `status` is `approved`, `date` matches the session, and `slotIds` contains the session `slotId`. Pending bookings MUST continue to count toward seat capacity but MUST NOT become live participants until approved and checked in.

#### Scenario: Approved booking eligible
- **WHEN** an approved Open Play booking exists for the session date and slot
- **THEN** the player appears as a bookable participant eligible for check-in

#### Scenario: Pending excluded from live roster until approved
- **WHEN** only a pending Open Play booking exists for that seat
- **THEN** the player is not checked into the live rotation

### Requirement: Check-in gates the live queue
Booked participants MUST NOT enter the live UP NEXT / rotation queue until staff marks them checked in. Check-in MUST be allowed only while the session status is `LIVE`. Check-in MUST be idempotent for an already checked-in participant.

#### Scenario: Check in adds to queue
- **WHEN** staff checks in an approved participant during a `LIVE` session
- **THEN** the participant appears in the UP NEXT queue in fair order

#### Scenario: Not checked in stays off rotation
- **WHEN** an approved participant has not checked in
- **THEN** they MUST NOT be assigned to a court by automatic rotation

#### Scenario: Check-in rejected when not live
- **WHEN** staff attempts check-in while the session is `UPCOMING`, `COMPLETED`, or `CANCELLED`
- **THEN** the system rejects the check-in

#### Scenario: Repeat check-in is idempotent
- **WHEN** staff checks in a participant who is already checked in
- **THEN** the system does not duplicate queue entries

### Requirement: No-show and left session
Staff MUST be able to mark a participant `NO_SHOW` (never entered rotation) or `LEFT_SESSION` (removed from further assignment). Marked participants MUST NOT receive new automatic court assignments.

#### Scenario: No-show removed
- **WHEN** staff marks a booked participant no-show
- **THEN** they are excluded from check-in and rotation

#### Scenario: Left session not reassigned
- **WHEN** staff marks a checked-in participant left session
- **THEN** they are removed from UP NEXT and are not assigned to new games

### Requirement: Checked-in count visible
The live session summary MUST expose checked-in player count and session capacity context (max 30 seats from booking capacity).

#### Scenario: Summary counts
- **WHEN** a client reads the live session board
- **THEN** the response includes checked-in count and session identity (date, slot, status)
