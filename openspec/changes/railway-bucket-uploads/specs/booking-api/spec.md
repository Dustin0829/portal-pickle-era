## ADDED Requirements

### Requirement: Admin receipt download URL
The system SHALL expose `GET /admin/bookings/:id/receipt-url` for product-admin access (same admin gate as other `/admin/bookings` routes). When the booking exists and has a non-empty `receiptKey`, the system MUST return `{ url, expiresAt }` where `url` is a short-lived presigned GET URL (TTL of five minutes) for that object key. The system MUST NOT return a permanent public object URL.

#### Scenario: Admin requests receipt URL
- **WHEN** a product admin calls `GET /admin/bookings/:id/receipt-url` for a booking that has `receiptKey` and storage is configured
- **THEN** the system responds `200` with `url` and `expiresAt` approximately five minutes ahead

#### Scenario: Booking without receipt
- **WHEN** a product admin calls `GET /admin/bookings/:id/receipt-url` for a booking with no `receiptKey`
- **THEN** the system responds `404` and does not issue a URL

#### Scenario: Booking not found
- **WHEN** a product admin calls `GET /admin/bookings/:id/receipt-url` with an unknown id
- **THEN** the system responds `404`

#### Scenario: Storage not configured
- **WHEN** a product admin calls receipt-url while S3 storage env is unset
- **THEN** the system responds with a configuration/validation error and does not issue a URL

#### Scenario: Non-admin denied when admin tools are protected
- **WHEN** Basic Auth admin protection is configured and a non-admin session (or no valid admin credentials) calls receipt-url
- **THEN** the system responds `401` or `403` and does not issue a URL

### Requirement: Receipt key is an object key
Booking `receiptKey` SHALL store the object storage key (or a stable private identifier), not a permanent public HTTPS URL. Clients MUST use the admin receipt download URL flow to preview receipts from private storage.

#### Scenario: Create booking with receipt key
- **WHEN** a public or admin booking create includes `receiptKey` from a successful upload
- **THEN** the persisted booking stores that key for later private download

#### Scenario: Create booking without receipt still works
- **WHEN** a client creates a booking without `receiptKey`
- **THEN** the booking is persisted and receipt-url later returns `404` for that booking
