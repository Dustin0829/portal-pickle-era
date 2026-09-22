## MODIFIED Requirements

### Requirement: Private objects by default
Stored objects MUST be treated as private. The system MUST NOT depend on a public CDN base URL for receipt access. Read access SHALL use short-lived presigned GET URLs issued by authorized API routes. Authorized callers for receipt downloads SHALL include facility admins **and** the relevant owner: booking owner (authenticated player matching `userId` and/or booking email) for booking receipts, and wallet top-up owner (`userId` match) for top-up receipts. Unauthenticated clients MUST NOT receive receipt download URLs.

#### Scenario: No public URL required
- **WHEN** storage is configured without a public base URL
- **THEN** upload presign still succeeds and returns a usable `uploadUrl` and `key`

#### Scenario: Booking owner can obtain receipt GET URL
- **WHEN** the authenticated booking owner requests a receipt download URL via the player booking receipt-url route
- **THEN** the system issues a short-lived presigned GET URL for that booking’s `receiptKey`

#### Scenario: Top-up owner can obtain receipt GET URL
- **WHEN** the authenticated top-up owner requests a receipt download URL via the player top-up receipt-url route
- **THEN** the system issues a short-lived presigned GET URL for that top-up’s `receiptKey`

#### Scenario: Stranger cannot obtain receipt GET URL
- **WHEN** an authenticated user who does not own the booking or top-up requests the corresponding player receipt download URL
- **THEN** the system does not issue a presigned URL
