## 1. api

- [x] 1.1 Add Prisma `User`, `Session`, `Booking` (+ enums) and migration (`database.mdc`)
- [x] 1.2 Auth module: password hash helpers, session cookie create/clear, signup/login/logout/me/patch me (`platform-patterns.mdc`, `http-api.mdc`)
- [x] 1.3 Auth middleware `requireSession` for `/me/*` and `/auth/me` mutations; never return password hashes (`response-contracts.mdc`)
- [x] 1.4 Bookings module: schemas/mapper/service/controller/routes/openapi (`module-boundaries.mdc`)
- [x] 1.5 Public `POST /bookings` — opening-date floor, conflict transaction, optional session `userId`, soft Players upsert (`concurrency.mdc`)
- [x] 1.6 Public `GET /bookings/occupancy?date=` — pending/approved day blocks without guest PII
- [x] 1.7 Session `GET /me/bookings` — filter by `userId` or email
- [x] 1.8 Admin `GET/POST /admin/bookings`, `PATCH /admin/bookings/:id`, `GET /admin/users?role=student` behind Basic Auth mount
- [x] 1.9 Unit tests: auth signup/login/me; booking opening date, conflict, occupancy, my bookings 401, status patch (`node-testing.mdc`)
- [x] 1.10 Document cookie CORS / env in `backend/docs/environment.md` (session cookie name, Secure in prod)
- [x] 1.11 Regenerate OpenAPI (`pnpm openapi:generate`) and commit `contracts/openapi.json`
- [x] 1.12 Mid-apply: `pnpm format:check && pnpm lint && pnpm typecheck` in `./backend`

## 2. plans

- [x] 2.1 Keep proposal / design / specs / tasks aligned if apply discovers gaps
- [x] 2.2 `openspec validate` for this change when artifacts edit

## 3. Ship

- [x] 3.1 Branch `feat/booking-api` from repo root
- [x] 3.2 `/opsx-verify` (api `pnpm verify` + merge-readiness)
- [x] 3.3 `/opsx-pr` (one monorepo PR)
