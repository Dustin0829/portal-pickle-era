## ADDED Requirements

### Requirement: Public waitlist capture persists to product API

The product API SHALL accept public waitlist submissions and persist them in Postgres. The product app marketing surfaces (Join the club and homepage newsletter) MUST submit through the shared product API client (`VITE_API_URL`), not localStorage as the source of truth for new captures.

#### Scenario: Join the club success
- **WHEN** a visitor submits a valid name, email, and optional phone via Join the club
- **THEN** the app POSTs to the product API waitlist endpoint and the entry is stored in Postgres with source indicating join-club capture

#### Scenario: Newsletter success
- **WHEN** a visitor submits a valid email on the homepage newsletter form
- **THEN** the app POSTs to the product API waitlist endpoint and the entry is stored in Postgres with source indicating newsletter capture

#### Scenario: Duplicate email upsert
- **WHEN** a visitor submits an email that already exists on the waitlist
- **THEN** the API upserts the existing row (updates provided fields) and does not create a second row for that email

#### Scenario: Invalid payload rejected
- **WHEN** a client POSTs a waitlist body with a missing or invalid email
- **THEN** the API responds with a validation error and does not persist a new row

### Requirement: Admin waitlist list via shared API

The product API SHALL expose an admin waitlist list on the shared product API, protected by the same Basic Auth admin-tools pattern as other `/admin/*` API tools (including production mount rules). The facility admin Waitlist page MUST request that list through the shared API client without embedding Basic Auth secrets in the Vite bundle, and MUST NOT treat localStorage as the primary list source.

#### Scenario: Authenticated admin list
- **WHEN** a client calls GET admin waitlist with valid Basic Auth credentials (when credentials are configured)
- **THEN** the API returns a paginated list of waitlist entries from Postgres (empty list when there are no rows)

#### Scenario: Admin Waitlist page shows API rows when allowed
- **WHEN** a signed-in facility admin opens `/admin/waitlist` and GET admin waitlist succeeds (e.g. local pass-through)
- **THEN** the page displays waitlist entries returned by the product API

#### Scenario: Admin Waitlist page when API list is unauthorized or unavailable
- **WHEN** a signed-in facility admin opens `/admin/waitlist` and GET admin waitlist fails with 401, 404, or network error
- **THEN** the page shows an ops-oriented empty or error state (not localStorage fixtures as the lead list) and does not claim success from browser-only storage

#### Scenario: Unauthenticated admin list when credentials configured
- **WHEN** Basic Auth credentials are configured and a client calls GET admin waitlist without valid credentials
- **THEN** the API rejects the request (401) and does not return waitlist rows

### Requirement: Shared product API host for waitlist clients

Marketing capture and admin waitlist list clients MUST use the same product API base URL configuration already used by the app (`VITE_API_URL` / shared API client). Waitlist MUST NOT introduce a separate backend host or third-party form backend for these surfaces. Future player-portal domain APIs MUST use this same product API host when unlocked (out of scope to implement here).

#### Scenario: Single API base for waitlist
- **WHEN** marketing Join the club and admin Waitlist call the backend
- **THEN** both use the configured product API base URL (same host as other product API features)

### Requirement: Capture failures are visible

When the product API rejects or cannot accept a waitlist capture, marketing forms MUST surface a failure to the visitor and MUST NOT report success based only on writing localStorage.

#### Scenario: API unavailable on Join the club
- **WHEN** Join the club submit fails because the product API is unreachable or returns an error
- **THEN** the visitor sees an error state and the UI does not present the submission as successfully saved to the club waitlist

#### Scenario: API unavailable on newsletter
- **WHEN** homepage newsletter submit fails because the product API is unreachable or returns an error
- **THEN** the visitor sees an error state and the UI does not present the email as successfully saved
