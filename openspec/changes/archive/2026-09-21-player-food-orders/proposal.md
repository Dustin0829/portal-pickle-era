## Why

Students need a simple way to order food/drinks at the facility; ops need an inbox to fulfill orders. Phase 3 adds a stub menu, place-order flow, and admin status pipeline—using wallet debit when Phase 2 balance exists, otherwise “pay at counter.”

## What Changes

- Student portal **Food** tab: stub/static menu, cart/order (items + notes), place order
- Admin **Food orders** inbox: statuses `pending` → `preparing` → `ready` (and optionally `cancelled` / `completed` if needed for cleanup)
- Payment: if wallet balance covers total, allow **wallet debit** on place; else **pay at counter** stub (no POS). No GCash for food in v1
- Depends on Phase 2 wallet APIs for debit; if wallet not yet deployed, ship counter-only pay mode behind the same order model

## Capabilities

### New Capabilities

- `player-food-orders`: Student food menu + place order; admin fulfill inbox; wallet or counter pay

### Modified Capabilities

- (none — wallet spend is additive to Phase 2; no main-spec baseline)

## Impact

- **In scope:** `api`, `web`, `plans`
- **Out of scope:** `support`; full POS; admin menu CMS (stub menu in code or simple seed); Open Play; invite email
- **Depends on:** Phase 2 `player-wallet` for wallet debit path (apply after Phase 2 merged or stack carefully)
- Branch prefix: `feat/player-food-orders`
- **Deploy order:** API food tables + debit helper after wallet migrate; then web Food tab + admin inbox
