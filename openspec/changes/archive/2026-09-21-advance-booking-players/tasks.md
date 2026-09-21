## 1. api

- [x] 1.1 Add `booking` to Prisma `WaitlistSource` enum + migration (`backend/.cursor/rules/data/database.mdc`, `backend/.cursor/skills/prisma-cli/SKILL.md`)
- [x] 1.2 Extend waitlist Zod/OpenAPI create body to accept `newsletter` | `booking` | `join_club` (responses still return any stored enum) (`backend/.cursor/rules/api/api-evolution.mdc`, `http-api.mdc`)
- [x] 1.3 Update waitlist unit tests for `booking` source + upsert latest-source-wins (`backend/.cursor/rules/testing/node-testing.mdc`)
- [x] 1.4 Regenerate OpenAPI (`pnpm openapi:generate`) and commit `contracts/openapi.json`
- [x] 1.5 Mid-apply: `pnpm format:check && pnpm lint && pnpm typecheck` in `./backend`

## 2. web

- [x] 2.1 Restore `BookingButton` to open booking modal and render children (default Book a court) (`app/.cursor/rules/copy/marketing-copy.mdc`, `ponytail-rules.mdc`)
- [x] 2.2 Add `OPENING_DATE = "2026-10-05"` in booking lib; floor BookingModal day selection + allow month nav to opening month when still pre-open (`app/src/lib/booking/booking.ts`, BookingModal)
- [x] 2.3 Soft-fail Players upsert with `source: "booking"` after successful public booking when email present; skip when email empty (`app/.cursor/rules/api/api-layer.mdc`, `api-error-routing.mdc`)
- [x] 2.4 Mirror waitlist schema enum (`booking` | `newsletter` | legacy `join_club`) in `app/src/api/features/waitlist/` (`zod-validation.mdc`)
- [x] 2.5 Rename admin Waitlist → Players: nav, route `/admin/players`, redirect `/admin/waitlist`, page copy + source badges (`page-layout.mdc`, `ui-microcopy.mdc`)
- [x] 2.6 Update admin dashboard Waitlist labels/links to Players (`AdminDashboardPage`)
- [x] 2.7 Update FAQ / BookCta copy for advance booking from Oct 5 (not waitlist-first)
- [x] 2.8 Retire or flip `preSignup` so Book CTAs are not forced to Join the club
- [x] 2.9 Vitest: BookingButton label/modal; date floor + Oct month reachable pre-open; Players source badge / newsletter still posts (`vitest-testing.mdc`)
- [x] 2.10 Mid-apply: `pnpm format:check && pnpm lint && pnpm exec tsc -b --noEmit` in `./app`

## 3. plans

- [x] 3.1 Keep proposal / design / specs / tasks aligned if apply discovers gaps
- [x] 3.2 `openspec validate` for this change when artifacts edit

## 4. Ship

- [x] 4.1 Branch `feat/advance-booking-players` from repo root
- [x] 4.2 `/opsx-verify` (api + web `pnpm verify` + merge-readiness)
- [x] 4.3 `/opsx-pr` (one monorepo PR)
