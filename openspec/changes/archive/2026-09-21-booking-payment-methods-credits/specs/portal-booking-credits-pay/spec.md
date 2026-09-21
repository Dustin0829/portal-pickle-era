## ADDED Requirements

### Requirement: Explicit Pay with credits on portal bookings only
When a booking is opened from the player portal (`allowCreditsPay`), the pay step SHALL offer an explicit choice between cash (payment-method carousel) and **Pay with credits**. Credits SHALL NOT auto-apply. Marketing / non-portal opens SHALL NOT show the credits option and SHALL send `walletAppliedCents: 0`.

#### Scenario: Default is cash
- **WHEN** a portal user reaches the pay step with a positive wallet balance
- **THEN** cash/GCash path is selected by default and no wallet amount is applied until they choose Pay with credits

#### Scenario: Partial credits plus cash
- **WHEN** the user selects Pay with credits, total is ₱600, and wallet balance is ₱500
- **THEN** `walletAppliedCents` is 50000, amount due via cash is ₱100, and receipt/reference are required for the cash remainder

#### Scenario: Credits cover full total
- **WHEN** the user selects Pay with credits and balance ≥ total
- **THEN** cash QR/receipt are not required and `walletAppliedCents` equals the total in cents

#### Scenario: Zero balance disables credits
- **WHEN** wallet balance is 0
- **THEN** Pay with credits is disabled or unavailable and cash path remains usable
