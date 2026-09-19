## ADDED Requirements

### Requirement: Private court selection across multiple courts
For `plan: court`, the unified booking schedule SHALL allow the player to select Available cells on two or more courts in one selection without clearing other courts. Toggling a cell off SHALL remove only that court-hour. Selecting Open Play SHALL clear private multi-court selection (and vice versa).

#### Scenario: Add a second court without resetting the first
- **WHEN** the user has selected Court 1 at 10:00 and then selects Court 2 at 10:00
- **THEN** both court-hours remain selected

#### Scenario: Different hours on different courts
- **WHEN** the user selects Court 1 at 10:00 and Court 2 at 11:00
- **THEN** the selection contains both segments

#### Scenario: Toggle off one cell
- **WHEN** Court 1 10:00 and Court 2 10:00 are selected and the user toggles Court 1 10:00 off
- **THEN** only Court 2 10:00 remains selected

### Requirement: One booking row stores multiple courts
Creating a private court booking with multiple courts SHALL persist as **one** booking record that includes all selected courts and their hours — not N separate bookings and not a fan-out of creates.

#### Scenario: Create with two courts
- **WHEN** the client submits a court booking with Court 1 hours `[10:00]` and Court 2 hours `[10:00, 11:00]`
- **THEN** the API creates exactly one booking containing both courts’ hours

#### Scenario: Single-court create remains valid
- **WHEN** the client submits a court booking with only one court and one or more hours
- **THEN** the booking is created as today (backward compatible)

#### Scenario: Conflict on any court-hour rejects
- **WHEN** any selected court-hour overlaps a pending/approved booking on that court and date
- **THEN** create fails with a conflict and no booking row is written

### Requirement: Pricing counts court-hours
The amount due for a multi-court private booking SHALL be based on the total number of selected court-hour cells (sum of hours across courts), using the same unit price rules as single-court court rentals.

#### Scenario: Two courts one hour each
- **WHEN** unit price is ₱300 and the selection is Court 1 10:00 + Court 2 10:00
- **THEN** the billed hour count is 2 (₱600 before credits)

### Requirement: Occupancy and lists expose multi-court
Occupancy and booking list/detail DTOs SHALL expose all courts on a multi-court booking so the day grid can mark Taken/Pending on each court-hour and admin/player lists can show every court.

#### Scenario: Occupancy marks both courts
- **WHEN** a pending booking holds Court 1 and Court 2 at 10:00
- **THEN** occupancy for that date marks both court-hours as held

#### Scenario: Open Play unchanged
- **WHEN** the plan is open-play
- **THEN** create still uses session slot capacity (not multi-court private semantics)
