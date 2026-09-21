## Context

Phase 1 shipped Open Play capacity. Approve today only updates `Booking.status` (`patchBookingStatus`) with no user provisioning or email. Better Auth signup exists (`signupWithBetterAuth`); seed uses fixed passwords via `hashPassword` + User/Account upsert — no temp-password helper yet. Uploads already support receipt presign (reuse for top-ups). No Resend/env for email. Student nav has Overview / Bookings / Calendar / Profile — add Wallet. Admin Bookings inbox is the UX template for top-ups.

**Rule/skill cites (do not paste rule text):**
- api: `backend/.cursor/rules/core/module-boundaries.mdc`, `api/http-api.mdc`, `api/response-contracts.mdc`, `api/role-based-access.mdc`, `data/database.mdc`, `data/concurrency.mdc`, `integrations/external-dependencies.mdc`, `integrations/file-uploads.mdc`, `ops/security-secrets.mdc`, `async/async-reliability.mdc`, `platform/platform-patterns.mdc`, `backend/.cursor/skills/add-external-integration/SKILL.md`, `add-feature-module/SKILL.md`
- web: `app/.cursor/rules/api/api-layer.mdc`, `pages/page-layout.mdc`, `security/route-protection.mdc`, `state/async-ui.mdc`, `forms/forms-and-drafts.mdc`, `copy/ui-microcopy.mdc`

## Goals / Non-Goals

**Goals:**
- Idempotent student create + Resend invite on booking approve (new users only)
- Wallet + pending top-up + admin credit once
- Document Resend env; graceful skip if unset
- Student Wallet tab + admin top-ups inbox

**Non-Goals:**
- Food orders / wallet spend (Phase 3+)
- “Already have an account” marketing email (skip credentials only)
- Changing admin walk-in create to send invites (optional follow-up; default: invite only on `patchBookingStatus` → approved for bookings that were pending)
- Server-side facility settings API

## Decisions

1. **Invite hook location** — Orchestrate in `patchBookingStatus` after successful status update when `status === "approved"` (same request). Prefer: transactional user upsert + booking.userId link; then best-effort email outside the DB success path so email failure does not roll back approve.
   - Alternative: BullMQ job after commit — better for retries; use if `async-reliability` / billable send guidelines require a job. Default for v1: inline send with try/catch + log; enqueue only if existing job infra is trivial to reuse.
   - **Send credentials only when a new User was created in this request** (`createdNewUser === true`). If email fails, do **not** auto-retry on a later approve (idempotent); ops can reset password manually / follow-up. Optional non-fatal `inviteEmailWarning` on the PATCH response (string | omit) for AdminBookingsPage toast.

2. **User create** — Mirror seed: Prisma User + credential Account with `better-auth/crypto` `hashPassword`; generate crypto-random temp password (never return in JSON). Normalize email like bookings/auth.

2b. **Portal URL in email** — Prefer new optional `PUBLIC_APP_URL` (SPA origin). If unset, derive from the first origin in `API_CORS_ORIGIN` or `BETTER_AUTH_URL` host mapping; document in `.env.example`. Email copy points players to login + optional forgot-password route (already in app).

3. **Walk-in / already-approved creates** — Do **not** send invite from `createAdminBooking` in this change (keeps scope to public pending → approve). Document as follow-up if ops want walk-in invites.

4. **Wallet module** — New `backend/src/modules/wallet/` (schema, routes for `/me/wallet`, `/admin/wallet/top-ups`). Credit on approve uses `$transaction` + update-where-status-pending (or equivalent) per `concurrency.mdc`.

5. **Amounts** — Store **cents** (`balanceCents`, `amountCents`). UI shows pesos; convert ×100. Cap single top-up (e.g. max ₱50,000 → 5_000_000 cents) in Zod to bound abuse; min 1 cent after conversion from UI pesos ≥ 1.

6. **Resend** — `src/lib/resend/` (or `email/`) client; env via `env.ts` only. MCP is ops-only, not runtime.

7. **GCash display** — Reuse `facilitySettingsStore` payment settings on student Wallet (same-browser caveat as prices).

8. **Deploy order** — API migrate + env first (or same release); then web Wallet/Admin UI.

## Risks / Trade-offs

- [Email deliverability / missing key] → Document env; approve still works; log skip
- [Temp password in email] → Force change-password copy; no password in API logs
- [Double-credit race] → Conditional status transition in transaction
- [Phase 1 PR not merged] → Branch Phase 2 from `main` after merge, or stack; do not mix Open Play unfinished work into this PR unless already on main
- [Invite only on patch approve] → Walk-ins approved at create get no email until follow-up

## Migration Plan

1. Prisma migrate Wallet + WalletTopUp
2. Ship API + Resend env on Railway
3. Ship web Wallet + Admin top-ups
4. Rollback: disable UI routes; stop credit path; tables can remain

## Open Questions

- None blocking — walk-in invite deferred by decision (3)
