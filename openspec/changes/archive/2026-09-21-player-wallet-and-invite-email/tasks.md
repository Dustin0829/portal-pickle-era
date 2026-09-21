## 1. api — invite on approve + Resend

- [x] 1.1 Add `RESEND_API_KEY` / `EMAIL_FROM` to `env.ts` + `.env.example` + `docs/railway-deploy.md` (`ops/security-secrets.mdc`)
- [x] 1.2 Add Resend client under `src/lib/` (`integrations/external-dependencies.mdc`, `add-external-integration/SKILL.md`)
- [x] 1.3 Helper: create student + hashed credential password (seed pattern); never return password in DTOs (`platform/platform-patterns.mdc`)
- [x] 1.4 Extend `patchBookingStatus`: on `approved`, upsert student, link `userId`, best-effort invite email only if `createdNewUser`; optional `inviteEmailWarning` on response; reject path unchanged (`core/module-boundaries.mdc`, `api/http-api.mdc`)
- [x] 1.5 Tests: new user + email attempted; existing user no invite; email fail keeps approved; missing env skips send; second approve no resend (`testing/`)
- [x] 1.6 OpenAPI regen/check for booking patch response + wallet routes (`api/response-contracts.mdc`)

## 2. api — wallet

- [x] 2.1 Prisma `Wallet` + `WalletTopUp` migrate (`data/database.mdc`)
- [x] 2.2 New `wallet` module: student GET/POST top-up; admin list + receipt URL + PATCH approve/reject (`add-feature-module/SKILL.md`, `api/response-contracts.mdc`, `api/role-based-access.mdc`, `integrations/file-uploads.mdc`)
- [x] 2.3 Approve credit in transaction; pending→approved once; no double-credit (`data/concurrency.mdc`)
- [x] 2.4 Tests: top-up pending; approve credits; reject no credit; concurrent approve (`testing/`)
- [x] 2.5 Mid-apply: `cd backend &&` kit `verify_fast`
- [x] 2.6 Full `cd backend && pnpm verify` + `backend/.cursor/skills/merge-readiness-check/SKILL.md` before ship

## 3. web — Wallet + admin inbox + approve UX

- [x] 3.1 API client + Zod for wallet endpoints (`api/api-layer.mdc`, `api/zod-validation.mdc`)
- [x] 3.2 Student Wallet page + nav in `StudentPortalLayout` (`pages/page-layout.mdc`, `security/route-protection.mdc`, `forms/forms-and-drafts.mdc`, `copy/ui-microcopy.mdc`)
- [x] 3.3 Top-up form: amount, GCash from facility payment settings, receipt upload (`state/async-ui.mdc`)
- [x] 3.4 Admin top-ups inbox (mirror Bookings) + nav (`pages/page-composition.mdc`)
- [x] 3.5 Surface non-fatal invite/email warning on booking approve if API returns one (`state/error-handling.mdc`)
- [x] 3.6 Vitest for wallet client/schema or page happy paths (`testing/vitest-testing.mdc`)
- [x] 3.7 Mid-apply: `cd app &&` kit `verify_fast`
- [x] 3.8 Full `cd app && pnpm verify` + `app/.cursor/skills/merge-readiness-check/SKILL.md` before ship

## 4. plans

- [x] 4.1 Keep proposal/design/specs/tasks aligned after any scope trim
- [x] 4.2 `openspec validate player-wallet-and-invite-email`

## 5. Ship

- [x] 5.1 `/opsx-verify` (api + web)
- [x] 5.2 `/opsx-pr` (branch `feat/player-wallet-and-invite-email`)
