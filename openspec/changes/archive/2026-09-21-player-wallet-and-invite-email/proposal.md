## Why

Approved public bookings do not create portal accounts or notify players, so guests cannot log in after payment approval. Players also have no in-app balance for future spend (food, etc.). Phase 2 adds invite credentials email (Resend) on approve and a GCash top-up wallet with admin credit review.

## What Changes

- On admin **approve** of a public booking: if no Better Auth user exists for the booking email, create a **student** with a generated temporary password; send Resend email (portal URL, email, temp password, change-password guidance)
- Idempotent approve: do not recreate users or re-send invite credentials when the user already exists (optional short “already have an account” mail is allowed once documented; default = skip invite mail)
- Prisma: **Wallet** (`userId`, `balanceCents`) + **WalletTopUp** (amount, receipt, status pending/approved/rejected); credit balance **only** on admin approve; no double-credit
- Student portal: **Wallet** tab — balance, top-up any amount, GCash + receipt upload (reuse uploads)
- Admin: top-up inbox — Approve credits / Reject
- Env: `RESEND_API_KEY`, `EMAIL_FROM` documented in `.env.example` + Railway notes; approve remains usable if email fails (user created; email error logged / surfaced to admin without rolling back approval status unless design says otherwise — prefer: commit user+approve, then best-effort email)

## Capabilities

### New Capabilities

- `player-invite-email`: Create student on booking approve + Resend credentials email (idempotent)
- `player-wallet`: Wallet balance, player top-up with receipt, admin approve/reject credit

### Modified Capabilities

- (none — no main-spec baseline for these; new capabilities only)

## Impact

- **In scope:** `api` (`./backend`), `web` (`./app`), `plans` (this change)
- **Out of scope:** `support`; Food menu/orders (Phase 3); spending wallet on food/bookings; facility-settings API; Open Play capacity (Phase 1)
- Touches: `patchBookingStatus`, Better Auth / Prisma User+Account, new wallet module, Resend lib + env, StudentPortalLayout + Wallet page, Admin top-ups inbox, uploads reuse
- **Must not break:** booking reject; court/open-play create; existing approve without requiring Resend; uploads presign; student/admin auth gates
- **Deploy order:** migrate API (wallet tables + Resend env) before or with web; web Wallet/Admin UIs need API live. Prefer branch from `main` after Phase 1 merge
- Branch prefix: `feat/player-wallet-and-invite-email`
