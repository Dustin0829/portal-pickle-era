## ADDED Requirements

### Requirement: Staff live dashboard
Authenticated facility admins SHALL access a live Open Play staff dashboard for a selected date and session that shows the same court board and UP NEXT queue as players, plus operational controls.

#### Scenario: Staff opens dashboard
- **WHEN** an admin opens the staff Open Play live view for a `LIVE` session
- **THEN** they see courts, queue, and staff actions

#### Scenario: Unauthenticated staff denied
- **WHEN** an unauthenticated client calls a staff live-session mutation
- **THEN** the request is unauthorized

### Requirement: Staff check-in and attendance controls
Staff MUST be able to check in eligible participants, mark no-show, and mark left-session from the dashboard.

#### Scenario: Staff check-in
- **WHEN** staff checks in an approved participant
- **THEN** the participant enters UP NEXT per session rules

### Requirement: Staff start and end games
Staff MUST be able to start a game on an eligible court (assign four waiting players or confirm a ready set) and end any active game without being a court participant.

#### Scenario: Staff ends any game
- **WHEN** staff ends an active game on Court 2
- **THEN** that game completes once and rotation runs for Court 2

### Requirement: Mark court unavailable
Staff MUST be able to mark a court `UNAVAILABLE` and clear unavailability when resolved. While unavailable, automatic assignment MUST skip that court and effective simultaneous capacity MUST reflect usable courts (4 players × usable courts).

#### Scenario: Court marked unavailable
- **WHEN** staff marks Court 3 unavailable during a live session
- **THEN** new automatic assignments skip Court 3

### Requirement: Manual override for assignment
Staff MUST be able to intervene when automatic rotation is insufficient: at minimum reassign waiting players onto an available/ready court and remove a player from a ready/playing set before start when safe. Advanced drag-reorder and arbitrary mid-game swaps MAY be deferred if called out in design, but staff MUST retain a path to correct mis-assignments without ending the whole session.

#### Scenario: Staff assigns foursome to available court
- **WHEN** staff assigns four waiting players to an `AVAILABLE` court and starts the game
- **THEN** the court becomes `PLAYING` with those four players
