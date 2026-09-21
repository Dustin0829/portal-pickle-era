## ADDED Requirements

### Requirement: Players admin surface for leads

The facility admin portal MUST present the lead roster as **Players** (not Waitlist) in navigation and page chrome. The page MUST continue to list leads from the product API admin waitlist/players list endpoint and MUST show each lead’s **source** as Newsletter or Booking (legacy Join the club rows MAY display as a third legacy label or map to Newsletter for display only).

#### Scenario: Admin nav label
- **WHEN** a facility admin uses the admin portal navigation
- **THEN** they see a Players item that opens the players lead list (route `/admin/players` or equivalent)

#### Scenario: Source badge visible
- **WHEN** the Players list loads API rows with sources `newsletter` and `booking`
- **THEN** each row indicates Newsletter or Booking so staff can tell how the lead was collected

#### Scenario: Keep collecting from newsletter
- **WHEN** a visitor submits the homepage newsletter form with a valid email
- **THEN** the app POSTs to the product capture endpoint with `source: newsletter` and the entry appears on Players when the admin list succeeds

### Requirement: Capture sources newsletter and booking

The product API waitlist/players capture schema MUST accept `source` values **`newsletter`** and **`booking`**. Primary marketing capture for new leads is newsletter and booking (not Join the club as the default path). Existing `join_club` rows MUST remain readable; new primary CTAs MUST NOT require Join the club.

#### Scenario: Newsletter source accepted
- **WHEN** a client POSTs a valid email with `source: newsletter`
- **THEN** the API upserts the lead with source newsletter

#### Scenario: Booking source accepted
- **WHEN** a client POSTs a valid email (and optional name) with `source: booking`
- **THEN** the API upserts the lead with source booking

#### Scenario: Legacy join_club still accepted
- **WHEN** a client POSTs a valid email with `source: join_club` (optional Join the club surface)
- **THEN** the API upserts the lead without rejecting the legacy source value

#### Scenario: Duplicate email latest source wins
- **WHEN** the same email is submitted again with a different allowed source
- **THEN** the API keeps a single row for that email and updates the source to the latest submission (latest write wins)

## MODIFIED Requirements

### Requirement: Public waitlist capture persists to product API

The product API SHALL accept public lead submissions and persist them in Postgres. The product app marketing surfaces (homepage newsletter and successful court booking lead sync) MUST submit through the shared product API client (`VITE_API_URL`), not localStorage as the source of truth for new captures. Join the club MUST NOT be the primary marketing capture path for this change.

#### Scenario: Newsletter success
- **WHEN** a visitor submits a valid email on the homepage newsletter form
- **THEN** the app POSTs to the product API waitlist/players endpoint and the entry is stored in Postgres with source indicating newsletter capture

#### Scenario: Booking lead success
- **WHEN** a visitor completes a public court booking with a valid email
- **THEN** the app POSTs to the product API waitlist/players endpoint and the entry is stored in Postgres with source indicating booking capture

#### Scenario: Duplicate email upsert
- **WHEN** a visitor submits an email that already exists on the lead list
- **THEN** the API upserts the existing row (updates provided fields and source) and does not create a second row for that email

#### Scenario: Invalid payload rejected
- **WHEN** a client POSTs a capture body with a missing or invalid email
- **THEN** the API responds with a validation error and does not persist a new row

### Requirement: Admin waitlist list via shared API

The product API SHALL expose an admin lead list on the shared product API, protected by the same Basic Auth admin-tools pattern as other `/admin/*` API tools (including production mount rules). The facility admin **Players** page MUST request that list through the shared API client without embedding Basic Auth secrets in the Vite bundle, and MUST NOT treat localStorage as the primary list source. API path MAY remain `/admin/waitlist` while the UI says Players.

#### Scenario: Authenticated admin list
- **WHEN** a client calls GET admin waitlist/players with valid Basic Auth credentials (when credentials are configured)
- **THEN** the API returns a paginated list of lead entries from Postgres (empty list when there are no rows)

#### Scenario: Admin Players page shows API rows when allowed
- **WHEN** a signed-in facility admin opens the Players route and GET admin list succeeds (e.g. local pass-through)
- **THEN** the page displays lead entries returned by the product API with source indicators

#### Scenario: Admin Players page when API list is unauthorized or unavailable
- **WHEN** a signed-in facility admin opens Players and GET admin list fails with 401, 404, or network error
- **THEN** the page shows an ops-oriented empty or error state (not localStorage fixtures as the lead list) and does not claim success from browser-only storage

#### Scenario: Unauthenticated admin list when credentials configured
- **WHEN** Basic Auth credentials are configured and a client calls GET admin list without valid credentials
- **THEN** the API rejects the request (401) and does not return lead rows
