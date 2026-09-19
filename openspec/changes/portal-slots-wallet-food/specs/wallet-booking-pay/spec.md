## ADDED Requirements

### Requirement: Apply wallet balance toward portal booking total

Authenticated players booking from the portal MUST be able to apply their wallet balance toward the booking total. Applied amount MUST be `min(balanceCents, totalCents)`. Remaining amount due MUST be shown in the UI (pesos) as cash/GCash to pay.

#### Scenario: Partial wallet cover

- **WHEN** a player with balance ₱500 books a total of ₱600
- **THEN** the UI shows ₱500 applied from wallet and ₱100 remaining to pay

#### Scenario: Full wallet cover

- **WHEN** a player with balance ≥ booking total books
- **THEN** remaining cash due is ₱0 and no GCash receipt is required for that booking

### Requirement: Debit wallet on approve (pending) or create (walk-in)

For public/portal bookings that start as `pending`, the system MUST store intended `walletAppliedCents` at create (clamped to `min(currentBalance, total)`) without debiting. The system MUST debit that amount in the same transaction as **admin approve**, using a conditional balance update. If balance is insufficient at approve time, approve MUST fail without approving or debiting. Admin walk-in bookings that are created already `approved` MUST debit in the create transaction. Concurrent debits MUST NOT overdraw.

#### Scenario: Pending create does not debit

- **WHEN** a logged-in player creates a pending booking with wallet apply
- **THEN** `walletAppliedCents` is stored and wallet balance is unchanged until approve

#### Scenario: Approve debits successfully

- **WHEN** an admin approves a pending booking with `walletAppliedCents` ≤ current balance
- **THEN** wallet balance decreases by that amount and the booking becomes approved

#### Scenario: Approve fails if balance spent elsewhere

- **WHEN** an admin approves but current balance is less than `walletAppliedCents`
- **THEN** approve fails, status stays pending, and no debit occurs

#### Scenario: Concurrent overdraw rejected

- **WHEN** two concurrent approve/debit operations would together exceed balance
- **THEN** at most one debit succeeds; the other fails without overdrawing

### Requirement: Guest marketing booking stays cash-only

Public (logged-out) marketing booking MUST NOT require or apply wallet. Wallet apply is portal/session-only.

#### Scenario: Guest books without wallet

- **WHEN** a guest submits a public booking
- **THEN** the flow remains GCash + receipt as today; no wallet debit fields are required

### Requirement: Booking DTO exposes wallet application

Booking create/response for portal flows MUST include applied wallet cents and remaining cash cents (or equivalent) so the UI can confirm what was charged.

#### Scenario: Response includes amounts

- **WHEN** a portal booking is created with wallet apply
- **THEN** the response includes the applied wallet amount and remaining cash due
