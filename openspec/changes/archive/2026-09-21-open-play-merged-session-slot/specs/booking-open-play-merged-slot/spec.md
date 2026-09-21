## ADDED Requirements

### Requirement: One Open Play control per session window
For each configured Open Play session visible in the active Indoor/Outdoor group, the unified booking schedule SHALL render exactly one selectable Open Play control for that session (not one cell per court × covered hour). The control SHALL display capacity copy of the form `Open Play - {booked}/{capacity}` (or Full / Past when applicable). Selecting it SHALL apply the same session-id Open Play selection semantics as today (including toggle-off when the same session is selected again).

#### Scenario: Two-hour Indoor session is one button
- **WHEN** a session covers 7:00–9:00 (duration 2) and Indoor is selected
- **THEN** the grid shows one Open Play control for that session (not six Open Play cells across CRT 1–3 × two hours)

#### Scenario: Outdoor group also one button
- **WHEN** the same multi-hour session applies and Outdoor is selected
- **THEN** the Outdoor grid shows one Open Play control for that session (not six cells across CRT 4–6 × covered hours)

#### Scenario: Selected state is a single control
- **WHEN** a multi-hour Open Play session is selected
- **THEN** exactly one Open Play control shows the selected (yellow) state for that session in the active group

#### Scenario: Selecting the merged control selects the session
- **WHEN** the user activates the Open Play control for a session that is not full or past
- **THEN** selection becomes Open Play for that session id

#### Scenario: Full or past not selectable
- **WHEN** a session is full or its start is past for the selected date
- **THEN** the Open Play control is not selectable

### Requirement: Session time gutter spans full window
The time gutter for an Open Play session block SHALL show the full session window (e.g. start–end derived from start hour + `durationHours`), not consecutive one-hour labels for each covered `DAY_HOURS` row.

#### Scenario: Two-hour afternoon session label
- **WHEN** a session starts at 16:00 with `durationHours` 2
- **THEN** the time gutter for that Open Play block shows a single window covering 4–6 (e.g. `4PM–6PM` or equivalent), not separate `4PM–5PM` and `5PM–6PM` Open Play rows

#### Scenario: Continuation hours are not duplicate Open Play rows
- **WHEN** a multi-hour session has already rendered its merged block at the start hour
- **THEN** later covered hours do not render additional Open Play buttons for that session

### Requirement: Private court hours remain hourly outside Open Play
Hours not covered by an Open Play session SHALL continue to use per-court hourly Available / Taken / Pending / Past cells.

#### Scenario: Non-covered hour stays private
- **WHEN** an hour is not covered by any Open Play session
- **THEN** court cells for that hour remain private Available / Taken / Past as today

#### Scenario: Day with no Open Play sessions
- **WHEN** the selected date has no Open Play sessions configured
- **THEN** the grid shows only private court hour rows with no Open Play controls

#### Scenario: Hold on a covered hour does not split the band
- **WHEN** a court-hour under a session window has a pending or approved private hold
- **THEN** the schedule still shows one Open Play control for the session window (holds are not painted as separate Taken/Pending cells inside that band); booking create remains subject to API conflict rules
