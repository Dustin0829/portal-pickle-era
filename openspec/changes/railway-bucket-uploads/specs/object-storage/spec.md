## ADDED Requirements

### Requirement: S3-compatible storage configuration
The system SHALL configure object storage from S3-compatible environment variables suitable for Railway Buckets (`endpoint`, access key id, secret access key, bucket name, and region). Cloudflare R2-specific account-id endpoint construction MUST NOT be required.

#### Scenario: Storage configured
- **WHEN** all required S3 storage environment variables are set
- **THEN** the system can issue presigned upload and download URLs against that endpoint and bucket

#### Scenario: Storage unset
- **WHEN** required S3 storage environment variables are missing
- **THEN** attempts to create a presigned upload or download URL fail with a clear configuration/validation error (callers MAY soft-fail)

### Requirement: Presigned upload URLs
The system SHALL expose `POST /uploads/presign` that returns a server-generated object key and a short-lived presigned PUT URL. The client MUST upload the file directly to object storage. Object keys MUST be server-generated (not client-controlled paths). Allowed content types MUST be limited to `image/jpeg`, `image/png`, `image/webp`, and `application/pdf`.

#### Scenario: Successful presign
- **WHEN** a client posts a valid filename and an allowed content type and storage is configured
- **THEN** the response includes `key` and `uploadUrl` and omits any requirement for a permanent public object URL

#### Scenario: Reject disallowed content type
- **WHEN** a client requests a content type outside the allowlist
- **THEN** the system responds with a validation error and does not issue a presigned URL

#### Scenario: Presign when storage unset
- **WHEN** a client calls `POST /uploads/presign` while S3 storage env is unset
- **THEN** the system responds with a configuration/validation error (SPA callers MAY soft-fail and continue booking without a receipt file)

### Requirement: Private objects by default
Stored objects MUST be treated as private. The system MUST NOT depend on a public CDN base URL for receipt access. Read access SHALL use short-lived presigned GET URLs issued by authorized API routes.

#### Scenario: No public URL required
- **WHEN** storage is configured without a public base URL
- **THEN** upload presign still succeeds and returns a usable `uploadUrl` and `key`

### Requirement: Must not break existing booking APIs
Changing storage configuration MUST NOT alter booking create/list/patch contracts except for how clients obtain receipt previews (via receipt-url instead of a public URL).

#### Scenario: Booking APIs remain available
- **WHEN** storage env is unset
- **THEN** `POST /bookings`, `GET /me/bookings`, and admin booking list/patch continue to function without requiring uploads
