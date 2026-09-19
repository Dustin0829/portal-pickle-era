## Context

Phase 2 introduces Wallet + top-ups. Phase 3 adds food ordering without POS. Student layout currently has Overview / Bookings / Calendar / Profile (+ Wallet from Phase 2). Admin has Bookings-style inboxes to mirror.

**Rule cites:** `backend/.cursor/rules/core/module-boundaries.mdc`, `data/database.mdc`, `data/concurrency.mdc`, `api/http-api.mdc`, `api/role-based-access.mdc`; `app/.cursor/rules/api/api-layer.mdc`, `pages/page-layout.mdc`, `security/route-protection.mdc`, `state/async-ui.mdc`, `copy/ui-microcopy.mdc`.

## Goals / Non-Goals

**Goals:**
- Stub menu + place order (items, qty, notes)
- Admin status pipeline pending → preparing → ready
- Wallet debit if balance enough; else counter pay

**Non-Goals:**
- Admin menu editor / inventory / kitchen printer
- GCash for food; tips; multi-venue
- Refunds / cancel-with-wallet-restore (follow-up; optional cancel without refund in v1)
- Spending wallet on court bookings

## Decisions

1. **Data model** — `FoodOrder` (userId, status, payMode `wallet`|`counter`, totalCents, notes, timestamps) + `FoodOrderLine` (orderId, menuItemId, name snapshot, unitPriceCents, quantity). Snapshot name/price at order time so stub menu edits do not rewrite history.

2. **Menu** — Code constant or `FoodMenuItem` seed table (prefer seed table if Prisma already migrating; else `src/modules/food/menu.ts` constant for speed). Document choice in tasks.

3. **Wallet debit** — Reuse Phase 2 Wallet in `$transaction`: conditional `balanceCents >= total` then decrement + create order. No separate ledger row required in v1 beyond balance change + order payMode (Follow-up: ledger entries).

4. **Status machine** — Only forward adjacent steps: `pending` → `preparing` → `ready`. Reject skips and reverse moves. No cancel/refund in v1.

5. **Apply order** — Implement **after** Phase 2 is on `main` (or stack branch). Counter-only mode must work even if debit helper is present.

6. **Deploy** — API then web; food module `backend/src/modules/food/`.

## Risks / Trade-offs

- [Phase 2 not merged] → Do not apply food debit until wallet exists; counter-only fallback
- [No refund on cancel] → Non-goal; ops handle manually
- [Stub menu drift] → Snapshot lines; CMS later

## Migration Plan

1. Migrate FoodOrder (+ lines / menu if table)
2. Ship API
3. Ship student Food + admin inbox
4. Rollback: hide nav; keep tables

## Open Questions

- None blocking — menu storage = code constant default for faster apply
