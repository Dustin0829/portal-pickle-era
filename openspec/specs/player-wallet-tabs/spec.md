# player-wallet-tabs Specification

## Purpose
TBD - created by archiving change wallet-ledger-history. Update Purpose after archive.
## Requirements
### Requirement: Player Wallet page has Wallet and Transaction history tabs
The player `/app/wallet` page SHALL present two tabs: **Wallet** and **Transaction history**. The default tab SHALL be Wallet. Tab selection SHALL be keyboard reachable and labeled for assistive tech.

#### Scenario: Default tab is Wallet
- **WHEN** an authenticated player opens `/app/wallet`
- **THEN** the Wallet tab is selected and shows balance and the top-up flow

#### Scenario: Switch to Transaction history
- **WHEN** the player activates the Transaction history tab
- **THEN** the page shows their ledger entries (or an empty state) and hides the top-up form

### Requirement: Transaction history tab renders ledger rows
The Transaction history tab SHALL list the player's ledger entries newest-first, showing a human-readable type label, signed amount (credits vs debits visually distinct), optional reference context, and relative or absolute timestamp. Loading, empty, and error states SHALL follow the portal status pattern (no blank silent fail).

#### Scenario: History shows booking debit and top-up
- **WHEN** the player has a `top_up` credit and a `booking_debit` in their ledger
- **THEN** both appear in the history list with distinct labels and amounts

#### Scenario: Empty history
- **WHEN** the player has no ledger entries
- **THEN** the tab shows an empty state explaining that activity will appear here after top-ups or spends

#### Scenario: History load failure
- **WHEN** the history request fails
- **THEN** the tab shows an error with a retry control

