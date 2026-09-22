# admin-calendar-day-bookings-only Specification

## Purpose
TBD - created by archiving change parking-socials-admin-manual-topup. Update Purpose after archive.
## Requirements
### Requirement: Admin calendar day sheet lists bookings only
When an admin taps a day on the admin court calendar, the system SHALL open a day sheet for that date that lists the bookings scheduled that day. The day sheet SHALL NOT present selectable open hours, available court-hour chips, or a walk-in / book-from-calendar action. Manual walk-in create SHALL remain available from the Admin Bookings page (existing Walk-in booking CTA), not from the calendar.

#### Scenario: Day click shows that day's bookings
- **WHEN** an admin clicks a day cell on the admin calendar
- **THEN** a day sheet opens for that date showing the bookings for that day (at least enough to identify each booking: e.g. name, court, time/schedule, status)

#### Scenario: Empty day
- **WHEN** an admin opens the day sheet for a date with no bookings
- **THEN** the sheet shows an empty state (e.g. no bookings for this day) and still does not offer open-hour selection or walk-in create

#### Scenario: No walk-in from calendar
- **WHEN** an admin uses the admin calendar (month grid or day sheet)
- **THEN** they cannot start a walk-in booking from that surface; walk-in remains on the Admin Bookings page

### Requirement: Month grid remains a booking-count overview
The admin calendar month grid SHALL continue to show per-day booking counts (or an equivalent “open” / “N bookings” summary) so staff can see load at a glance without using the calendar as a booking builder.

#### Scenario: Counts on month cells
- **WHEN** an admin views the admin calendar month
- **THEN** each day cell reflects how many bookings fall on that date (consistent with existing active-booking counting rules)

