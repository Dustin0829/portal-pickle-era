## ADDED Requirements

### Requirement: Six-court live board
The system SHALL expose a live board for a session with six courts in facility order: Indoor Court 1–3 (`in-1`…`in-3`) and Outdoor Court 4–6 (`out-1`…`out-3`). Each court MUST have a state: `AVAILABLE`, `READY`, `PLAYING`, `GAME_OVER`, or `UNAVAILABLE`.

#### Scenario: Board lists six courts
- **WHEN** a client reads the live board for a `LIVE` session
- **THEN** the response includes all six courts with state and any active game players (display names)

#### Scenario: Unavailable court not assigned
- **WHEN** a court is `UNAVAILABLE`
- **THEN** automatic rotation MUST NOT assign a new game to that court

### Requirement: Active game with informational timer
An active game on a court MUST record start time and expose an elapsed duration for display. The timer MUST NOT automatically end the game or trigger rotation.

#### Scenario: Timer while playing
- **WHEN** a court is `PLAYING` with an active game
- **THEN** clients can derive elapsed time from the game start timestamp

#### Scenario: Timer does not auto-end
- **WHEN** elapsed time exceeds a typical game length
- **THEN** the system does not complete the game or rotate without an explicit end-game action

### Requirement: Player personalized status
For an authenticated player who is a participant in the session, the system SHALL expose a personalized status including at least: whether they are waiting or playing; rotation queue position when waiting; court id/label and side/partners when playing; and next-game hint when available.

#### Scenario: Waiting status
- **WHEN** a checked-in player is in UP NEXT and not on a court
- **THEN** their status indicates waiting and their 1-based queue position

#### Scenario: Playing status
- **WHEN** a player is on an active `PLAYING` game
- **THEN** their status indicates playing, court label, and the four players on that court (display names)

### Requirement: UP NEXT queue
The system SHALL maintain an ordered UP NEXT queue of checked-in participants who are not currently on a court and not marked left/no-show. Queue order MUST update on check-in, leave, assignment, and game completion.

#### Scenario: Queue order after check-in
- **WHEN** players check in in sequence
- **THEN** UP NEXT lists them in fair check-in / wait order as defined by rotation rules

### Requirement: End game with confirmation
Any of the four players currently assigned to an active game MAY request end-game; the client MUST require an explicit confirmation step before calling the API. Staff MAY end any active game. Ending MUST transition the game to completed and the court through `GAME_OVER` then rotation.

#### Scenario: Player ends own game
- **WHEN** a player on an active game confirms end game
- **THEN** the game completes exactly once and rotation runs for that court

#### Scenario: Non-participant cannot end
- **WHEN** a player not assigned to the active game attempts to end it
- **THEN** the system rejects the request

#### Scenario: Double complete rejected
- **WHEN** a second end-game request arrives for an already completed game
- **THEN** the system does not run rotation again

### Requirement: Fair queue rotation on game end
When a game completes, the system SHALL move the four finishers to the back of UP NEXT and assign the next four waiting players (if available) to that court (or leave the court `AVAILABLE` if fewer than four waiters). Within each newly assigned foursome, positions 1–2 vs 3–4 in queue order define sides. Concurrent end-game requests for the same game MUST NOT create duplicate rotations or duplicate assignments.

#### Scenario: Rotate after end
- **WHEN** Court 1’s game ends and at least four players are waiting
- **THEN** those four are assigned to Court 1 and the previous four are appended to UP NEXT

#### Scenario: Concurrent end is idempotent
- **WHEN** two end-game requests for the same game are processed concurrently
- **THEN** only one rotation occurs and player-court assignments remain consistent

### Requirement: Player Open Play live tab
The player portal Open Play tab MUST show the current live session when the player has an approved Open Play booking for that session (even before check-in): personalized status first (including not-checked-in), then live courts (stacked on mobile), then UP NEXT. WHEN the player has no approved Open Play booking for a relevant session, the tab MUST show that they have no Open Play schedule.

#### Scenario: Status-first layout
- **WHEN** a checked-in player opens the Open Play tab during a `LIVE` session
- **THEN** their status block appears before the full court grid

#### Scenario: Approved but not checked in
- **WHEN** an approved player who is not checked in opens the Open Play tab for a `LIVE` session
- **THEN** they can view the live board and a status indicating they are not yet checked in (not assigned)

#### Scenario: Mobile stacks courts
- **WHEN** the live board is viewed on a narrow viewport
- **THEN** court cards stack vertically rather than a cramped six-up grid
