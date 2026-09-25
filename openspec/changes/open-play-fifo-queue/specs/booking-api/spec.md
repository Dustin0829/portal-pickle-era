## ADDED Requirements

### Requirement: Open Play FIFO board endpoints
The booking API SHALL expose:

1. Admin: `GET` (admin auth) for Open Play FIFO board by `date` + session `slotId`, returning the computed board DTO (ordered players, foursomes/sides, court assignments, next-up, remainder).
2. Player: authenticated `GET` for the caller’s position in that session’s board when they own an approved Open Play booking for it.

Existing create, occupancy, capacity, and approve/reject contracts MUST remain unchanged. Pending Open Play bookings MUST continue to count toward seat capacity but MUST NOT appear on the play board until approved.

#### Scenario: Admin board endpoint
- **WHEN** an admin calls the Open Play FIFO board endpoint with a valid date and session slot
- **THEN** the system returns the computed board for approved open-play bookings only

#### Scenario: Player position endpoint
- **WHEN** an authenticated player with an approved Open Play booking in that session requests their position
- **THEN** the system returns their queue index and assignment/waiting status

#### Scenario: Capacity unchanged
- **WHEN** Open Play seat capacity is evaluated on create
- **THEN** pending and approved seats still count toward the existing capacity limit as before this change

#### Scenario: Occupancy and approve unchanged
- **WHEN** clients use occupancy, open-play-sessions counts, or admin approve/reject
- **THEN** those contracts behave as before this change (FIFO endpoints are additive)
