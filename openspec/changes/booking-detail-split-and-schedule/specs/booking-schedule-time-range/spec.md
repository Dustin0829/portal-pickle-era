## ADDED Requirements

### Requirement: Booking schedule uses start–end time range
Booking schedule labels in admin list rows, admin booking detail, and player booking detail SHALL format court (and other hour-based) slot selections as a start time through end time, where the end is one hour after the last selected slot start. The schedule line SHALL NOT append `· N hour(s)` on the same string as the time range.

#### Scenario: Single one-hour court slot
- **WHEN** a booking has slotIds `["06:00"]`
- **THEN** Schedule displays `6:00 AM – 7:00 AM` (or equivalent locale formatting of that window)

#### Scenario: Multi-hour contiguous slots
- **WHEN** a booking has slotIds `["06:00", "07:00"]`
- **THEN** Schedule displays a range from 6:00 AM through 8:00 AM (end of the last hour)

#### Scenario: Multi-court hours use min start and max end
- **WHEN** a court booking spans multiple courts whose slot hours union to `06:00` and `08:00`
- **THEN** Schedule displays from 6:00 AM through 9:00 AM (one hour after the latest start)

#### Scenario: Empty slots
- **WHEN** a booking has no slotIds
- **THEN** Schedule shows a Time TBD (or equivalent) placeholder without inventing a range

#### Scenario: Open Play non-contiguous display
- **WHEN** a booking plan is Open Play with multiple slot ids that are not a single contiguous court block
- **THEN** the UI MAY list session times in the existing Open Play style, but MUST NOT use the misleading single-start-plus-duration pattern (`6:00 AM · 1 hour`) for court rentals
