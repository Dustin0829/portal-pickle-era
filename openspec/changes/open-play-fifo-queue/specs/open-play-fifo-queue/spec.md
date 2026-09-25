## ADDED Requirements

### Requirement: FIFO order from approved Open Play bookings
The system SHALL compute an Open Play session queue from bookings where `plan` is open-play, `status` is `approved`, the booking’s `date` matches the request, and the booking’s `slotIds` array **contains** the requested session `slotId` (same membership rule as Open Play capacity counting). Players MUST be ordered by `createdAt` ascending; ties MUST break by booking `id` ascending. Pending and rejected bookings MUST NOT appear in the queue.

#### Scenario: Ordered roster
- **WHEN** an admin requests the FIFO board for a session with three approved bookings created at different times
- **THEN** the response lists those three players in ascending `createdAt` order

#### Scenario: Pending excluded
- **WHEN** a session has approved and pending Open Play bookings
- **THEN** only the approved bookings appear in the FIFO queue

#### Scenario: Empty session
- **WHEN** a session has no approved Open Play bookings
- **THEN** the board returns an empty queue (no courts assigned)

#### Scenario: Invalid query rejected
- **WHEN** an admin or player requests the board with a missing/invalid `date` or empty `slotId`
- **THEN** the system responds with a validation error and does not invent a board

### Requirement: Foursomes and sides by booking order
The system SHALL chunk the ordered queue into consecutive groups of four. Within each complete group of four, positions 1–2 MUST be one side and positions 3–4 the other side (partners/opponents by FIFO order, not random). Incomplete trailing groups (1–3 players) MUST be marked as sitting out / waiting for a full foursome.

#### Scenario: Full foursome sides
- **WHEN** the ordered queue has at least four players
- **THEN** the first group’s side A is players 1–2 and side B is players 3–4

#### Scenario: Remainder sits out
- **WHEN** the ordered queue has 5 approved players
- **THEN** players 1–4 form one foursome and player 5 is in the incomplete remainder (not assigned a court)

#### Scenario: Exactly thirty seats
- **WHEN** the ordered queue has 30 approved players
- **THEN** there are seven complete foursomes and a remainder of two; courts 1–6 take the first six foursomes and the seventh foursome is next-up

### Requirement: Assign foursomes to courts in facility order
The system SHALL assign complete foursomes to courts in facility order (Court 1 through Court 6) until courts or foursomes are exhausted. Additional complete foursomes beyond available courts MUST remain in a “next up” waiting list (still ordered). The system MUST NOT invent courts beyond the six facility courts.

#### Scenario: First wave on courts
- **WHEN** there are three complete foursomes and six courts
- **THEN** foursomes 1–3 are assigned to Courts 1–3 and no further courts are occupied for this wave

#### Scenario: More foursomes than courts
- **WHEN** there are eight complete foursomes
- **THEN** the first six are assigned to Courts 1–6 and the remaining two stay in next-up order

### Requirement: Admin can read the session FIFO board
The system SHALL expose an admin-authenticated endpoint that returns the computed FIFO board for a `date` and Open Play session `slotId`, including ordered players (booking id, name, queue index), foursomes with sides, court assignments, next-up groups, and remainder.

#### Scenario: Admin board OK
- **WHEN** an authenticated admin requests the board for a valid date and session slot
- **THEN** the response includes the computed queue structure described above

#### Scenario: Admin unauthenticated
- **WHEN** an unauthenticated client requests the admin board
- **THEN** the request is unauthorized

### Requirement: Player can see own queue position
For an authenticated player with an approved Open Play booking in the requested session, the system SHALL expose their queue index (1-based), foursome/court assignment if any, side if any, or remainder/next-up status. Players MUST NOT receive other players’ emails or payment fields beyond what is needed for on-court names (display name only).

#### Scenario: Player in first foursome
- **WHEN** a logged-in player who is 2nd in FIFO for the session requests their position
- **THEN** the response indicates queue index 2, side A (or equivalent), and Court 1 when that foursome is court-assigned

#### Scenario: Player not in session
- **WHEN** a logged-in player has no approved Open Play booking for that session
- **THEN** the system responds not-found or an empty membership payload (no fabricated position)

### Requirement: Admin Open Play board UI
The facility admin portal SHALL provide a board view for a selected date and Open Play session that displays the FIFO board (courts with sides, next up, remainder) using the admin API. Loading, empty, and error states MUST be distinct.

#### Scenario: Admin opens board
- **WHEN** an admin selects a date and Open Play session with approved bookings
- **THEN** they see court assignments and the ordered next-up / remainder lists

### Requirement: Player portal shows own place
When a player views an approved Open Play booking for a session that has a FIFO board, the portal SHALL show their queue position and court/side or waiting status without requiring a hard refresh after approve (query invalidation or refetch on open).

#### Scenario: Approved Open Play detail
- **WHEN** a player opens details for their approved Open Play booking
- **THEN** they see their FIFO place (index and court/side or waiting) from the player position API
