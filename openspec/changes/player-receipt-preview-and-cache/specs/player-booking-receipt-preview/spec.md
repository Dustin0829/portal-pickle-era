## ADDED Requirements

### Requirement: Player can fetch own booking receipt URL
The system SHALL expose an authenticated endpoint (e.g. `GET /me/bookings/:id/receipt-url`) that returns a short-lived presigned GET URL for the booking’s private receipt object. The caller MUST own the booking under the same rules as `GET /me/bookings` (`userId` match and/or normalized email match). Admin `GET /admin/bookings/:id/receipt-url` SHALL remain available and unchanged in contract.

#### Scenario: Owner receives signed URL
- **WHEN** an authenticated player requests the receipt URL for a booking they own that has a non-null `receiptKey`
- **THEN** the response includes a short-lived download URL for that object

#### Scenario: Non-owner denied
- **WHEN** an authenticated player requests the receipt URL for a booking they do not own
- **THEN** the system responds with not-found or forbidden (no URL leaked) and does not issue a presigned URL

#### Scenario: Unauthenticated denied
- **WHEN** an unauthenticated client requests the player receipt URL
- **THEN** the request is unauthorized

#### Scenario: No receipt key
- **WHEN** the owned booking has no `receiptKey`
- **THEN** the system responds with not-found for the receipt (no empty URL)

#### Scenario: Storage unset
- **WHEN** S3 storage env is unset and an owner requests a receipt URL for a booking with `receiptKey`
- **THEN** the system fails with a clear configuration/validation error (same class as other presign/download failures)

### Requirement: Player booking detail previews receipt
When the player opens booking details for a booking with `receiptKey`, the My bookings UI SHALL fetch the player receipt URL and display an image or PDF preview. The UI MUST NOT claim “filename only” when a `receiptKey` exists and the URL load succeeds.

#### Scenario: Image receipt preview
- **WHEN** the player opens details for their booking with an image `receiptKey` and the signed URL loads
- **THEN** the payment-proof panel shows the receipt image

#### Scenario: Filename-only legacy row
- **WHEN** the booking has `receiptName` but no `receiptKey`
- **THEN** the UI may show the filename-only empty state (no false claim that a key exists)

#### Scenario: Signed URL load fails
- **WHEN** `receiptKey` is present but the receipt-url request or image load fails
- **THEN** the UI shows a clear load-failure state (not the filename-only copy)
