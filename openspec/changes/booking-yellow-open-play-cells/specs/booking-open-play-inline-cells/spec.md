## ADDED Requirements

### Requirement: Yellow schedule chrome accents
The unified booking schedule SHALL use Pickle Era yellow (not black/zinc-900) for the schedule header bar and the selected day on the horizontal date strip. Text on yellow SHALL remain readable (typically black). The center date summary chip MAY remain a contrasting light pill on the yellow header.

#### Scenario: Selected date strip uses yellow
- **WHEN** the booking schedule is shown with a selected date
- **THEN** the selected date-strip day uses yellow with readable text, not a black filled chrome

#### Scenario: Header bar uses yellow
- **WHEN** the booking schedule header is shown
- **THEN** the header bar background is yellow (not zinc-900/black)

### Requirement: Open Play in hour court cells only
The schedule SHALL NOT render separate Open Play rowspan/colspan rows. Covered Open Play hours SHALL appear in the normal hour × court grid for every court in the active Indoor/Outdoor group. Plan mode SHALL decide whether those cells select Open Play or private court.

#### Scenario: No separate Open Play band
- **WHEN** Open Play sessions exist for the selected date
- **THEN** the grid has no wide Open Play row spanning CRT columns above the hourly rows

#### Scenario: Open Play plan shows Open Play on Indoor courts
- **WHEN** Open Play plan is active, a session covers 7:00–9:00, and Indoor is selected
- **THEN** CRT 1, CRT 2, and CRT 3 cells for the covered hours show Open Play (not a separate band)

#### Scenario: Open Play plan shows Open Play on Outdoor courts
- **WHEN** Open Play plan is active, a session covers hours on the selected date, and Outdoor is selected
- **THEN** CRT 4, CRT 5, and CRT 6 cells for those covered hours show Open Play

#### Scenario: Private Court plan keeps court selectable on covered hours
- **WHEN** Private Court plan is active and an hour is covered by an Open Play session
- **THEN** court cells for that hour are privately selectable (Available) when free — not locked as Reserved for Open play

#### Scenario: Day with no Open Play sessions
- **WHEN** the selected date has no Open Play sessions configured
- **THEN** the grid shows only private court hour rows with no Open Play cells or bands

#### Scenario: Selecting Open Play cell selects the session
- **WHEN** Open Play plan is active and the user selects an Open Play cell for a session that is not full or past
- **THEN** selection becomes Open Play for that session (same session-id semantics as today)

#### Scenario: Multi-hour session selected on all covered hours
- **WHEN** Open Play plan is active, a session spans multiple `DAY_HOURS`, and it is selected
- **THEN** every covered hour×court Open Play cell for that session shows the selected state

#### Scenario: Full or past Open Play not selectable
- **WHEN** Open Play plan is active and a session is full or its start hour is past for the selected date
- **THEN** Open Play cells for that session are not selectable

#### Scenario: Private hold wins
- **WHEN** a court-hour has a pending or approved private hold
- **THEN** that cell shows Pending or Taken in both plan modes

#### Scenario: Non-covered hours stay private
- **WHEN** an hour is not covered by any Open Play session
- **THEN** court cells for that hour remain private Available / Taken / Past presentation as today
