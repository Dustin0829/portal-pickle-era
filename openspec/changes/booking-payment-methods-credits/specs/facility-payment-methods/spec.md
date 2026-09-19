## ADDED Requirements

### Requirement: Admin manages multiple payment methods
Admin Settings Payment tab SHALL allow adding, editing, and removing payment methods. Each method SHALL include: channel/bank label (e.g. GCash, Maya, BDO), account name, account number, and an optional QR image (upload). At least one method SHOULD remain after deletes when possible; if the list is empty, booking pay UI SHALL fall back to built-in default GCash constants.

#### Scenario: Add payment method with QR
- **WHEN** an admin adds a method with label, name, number, and QR image and saves
- **THEN** the method appears in the list and is available in the booking pay carousel

#### Scenario: Remove payment method
- **WHEN** an admin removes a method and saves
- **THEN** that method no longer appears in the booking pay carousel

### Requirement: Booking pay carousel cycles methods
When the booking modal is on the pay step and cash payment is required (full or remainder), the UI SHALL show the active payment method’s QR (uploaded image, or generated fallback from account number), label, account name, and number. Previous and Next controls SHALL cycle methods when more than one exists.

#### Scenario: Next changes QR and account details
- **WHEN** two or more methods exist and the user clicks Next
- **THEN** QR, method label, account name, and number update to the next method

#### Scenario: Previous wraps
- **WHEN** the user is on the first method and clicks Previous
- **THEN** the last method is shown

#### Scenario: Wallet top-up uses the same methods
- **WHEN** a player opens Wallet top-up and multiple methods exist
- **THEN** Previous/Next cycles the same payment method details as booking pay
