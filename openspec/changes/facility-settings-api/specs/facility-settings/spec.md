## ADDED Requirements

### Requirement: Shared facility settings are server-backed

The system MUST store facility plan prices, Open Play sessions, payment methods, and preSignup in the database. Client localStorage MUST NOT be the source of truth for these values after this change ships.

#### Scenario: Same settings on two devices

- **WHEN** an admin saves payment methods (or prices / Open Play sessions) from one browser
- **THEN** another browser or device loading the product reads the same saved values from the API

#### Scenario: Defaults when empty

- **WHEN** the database has no row yet (fresh migrate)
- **THEN** the API seeds or returns defaults matching current product defaults (court/open-play/clinic prices, default Open Play session hours, at least one GCash-style payment method)

### Requirement: Public read of booking-facing settings

Unauthenticated and authenticated clients MUST be able to read the settings needed to book and price (plan unit prices, Open Play sessions, payment methods with QR display URLs, and preSignup if still exposed).

#### Scenario: Guest opens booking pay

- **WHEN** a guest reaches the cash-pay step of the booking modal
- **THEN** they see payment methods from the shared facility settings (not only that browser’s localStorage)

#### Scenario: Pricing page uses API prices

- **WHEN** the marketing Pricing section loads
- **THEN** displayed plan prices come from the facility settings API (with safe fallback only if the request fails)

### Requirement: Admin updates facility settings

Authenticated admins MUST be able to update plan prices, Open Play sessions (start hour + durationHours), the payment methods list (label, account name, number, optional QR image key), and preSignup via the admin settings UI backed by the API.

#### Scenario: Admin saves prices

- **WHEN** an admin changes a plan price and saves
- **THEN** subsequent public reads and booking totals that use facility unit prices reflect the new value

#### Scenario: Admin configures Open Play sessions

- **WHEN** an admin updates Open Play session start hours and durations and saves
- **THEN** calendar / booking Open Play options and server occupancy/session logic use those sessions

#### Scenario: Admin manages payment methods with QR

- **WHEN** an admin adds or edits a method with label, name, number, and optional QR uploaded via presign
- **THEN** the method is stored server-side and booking/wallet pay UI can show that QR (signed URL or equivalent)

#### Scenario: Non-admin cannot write

- **WHEN** a non-admin calls the admin update settings endpoint
- **THEN** the request is rejected and settings are unchanged

#### Scenario: Empty payment methods list rejected

- **WHEN** an admin saves settings with zero payment methods
- **THEN** the API rejects the update and the previous methods list remains

#### Scenario: Invalid Open Play session rejected

- **WHEN** an admin saves an Open Play session with an invalid start hour or non-positive durationHours
- **THEN** the API rejects the update and sessions are unchanged

#### Scenario: Concurrent admin saves

- **WHEN** two admins PATCH facility settings without optimistic locking
- **THEN** the last successful write wins (no merge of partial fields across writers beyond normal PATCH semantics)

### Requirement: Booking and wallet use shared payment methods

Booking cash-pay and Wallet top-up MUST consume the same payment methods list from the facility settings API. Method selection UX (chooser then details when multiple methods exist; auto-select when only one) MUST continue to apply.

#### Scenario: Multiple methods require chooser

- **WHEN** two or more payment methods exist in facility settings
- **THEN** the pay UI asks the user to select a method before showing that method’s QR and account details

#### Scenario: Single method skips chooser

- **WHEN** exactly one payment method exists
- **THEN** the pay UI may show that method’s details without a multi-method chooser

### Requirement: Web removes persist as source of truth

The web app MUST stop persisting facility settings to `pickle-era-facility-settings` (or equivalent) as the authority. In-memory/React Query cache is allowed; reload MUST refetch from the API.

#### Scenario: Cleared localStorage still has settings

- **WHEN** a user clears site localStorage and reloads
- **THEN** facility prices, Open Play sessions, and payment methods still load from the API

#### Scenario: Settings GET fails

- **WHEN** the facility settings request fails
- **THEN** the UI shows an error or uses a short-lived hard-coded fallback for display only and MUST NOT write that fallback into localStorage as authority
