Branch: `feat/wallet-ledger-history`

## 1. api — ledger model and helper

- [x] 1.1 Add `WalletLedgerEntry` (+ enum for types) to `backend/prisma/schema.prisma` and generate a migration (`backend/.cursor/rules/data/prisma-schema.mdc`)
- [x] 1.2 Implement `applyWalletDelta` in the wallet module (tx-aware debit/credit + ledger insert + ConflictError on insufficient funds) (`backend/.cursor/rules/core/module-boundaries.mdc`)
- [x] 1.3 Use the helper on top-up **approve** credit (`wallet.service.ts`)
- [x] 1.4 Use the helper on food wallet pay debit (`food.service.ts`); leave counter pay unchanged
- [x] 1.5 Add Zod DTOs + `GET /me/wallet/transactions` (paginated, newest-first, auth required) and register OpenAPI (`backend/.cursor/rules/api/rest-api-design.mdc`, `dto-mapping.mdc`)
- [x] 1.6 Unit/integration tests for helper, top-up credit ledger, food debit ledger, and list transactions (`backend/.cursor/rules/testing/testing.mdc`)
- [x] 1.7 Run `pnpm format:check && pnpm lint && pnpm typecheck` in `backend`

## 2. api — booking wallet hold

- [x] 2.1 On public booking create with `walletAppliedCents > 0` and authenticated user, debit via `applyWalletDelta` (`booking_debit`) inside the create transaction (`bookings.service.ts`)
- [x] 2.2 On reject: if a `booking_debit` exists for the booking and no `booking_refund` yet, credit via `applyWalletDelta` (`booking_refund`)
- [x] 2.3 On approve: debit only when no prior `booking_debit` for that booking (legacy pending); otherwise skip wallet mutation
- [x] 2.4 Tests: pending create debits; reject refunds; approve no double debit; legacy approve debits once; legacy reject no-ops; second booking cannot reuse spent credits; booking without credits unchanged
- [x] 2.5 Run `pnpm verify` in `backend` (includes openapi generate if needed)

## 3. web — wallet tabs and history

- [x] 3.1 Add client schema + service + `useMeWalletTransactions` for `GET /me/wallet/transactions` (`app/.cursor/rules/api/api-layer.mdc`)
- [x] 3.2 Refactor `WalletPage` into Wallet | Transaction history tabs; default Wallet; a11y tablist (`app/.cursor/rules/forms/accessibility.mdc`, `pages/page-layout.mdc`)
- [x] 3.3 History tab: loading / empty / error / list with type label, signed amount, timestamp (`app/.cursor/rules/state/error-handling.mdc`, `copy/ui-microcopy.mdc`)
- [x] 3.4 Tests for tab switch, empty history, and debit/credit row rendering (`app/.cursor/rules/testing/vitest-testing.mdc`)
- [x] 3.5 Run `pnpm format:check && pnpm lint && pnpm exec tsc -b --noEmit` in `app`

## 4. plans

- [x] 4.1 Run `openspec validate wallet-ledger-history --strict`

## 5. Ship

- [x] 5.1 Run `pnpm verify` in `backend` and `app` + merge-readiness for both packages
- [x] 5.2 `/opsx-verify`
- [x] 5.3 `/opsx-pr` (API migrate before or with web; one monorepo PR)
