## ADDED Requirements

### Requirement: Player wallet ledger model

The system MUST persist one Wallet per user (`userId` unique, `balanceCents` integer ≥ 0) and WalletTopUp rows (`userId`, `amountCents`, `receiptKey`/`receiptName`/`receiptMimeType`, `status` pending|approved|rejected, timestamps). Balance changes for top-ups MUST occur only inside an approve transaction that transitions pending → approved.

#### Scenario: Schema enforces one wallet per user

- **WHEN** the wallet schema is applied
- **THEN** `userId` on Wallet is unique and top-ups reference the owning user

### Requirement: Player wallet balance

Each student User MUST have at most one Wallet with a non-negative `balanceCents`. New wallets start at 0. Players MUST be able to read their own balance via an authenticated API.

#### Scenario: New wallet on first access

- **WHEN** a student opens Wallet and no Wallet row exists
- **THEN** the system creates a Wallet with `balanceCents` 0 (or returns 0 equivalently) for that user

#### Scenario: Player cannot read another wallet

- **WHEN** a student requests wallet data for another userId
- **THEN** the request is denied (403/404 as per API conventions)

### Requirement: Player can submit a wallet top-up

Authenticated students MUST be able to submit a top-up for any positive amount in cents, with GCash proof via receipt upload (reuse existing uploads allowlist). Top-ups start as `pending` and MUST NOT change balance until approved.

#### Scenario: Submit pending top-up

- **WHEN** a student submits a valid amount and receipt key
- **THEN** a WalletTopUp row is created with status `pending` and balance is unchanged

#### Scenario: Invalid amount rejected

- **WHEN** a student submits a non-positive amount
- **THEN** the request fails validation and no top-up is created

#### Scenario: Amount over max rejected

- **WHEN** a student submits an amount above the configured max (₱50,000 / 5_000_000 cents)
- **THEN** the request fails validation and no top-up is created

### Requirement: Admin approve credits balance once

Admins MUST review pending top-ups with receipt access. Approving a pending top-up MUST credit the player's wallet by the top-up amount exactly once. Rejecting MUST NOT credit. Re-approve of an already approved top-up MUST NOT double-credit.

#### Scenario: Approve credits once

- **WHEN** an admin approves a pending top-up of N cents
- **THEN** the top-up becomes `approved` and the wallet balance increases by N exactly once

#### Scenario: Reject does not credit

- **WHEN** an admin rejects a pending top-up
- **THEN** the top-up becomes `rejected` and balance is unchanged

#### Scenario: Concurrent approve does not double-credit

- **WHEN** two approve requests race on the same pending top-up
- **THEN** at most one credit is applied and the top-up ends as `approved` once

### Requirement: Authenticated wallet read and top-up APIs

The API MUST expose student-scoped endpoints to get wallet balance (and recent top-ups) and to create a pending top-up with receipt metadata. Endpoints MUST require an authenticated student session.

#### Scenario: GET wallet for self

- **WHEN** a student calls GET wallet (self)
- **THEN** the response includes `balanceCents` and a list of their recent top-ups

#### Scenario: POST top-up

- **WHEN** a student POSTs a valid top-up body with receipt key
- **THEN** a pending WalletTopUp is created and returned

### Requirement: Admin top-up review APIs

The API MUST expose admin endpoints to list top-ups (filter by status), fetch receipt download URL, and PATCH status to approved or rejected. Approve MUST be ledger-safe (conditional update / row lock) so double-credit cannot occur.

#### Scenario: List pending

- **WHEN** an admin lists top-ups with status=pending
- **THEN** only pending top-ups are returned with player identity fields needed for review

#### Scenario: Patch approve

- **WHEN** an admin PATCHes a pending top-up to approved
- **THEN** balance increases by amountCents and status is approved

### Requirement: Student and admin wallet UX

The student portal MUST expose a Wallet tab showing balance, top-up form (amount + GCash display from facility payment settings + receipt), and recent top-up status. Admin portal MUST expose a top-ups inbox (pending/all) with Approve/Reject and receipt preview, following existing bookings inbox patterns.

#### Scenario: Student Wallet tab

- **WHEN** a logged-in student opens the Wallet tab
- **THEN** they see their balance and can submit a top-up with receipt

#### Scenario: Admin top-ups inbox

- **WHEN** an admin opens the top-ups inbox and selects a pending top-up
- **THEN** they can view the receipt and Approve or Reject

### Requirement: No spending in this change

Wallet balance MUST NOT be deducted for bookings or food in this change. Spending is deferred to later phases.

#### Scenario: No debit endpoints

- **WHEN** this change ships
- **THEN** there is no player or admin API that spends wallet balance on bookings or food
