## ADDED Requirements

### Requirement: Append-only wallet ledger on every balance change
The system SHALL record an append-only ledger entry for every wallet balance change in the same database transaction as the balance update. Each entry SHALL include: user id, signed amount in cents (positive = credit, negative = debit), resulting balance after the change, entry type, optional reference type and reference id, and created-at timestamp.

#### Scenario: Top-up approval writes a credit
- **WHEN** an admin approves a wallet top-up for ₱500
- **THEN** the player's balance increases by 50000 cents and a ledger entry of type `top_up` with amount +50000 and reference to that top-up id is created

#### Scenario: Insufficient funds do not write a partial ledger
- **WHEN** a debit is attempted for more than the current balance
- **THEN** the operation fails with a conflict, the balance is unchanged, and no ledger entry is written

#### Scenario: Ledger and balance stay consistent
- **WHEN** any successful wallet mutation completes
- **THEN** `balanceAfterCents` on the newest ledger entry equals the wallet's `balanceCents`

### Requirement: Player can list their transaction history
The product API SHALL expose an authenticated endpoint for the current player to list their own ledger entries newest-first. The response SHALL include type, signed amount, balance after, reference metadata when present, and created-at. A player SHALL NOT see another user's entries.

#### Scenario: Player lists recent transactions
- **WHEN** an authenticated player requests their transaction history
- **THEN** the API returns their ledger rows ordered by created-at descending

#### Scenario: Empty history
- **WHEN** an authenticated player has never had a balance-changing event under the ledger
- **THEN** the API returns an empty list (not an error)

#### Scenario: Food wallet pay writes a debit
- **WHEN** a player pays a food order with wallet for ₱120
- **THEN** the balance decreases by 12000 cents and a ledger entry of type `food_debit` with amount −12000 referencing the food order id is created

#### Scenario: Unauthorized
- **WHEN** an unauthenticated client requests transaction history
- **THEN** the API responds 401
