## ADDED Requirements

### Requirement: Book a court opens advance booking

Marketing and homepage Book CTAs MUST display the label **Book a court** and MUST open the public court booking flow (booking modal), not Join the club / waitlist-only capture.

#### Scenario: Hero Book a court
- **WHEN** a visitor activates a marketing Book CTA that uses `BookingButton` (or equivalent) for court booking
- **THEN** the visible label is Book a court (or the call-site children, not Join the club) and the court booking modal opens

#### Scenario: Children label preserved
- **WHEN** a call site passes children such as Book a court to the shared booking CTA button
- **THEN** those children are rendered (the button MUST NOT hardcode Join the club over the children)

### Requirement: Earliest bookable date is opening day

Public court advance booking MUST only allow selecting court dates on or after **2026-10-05** (facility calendar date in PHT). Dates before that day MUST be disabled or rejected in the booking UI.

#### Scenario: Date before opening disabled
- **WHEN** a visitor opens the court booking schedule step before or after opening
- **THEN** calendar days earlier than 2026-10-05 cannot be selected for booking

#### Scenario: Opening day and later selectable
- **WHEN** a visitor selects 2026-10-05 or a later open court date with available slots
- **THEN** they can continue the booking payment steps for that date

#### Scenario: Default date respects opening floor
- **WHEN** the booking modal opens without a preset date and today is before 2026-10-05
- **THEN** the initial selected date is at least 2026-10-05 (not a pre-opening day)

#### Scenario: Calendar can navigate to opening month
- **WHEN** today is before 2026-10-05 and the visitor opens the booking schedule calendar
- **THEN** they can navigate forward to October 2026 (previous-month controls MUST NOT trap them only in the current pre-opening month)

#### Scenario: Opening date comparison uses YYYY-MM-DD
- **WHEN** the booking UI evaluates whether a day is bookable against opening day
- **THEN** it compares `YYYY-MM-DD` strings consistent with the app `dateKey` helper (facility calendar day 2026-10-05), not a floating datetime that shifts the calendar day

### Requirement: Successful booking registers a Players lead

After a successful public court booking that includes a valid email, the product app MUST upsert that person into the shared Players/waitlist lead store via the product API with source **booking**, without blocking the booking success UI if the upsert fails (booking success remains primary; lead sync failure is non-blocking with optional quiet log/toast).

#### Scenario: Booking success upserts player
- **WHEN** a visitor completes court booking with name and email
- **THEN** the app attempts POST to the product waitlist/players capture endpoint with `source: booking` and the booking confirmation still shows success

#### Scenario: Booking lead upsert fails softly
- **WHEN** the Players upsert fails after a successful local booking save
- **THEN** the visitor still sees booking success and is not forced into a hard error that undoes the booking

#### Scenario: Skip lead upsert without email
- **WHEN** a booking completes without a usable email
- **THEN** the app does not POST a Players capture for that booking and still shows booking success
