## ADDED Requirements

### Requirement: Player can fetch own top-up receipt URL
The system SHALL expose an authenticated endpoint (e.g. `GET /me/wallet/top-ups/:id/receipt-url`) that returns a short-lived presigned GET URL for the top-up’s private receipt object. The caller MUST own the top-up (`userId` equals the authenticated user). Admin `GET /admin/wallet/top-ups/:id/receipt-url` SHALL remain available and unchanged in contract.

#### Scenario: Owner receives signed URL
- **WHEN** an authenticated player requests the receipt URL for a top-up they own that has a non-null `receiptKey`
- **THEN** the response includes a short-lived download URL for that object

#### Scenario: Non-owner denied
- **WHEN** an authenticated player requests the receipt URL for a top-up they do not own
- **THEN** the system responds with not-found or forbidden (no URL leaked) and does not issue a presigned URL

#### Scenario: Unauthenticated denied
- **WHEN** an unauthenticated client requests the player top-up receipt URL
- **THEN** the request is unauthorized

#### Scenario: No receipt key
- **WHEN** the owned top-up has no `receiptKey`
- **THEN** the system responds with not-found for the receipt (no empty URL)

#### Scenario: Storage unset
- **WHEN** S3 storage env is unset and an owner requests a top-up receipt URL with `receiptKey`
- **THEN** the system fails with a clear configuration/validation error (same class as other download failures)

### Requirement: Player Wallet previews top-up receipt
When the player views a top-up that has `receiptKey` on the Wallet page, the UI SHALL fetch the player top-up receipt URL and display an image or PDF preview (inline or sheet). The UI MUST NOT imply a successful image preview when only a filename exists without a key, or when the URL load fails.

#### Scenario: Image top-up receipt preview
- **WHEN** the player opens preview for their top-up with an image `receiptKey` and the signed URL loads
- **THEN** the receipt image is shown

#### Scenario: Filename-only top-up
- **WHEN** the top-up has `receiptName` but no `receiptKey`
- **THEN** the UI may show filename-only / no-preview state without claiming a stored image

#### Scenario: Top-up signed URL load fails
- **WHEN** `receiptKey` is present but the receipt-url request or media load fails
- **THEN** the UI shows a clear load-failure state
