## ADDED Requirements

### Requirement: Player selects a payment method before QR and account details

When the booking modal is on the cash-pay step (full amount or remainder after credits) and one or more facility payment methods exist from Admin Settings, the UI MUST first present a **method selection** (labels such as GCash, Maya, BDO — whatever methods are configured). The QR image, account name, account number, and amount instruction MUST NOT be the first pay-step surface when multiple methods exist (or when selection is required). After the player chooses a method, the UI MUST show that method’s QR and bank/account details for upload/submit proof.

#### Scenario: Multiple methods require a pick first
- **WHEN** Admin Settings has two or more payment methods and the player reaches booking pay
- **THEN** they see a list (or equivalent chooser) of method labels before any QR/account detail panel for a specific method

#### Scenario: Choosing a method reveals its QR and details
- **WHEN** the player selects a method (e.g. Maya)
- **THEN** the pay UI shows that method’s QR, account name, number, and amount hint, and hides the chooser (or moves to a details substep)

#### Scenario: Change method returns to chooser
- **WHEN** the player is viewing QR/details for a selected method and chooses to change method
- **THEN** they return to the method selection without losing the booking context (schedule, amount due, reference/upload fields may remain available on the details step)

#### Scenario: Single method may skip chooser
- **WHEN** exactly one payment method is configured
- **THEN** the UI MAY show that method’s QR/details immediately (no mandatory chooser), or still show a one-item chooser — either is acceptable

#### Scenario: Empty methods fall back
- **WHEN** no methods are configured
- **THEN** existing fallback/default payment presentation still applies (no broken empty chooser)

### Requirement: Wallet top-up uses the same select-then-details pattern

Wallet top-up MUST use the same payment-method selection → QR/details pattern as booking pay (not prev/next carousel as the primary discovery UX), using the same Admin Settings methods list.

#### Scenario: Wallet pick then details
- **WHEN** a player opens Wallet top-up with multiple facility payment methods
- **THEN** they select a method before seeing that method’s QR and account details
