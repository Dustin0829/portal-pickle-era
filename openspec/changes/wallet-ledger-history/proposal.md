## Why

Players who pay part of a booking with wallet credits still see the full balance while the booking is **pending**, so the same credits can be spent twice. Separately, the player Wallet page only lists top-ups — there is no history of booking debits, refunds, or food wallet spends. Both problems need a real wallet ledger and a clear hold-on-pending rule.

## What Changes

- **Wallet ledger:** Add a persistent ledger of every balance-changing event (top-up credit, booking debit on pending, booking refund on reject, food-order debit). Balance updates and ledger inserts happen in the same DB transaction.
- **Booking credits held on pending:** When a player creates a booking with `walletAppliedCents > 0`, debit that amount immediately while status is `pending`. On **reject**, credit it back. On **approve**, do **not** debit again (credits already left the wallet at create).
- **Player Wallet tabs:** Split `/app/wallet` into **Wallet** (balance + top-up) and **Transaction history** (ledger list, newest first).
- **API:** Expose ledger rows to the signed-in player (paginated or recent window). Wire top-up approve and food wallet pay through the same ledger helper.

## Capabilities

### New Capabilities

- `wallet-ledger`: Append-only wallet ledger entries written on every balance change; player-readable transaction history API
- `booking-wallet-hold`: Debit applied credits when a booking becomes pending; refund on reject; no second debit on approve
- `player-wallet-tabs`: Player Wallet page with Wallet and Transaction history tabs

### Modified Capabilities

- _(none — `openspec/specs/` has no archived main specs for wallet; deltas are additive)_

## Impact

- **Repos in scope:** `api` (`backend` — Prisma ledger model/migration, wallet + bookings + food services, OpenAPI, tests), `web` (`app` — Wallet page tabs, hooks/schemas, tests), `plans`
- **Out of scope:** `support`; admin transaction browser; reconstructing historical silent debits that predate the ledger; changing top-up UX beyond showing credits in history; multi-currency
- **Assumptions:** Hold = immediate balance decrement (not a separate “available vs held” field); no backfill of past food/booking debits; food wallet pays write `food_debit` ledger rows going forward; deploy API (migrate) before or with web
- **Must not break:** Top-up create/approve/reject; booking create without credits; admin walk-in (no wallet); food counter pay; double-spend guard when balance is insufficient at create
