## ADDED Requirements

### Requirement: Single schedule modal for Open Play and court rent

Marketing booking and admin walk-in booking MUST use one unified schedule experience that presents Open Play sessions and private court availability for the selected date in the same view. Opening “Book a court” or “Join open play” (or admin walk-in book) MUST land on this same schedule UI — not a plan-locked modal that only shows one product type.

#### Scenario: Marketing CTAs open the same schedule

- **WHEN** a visitor opens booking from Court Rental or Open Play pricing CTAs
- **THEN** they see the unified schedule (Open Play sessions and private courts for a date), not two different modal layouts

#### Scenario: Admin walk-in uses the same schedule pattern

- **WHEN** an admin opens walk-in booking from bookings or calendar
- **THEN** the schedule UI shows Open Play and private courts together using the same day-grid + map pattern (admin pay/walk-in confirm flow may differ after selection)

### Requirement: Left court map and right day grid

The unified schedule MUST keep the facility court map (or equivalent court picture) on the **left** and a **day grid** on the **right** (responsive stacking allowed on narrow viewports with map above or below, but desktop MUST be map-left / grid-right). The day grid MUST use time rows and court columns (or an equivalent times × courts matrix).

#### Scenario: Desktop layout

- **WHEN** the schedule is viewed on a desktop-width viewport
- **THEN** the court map appears on the left and the day grid on the right

### Requirement: Day grid shows Open Play and private court cells

For the selected date, the day grid MUST show:

1. Open Play sessions for that day (start–end / capacity), bookable when seats remain and session is not past
2. Private court hour cells per court, bookable when free
3. Hours covered by a pending/approved Open Play booking as non-selectable private-court cells with yellow background, black text, and label **Reserved for Open play** (existing one-way overlap)

Selecting an Open Play session MUST produce an `open-play` booking selection. Selecting private court hour(s) MUST produce a `court` booking selection. The UI MUST NOT allow mixing Open Play and private court into one selection.

#### Scenario: Book Open Play from the grid

- **WHEN** the player selects an available Open Play session on the day grid and continues
- **THEN** the booking payload uses plan `open-play` with that session slot id

#### Scenario: Book private court from the grid

- **WHEN** the player selects one or more open private-court hour cells on a court and continues
- **THEN** the booking payload uses plan `court` with those hour slot ids and court id

#### Scenario: Open Play hours reserved on private courts

- **WHEN** Open Play has a pending or approved booking covering 7:00–9:00 on date D
- **THEN** private-court cells for `07:00` and `08:00` show **Reserved for Open play** (yellow/black) and are not selectable

#### Scenario: Cannot mix plans in one selection

- **WHEN** the user has an Open Play session selected
- **THEN** selecting a private court cell clears or replaces the Open Play selection (or is disabled) so only one plan remains selected

### Requirement: Schedule respects advance booking and load failures

The unified schedule MUST continue to enforce the existing advance-booking earliest date. If occupancy or Open Play capacity fails to load, the UI MUST show an error and MUST NOT present cells as falsely free.

#### Scenario: Advance booking floor still applies

- **WHEN** the visitor opens the unified schedule before the earliest bookable date window
- **THEN** dates before that floor remain unavailable (same rules as today’s marketing modal)

#### Scenario: Occupancy load failure

- **WHEN** occupancy or Open Play capacity fetch fails for the selected date
- **THEN** the grid shows an error state and does not treat all private hours as open

### Requirement: Clinic is not a bookable plan

New bookings MUST NOT offer or accept plan `clinic`. Pricing/marketing MUST NOT present a clinic book CTA. Admin settings MUST NOT expose clinic as a configurable bookable plan price. Existing stored clinic bookings (if any) MAY still display in admin/history lists.

#### Scenario: Pricing has no clinic book card

- **WHEN** a visitor views the pricing section
- **THEN** there is no clinic plan card that opens the booking modal

#### Scenario: API rejects new clinic creates

- **WHEN** a client submits a booking create with plan `clinic`
- **THEN** the API rejects the request as validation/conflict (4xx) and does not create a row

#### Scenario: Admin walk-in has no clinic option

- **WHEN** an admin opens walk-in booking
- **THEN** clinic is not listed as a selectable plan
