# booking-wallet-hold Specification

## Purpose
TBD - created by archiving change wallet-ledger-history. Update Purpose after archive.
## Requirements
### Requirement: Debit applied credits when booking becomes pending
When an authenticated player creates a booking with `walletAppliedCents > 0`, the system SHALL debit that amount from their wallet in the same transaction as booking create (status `pending`), and SHALL write a ledger entry of type `booking_debit` referencing the booking id. The debit amount SHALL NOT exceed the lesser of requested credits, current balance, and booking total.

#### Scenario: Partial credits on pending booking
- **WHEN** a player with ₱500 balance creates a ₱600 court booking applying ₱500 credits and a receipt for the remainder
- **THEN** the booking is pending with `walletAppliedCents` 50000, the wallet balance becomes 0, and a `booking_debit` ledger entry for −50000 exists for that booking

#### Scenario: Insufficient balance at create
- **WHEN** a player requests more wallet credits than their current balance
- **THEN** the applied amount is clamped to the available balance (existing clamp behavior) and only that amount is debited

#### Scenario: Booking without credits unchanged
- **WHEN** a player creates a booking with `walletAppliedCents` 0 or omitted
- **THEN** the wallet balance is unchanged and no booking ledger entry is written

### Requirement: Refund credits when a pending booking is rejected
When an admin rejects a pending booking that has `walletAppliedCents > 0`, the system SHALL credit that amount back to the player's wallet in the same transaction as the status update, and SHALL write a ledger entry of type `booking_refund` referencing the booking id. Rejecting a booking with zero applied credits SHALL NOT change the wallet.

#### Scenario: Reject restores balance
- **WHEN** an admin rejects a pending booking that applied ₱500 credits
- **THEN** the player's balance increases by 50000 cents and a `booking_refund` ledger entry for +50000 exists for that booking

#### Scenario: Reject without credits
- **WHEN** an admin rejects a pending booking with `walletAppliedCents` 0
- **THEN** the wallet balance is unchanged

### Requirement: Approve does not debit wallet credits again
When an admin approves a pending booking that already had credits debited at create, the system SHALL NOT debit `walletAppliedCents` again.

#### Scenario: Approve after pending debit
- **WHEN** a pending booking with applied credits (already debited) is approved
- **THEN** the wallet balance is unchanged by the approve step and no second `booking_debit` is written for that booking

#### Scenario: Approve legacy pending without prior debit
- **WHEN** an admin approves a pending booking that has `walletAppliedCents > 0` but no `booking_debit` ledger row (created before hold-on-pending shipped)
- **THEN** the system debits `walletAppliedCents` once and writes a `booking_debit` ledger entry

#### Scenario: Reject legacy pending without prior debit
- **WHEN** an admin rejects a pending booking with `walletAppliedCents > 0` but no `booking_debit` ledger row
- **THEN** the wallet is unchanged (nothing was held)

#### Scenario: Double-spend blocked while pending
- **WHEN** a player has ₱500, creates a pending booking that debits ₱500, then attempts another booking applying ₱500
- **THEN** the second booking cannot apply those credits (clamped to 0 / insufficient) because the balance is already 0

