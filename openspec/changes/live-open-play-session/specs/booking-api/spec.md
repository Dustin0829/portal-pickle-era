## ADDED Requirements

### Requirement: Open Play booking reserves a session seat, not a court
The booking API SHALL continue to treat Open Play creates as session-seat reservations (`plan` open-play, shared capacity, `slotIds` membership) without requiring the customer to select Court 1–6. Court assignment for play belongs to the live Open Play session system after check-in.

#### Scenario: Open Play create without court choice
- **WHEN** a client creates an Open Play booking with a valid session slot and no private-court exclusive hold intent
- **THEN** the booking is persisted as an Open Play seat for that session and does not lock a single private court the way plan `court` does

### Requirement: Capacity unchanged with live sessions
Open Play seat capacity evaluation on create MUST continue to count pending and approved Open Play seats toward the existing capacity limit. Introducing live sessions, check-in, or rotation MUST NOT change that capacity contract.

#### Scenario: Capacity still counts pending and approved
- **WHEN** Open Play seat capacity is evaluated on create
- **THEN** pending and approved seats still count toward the existing capacity limit as before live sessions
