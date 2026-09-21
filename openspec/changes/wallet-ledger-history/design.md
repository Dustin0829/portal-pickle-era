## Context

Today `Wallet.balanceCents` is mutated in three places without a shared audit trail:

1. **Top-up approve** — increment (`wallet.service.ts`)
2. **Booking approve** — decrement via `debitWalletForBooking` (`bookings.service.ts`)
3. **Food wallet pay** — decrement inline (`food.service.ts`)

Public booking create stores `walletAppliedCents` on the row but **does not** debit until approve, so pending bookings leave spendable balance in the wallet (double-spend risk). The player Wallet page lists recent top-ups only.

Applicable rules:

- `backend/.cursor/rules/core/ponytail-rules.mdc`, `module-boundaries.mdc`, `data/prisma-schema.mdc`, `api/rest-api-design.mdc`, `api/dto-mapping.mdc`, `testing/testing.mdc`
- `app/.cursor/rules/core/ponytail-rules.mdc`, `api/api-layer.mdc`, `pages/page-layout.mdc`, `state/error-handling.mdc`, `forms/accessibility.mdc`, `testing/vitest-testing.mdc`

## Goals / Non-Goals

**Goals:**

- One ledger helper used by wallet, bookings, and food for every balance change
- Debit booking credits at pending create; refund on reject; no second debit on approve
- Player Wallet UI with Wallet + Transaction history tabs backed by a real API

**Non-Goals:**

- Separate “held” vs “available” balance columns (hold = real decrement)
- Backfilling ledger rows for historical silent debits
- Admin-facing transaction browser
- Changing top-up payment UX beyond history labels

## Decisions

### Immediate debit as hold (not a second balance field)

Pending booking with credits decrements `balanceCents` now. Reject increments it back. Approve is a no-op for the wallet.

Alternatives considered: (a) `heldCents` column — clearer accounting but more UI/API surface; (b) keep debit-on-approve — rejects the user's product requirement. Immediate debit matches “credits disappear while pending.”

### Shared `applyWalletDelta` helper in the wallet module

Bookings and food MUST NOT open-code `updateMany` + ledger insert. Export something like `applyWalletDelta(tx, { userId, amountCents, type, referenceType, referenceId })` from `wallet.service` (or `wallet.ledger.ts`) that:

1. Upserts wallet
2. Atomically increments/decrements with `balanceCents: { gte }` for debits
3. Inserts `WalletLedgerEntry` with `balanceAfterCents`
4. Throws `ConflictError` on insufficient funds

### Prisma model `WalletLedgerEntry`

Fields: `id`, `userId`, `amountCents` (signed), `balanceAfterCents`, `type` enum (`top_up` | `booking_debit` | `booking_refund` | `food_debit`), `referenceType` (string/nullable), `referenceId` (nullable), `createdAt`. Index `(userId, createdAt desc)`.

### Legacy pending bookings at deploy

In-flight pending rows may have `walletAppliedCents > 0` **without** a prior debit. Approve/reject MUST be idempotent:

- **Approve:** debit only if no `booking_debit` ledger row exists for that booking id (legacy path); otherwise skip
- **Reject:** refund only if a `booking_debit` exists and no matching `booking_refund` yet

New creates always write `booking_debit` at create.

### Player history API

`GET /me/wallet/transactions?page=&limit=` (or `cursor`) returning DTOs mapped through Zod. Keep `GET /me/wallet` for balance + recent top-ups used by the Wallet tab; history tab uses the new endpoint so top-up pending rows stay out of the ledger until approved (top-up credit lands on approve only).

### Wallet page tabs

Client tabs on `/app/wallet` (Wallet | Transaction history). Reuse existing portal tab styling (settings-style pills or compact tabs). History tab: Query hook → list with loading/empty/error.

## Risks / Trade-offs

- **In-flight pending without debit** → Idempotent approve/reject rules above; document in release notes that only post-deploy bookings hold immediately
- **Double refund** → Guard with existing `booking_refund` for reference id
- **Food module coupling** → Import wallet helper only; no reverse imports from wallet → food
- **History empty for old spends** → Accepted; empty-state copy explains activity appears after new events

## Migration Plan

1. Deploy API with Prisma migrate for `wallet_ledger_entries`
2. Ship service changes (ledger helper, booking create/reject/approve, food debit, top-up credit, OpenAPI)
3. Deploy web tabs + history hook
4. Smoke: top-up approve → history credit; booking with credits → balance drops on pending; reject → restored; approve second booking path → no double debit

Rollback: revert app + API; ledger table can remain (append-only, unused).

## Open Questions

- None outstanding — food ledger inclusion and no historical backfill are recorded as assumptions in the proposal.
