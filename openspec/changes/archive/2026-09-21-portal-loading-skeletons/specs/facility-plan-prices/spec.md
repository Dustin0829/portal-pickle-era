## ADDED Requirements

### Requirement: Admin can save plan prices

The facility admin Settings page MUST provide a Save control for Plan prices. Editing price fields MUST NOT commit to the shared facility settings until Save succeeds. Unsaved edits MAY live in local draft state only.

#### Scenario: Save commits court, open play, and clinic prices

- **WHEN** an admin sets Plan prices for Court Rental, Open Play, and Clinics & Coaching and clicks Save
- **THEN** the saved prices are persisted in facility settings and a success acknowledgment is shown

#### Scenario: Typing alone does not publish

- **WHEN** an admin changes a price input but has not clicked Save
- **THEN** marketing Pricing and booking amount displays continue to use the last saved prices

### Requirement: Marketing pricing reflects saved plan prices

The marketing Pricing section MUST display the saved facility plan prices for court, open-play, and clinic (not hardcoded values that ignore Settings).

#### Scenario: Home pricing after save

- **WHEN** plan prices were saved in Settings and a visitor views the marketing Pricing section in the same browser
- **THEN** each plan card shows the corresponding saved peso amount

### Requirement: Booking flow uses saved plan unit prices

Public booking amount calculation and price copy in the booking modal MUST use the saved facility unit prices for the selected plan.

#### Scenario: Court rental total uses saved hourly rate

- **WHEN** the saved court price is ₱P per hour and a visitor selects N court hours in Book a Court
- **THEN** the displayed amount due is based on P × N (not a stale hardcoded court rate)

### Requirement: Settings copy matches behavior

Admin Settings MUST NOT claim that marketing pricing does not sync if Save publishes prices to marketing/booking UI in this app.

#### Scenario: Settings helper text

- **WHEN** an admin views the Settings page header or Plan prices section
- **THEN** copy indicates that saved plan prices apply to marketing Pricing and booking amounts in this browser
