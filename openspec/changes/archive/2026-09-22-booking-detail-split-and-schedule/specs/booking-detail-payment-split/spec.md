## ADDED Requirements

### Requirement: Booking detail shows split payment when credits applied
When a booking detail view displays payment information and `walletAppliedCents > 0`, the UI SHALL show the booking total, the wallet credits applied, and the remaining amount due via other payment (total − credits). Amounts SHALL be shown in pesos consistent with other wallet/booking money formatting. When `walletAppliedCents` is 0, the UI SHALL show a single amount equal to the booking total (no split rows).

#### Scenario: Partial credits plus cash
- **WHEN** an admin opens booking details for a ₱300 court hour with `walletAppliedCents` 20000
- **THEN** Payment information shows Total ₱300, Wallet credits ₱200, and Other payment ₱100

#### Scenario: Credits cover the full total
- **WHEN** an admin opens booking details where `walletAppliedCents` equals the booking total
- **THEN** Payment information shows Total and Wallet credits equal to that amount, and Other payment ₱0

#### Scenario: Missing credits field treated as zero
- **WHEN** a booking UI model has no credits value (legacy local fixture or occupancy row)
- **THEN** Payment information behaves as no-credits (single Amount / no Wallet credits row)

#### Scenario: No credits applied
- **WHEN** an admin opens booking details with `walletAppliedCents` 0
- **THEN** Payment information shows a single Amount equal to the booking total and does not show a Wallet credits row

#### Scenario: Credits reach the UI model
- **WHEN** the API booking DTO includes `walletAppliedCents`
- **THEN** the web booking request model used by detail sheets includes that value (not dropped at map time)

### Requirement: Player detail aligns on estimated total when credits present
When the player booking detail surface shows an estimated total and the booking has `walletAppliedCents > 0`, it SHALL NOT imply the player paid only the full total via the receipt channel without showing credits applied (at least Total vs Credits / Remaining, or equivalent clear split).

#### Scenario: Player sees credits on split booking
- **WHEN** a player opens details for a booking with credits applied and a cash remainder
- **THEN** the detail shows both the credit portion and the remaining cash portion (or labeled total + credits)
