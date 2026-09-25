Branch: `feat/live-open-play-session`

## 1. api

- [x] 1.1 Prisma models + migration for live session, participants, court state, games, queue (`data/database.mdc`, `core/module-boundaries.mdc`)
- [x] 1.2 Session service: get-or-create by date+slotId, status transitions UPCOMING/LIVE/COMPLETED/CANCELLED (`api/http-api.mdc`, `api/response-contracts.mdc`)
- [x] 1.3 Participants from approved Open Play bookings; check-in, no-show, left-session (`core/ponytail-rules.mdc`)
- [x] 1.4 Live board read DTO: six courts, states, active game + start time, UP NEXT, checked-in count
- [x] 1.5 Start game + transactional end-game with fair rotation; concurrent end idempotent (`data/concurrency.mdc`)
- [x] 1.6 Staff mutations: court unavailable, assign foursome to available court, staff end any game
- [x] 1.7 Me endpoints: board + personalized status; end own game (membership + reject non-participants)
- [x] 1.8 Optional: seed first wave from existing FIFO builder when session goes LIVE
- [x] 1.9 Node tests: check-in gate + idempotent check-in, rotation sides, concurrent end, unavailable court, complete-while-playing rejected, authz, capacity regression smoke (`testing/node-testing.mdc`)
- [x] 1.10 Preserve existing FIFO/open-play-sessions/occupancy contracts (additive live APIs; no capacity change)
- [x] 1.11 `pnpm openapi:generate` + verify_fast (`pnpm format:check && pnpm lint && pnpm typecheck`) then `pnpm verify` in `backend`
- [x] 1.12 Merge-readiness for api (`backend/.cursor/skills/merge-readiness-check/SKILL.md`)

## 2. web

- [x] 2.1 API clients + TanStack hooks for me/admin live session; poll while LIVE (`api/api-layer.mdc`, `api/zod-validation.mdc`, `state/async-ui.mdc`)
- [x] 2.2 Player `/app/open-play`: status-first, live courts (stacked mobile), UP NEXT, end-game confirm (`pages/page-composition.mdc`, `pages/page-layout.mdc`, `copy/ui-microcopy.mdc`)
- [x] 2.3 Admin `/admin/open-play`: live staff dashboard — check-in, no-show, left, start/end, unavailable, assign (`state/async-ui.mdc`)
- [x] 2.4 Empty / no-booking copy preserved; loading/error distinct from empty board
- [x] 2.5 Vitest: status display fixtures, end-game confirm gating, empty schedule (`testing/vitest-testing.mdc`)
- [x] 2.6 verify_fast then `pnpm verify` in `app`
- [x] 2.7 Merge-readiness for web (`app/.cursor/skills/merge-readiness-check/SKILL.md`)

## 3. plans

- [x] 3.1 `openspec validate live-open-play-session --strict`

## 4. Ship

- [x] 4.1 `/opsx-verify` (api + web) + merge-readiness for both packages
- [ ] 4.2 `/opsx-pr` → branch `feat/live-open-play-session` (API with or before web)
