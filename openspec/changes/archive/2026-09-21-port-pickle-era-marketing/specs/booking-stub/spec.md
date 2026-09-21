## Purpose

Provides client-only booking and waitlist capture in the product `app` (local storage / in-browser stubs) matching the standalone Pickle Era site, until real `backend` booking and waitlist APIs exist.

## ADDED Requirements

### Requirement: Booking modal stub

The product `app` MUST provide a booking modal reachable from marketing CTAs (Book / pricing flows). Completing a booking MUST record a pending booking request in browser storage and MUST NOT call the product API. The modal MUST support the source site’s plan choices (court, open-play, clinic) and required contact fields.

#### Scenario: Open booking from CTA
- **WHEN** a visitor activates a Book CTA on the marketing home
- **THEN** the booking modal opens

#### Scenario: Submit booking stub
- **WHEN** a visitor completes a valid booking in the modal
- **THEN** a pending booking request is stored locally and the UI shows a success / confirmation state

#### Scenario: Incomplete booking does not store
- **WHEN** a visitor attempts to submit the booking modal without required fields (per source validation)
- **THEN** no new booking request is stored and the UI keeps or shows validation feedback

#### Scenario: Close without submit
- **WHEN** a visitor dismisses the booking modal without submitting
- **THEN** no new booking request is stored

### Requirement: Waitlist stub

The Waitlist section on the marketing home MUST accept name and email (optional phone), persist the entry in browser storage keyed by email, and MUST NOT call the product API. Re-submitting the same email MUST update the existing local entry rather than creating duplicates. Empty name or email MUST NOT create an entry.

#### Scenario: Join waitlist
- **WHEN** a visitor submits a valid waitlist form
- **THEN** the entry is saved locally and the UI confirms success

#### Scenario: Same email updates entry
- **WHEN** a visitor submits the waitlist again with an email already stored locally
- **THEN** the local store keeps a single entry for that email with the latest details

#### Scenario: Empty waitlist fields rejected
- **WHEN** a visitor submits the waitlist without a name or without an email
- **THEN** no entry is stored and the UI shows validation feedback
