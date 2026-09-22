# admin-manual-wallet-credit Specification

## Purpose
Admin can search a player from Top-ups Inbox and credit their wallet immediately (Cash or Bank at the desk), without a GCash receipt pending row.

## Requirements

### Requirement: Manual top-up entry from Top-ups Inbox
An authenticated admin on the Top-ups Inbox SHALL be able to start a **manual top-up** flow (distinct from reviewing pending GCash top-ups). The flow SHALL let the admin search players by email, select a match, view a player summary, and add wallet credits.

#### Scenario: Open manual top-up
- **WHEN** an admin clicks the Top up / Manual top-up control on Top-ups Inbox
- **THEN** a search UI is shown for player email (or name+email search as designed)

#### Scenario: Search finds player
- **WHEN** the admin searches with a query that matches a student player email
- **THEN** matching player(s) are listed and selecting one shows profile summary: name, email, joined/created date, and bookings summary (count and/or recent list as designed)

#### Scenario: Search finds nobody
- **WHEN** the search matches no players
- **THEN** an empty state is shown and no credit action is available

### Requirement: Immediate admin credit
After a player is selected, the admin SHALL be able to enter a positive peso amount (within the same single-top-up maximum used for player GCash top-ups unless design documents a different cap), choose how the guest paid at the desk (**Cash** or **Bank**), and confirm **Add credits**. When **Bank** is selected, the admin SHALL pick one facility payment method (e.g. GCash, Maya, BDO). When **Cash** is selected, no further method list is required. The system SHALL increase that user’s wallet balance in the same transaction as a wallet ledger credit of type `top_up` with `referenceType: admin_manual`, and the ledger reference SHALL encode the payment channel (and bank/e-wallet label when Bank). No GCash receipt upload SHALL be required. The existing pending GCash approve/reject path SHALL remain unchanged.

#### Scenario: Successful credit via cash
- **WHEN** an admin confirms Add credits with a valid amount and Cash selected
- **THEN** the player’s balance increases by that amount, a ledger row is written with an admin_manual cash reference, and the UI confirms success

#### Scenario: Successful credit via bank method
- **WHEN** an admin confirms Add credits with a valid amount, Bank selected, and a facility method (e.g. GCash) chosen
- **THEN** the player’s balance increases and the ledger reference records that bank/e-wallet label

#### Scenario: Bank without method blocked
- **WHEN** Bank is selected but no facility method is chosen
- **THEN** Add credits is rejected with a clear validation error and balance is unchanged

#### Scenario: Cannot credit admin accounts
- **WHEN** the selected user is an admin (or non-student)
- **THEN** the credit is rejected and balance is unchanged

#### Scenario: Invalid amount
- **WHEN** the amount is zero, negative, or above the configured maximum
- **THEN** the credit is rejected with a clear validation error and balance is unchanged

#### Scenario: Non-admin cannot credit
- **WHEN** a non-admin session calls the manual credit API
- **THEN** the request is unauthorized and no balance change occurs

### Requirement: Must not break GCash inbox
Listing, approving, and rejecting pending GCash top-ups SHALL continue to work as today.

#### Scenario: Pending inbox still works
- **WHEN** an admin filters pending top-ups after this change
- **THEN** pending GCash rows still appear and can be approved or rejected as before
