Branch: `feat/open-play-fifo-queue`

## 1. api

- [x] 1.1 Pure FIFO builder: order approved open-play seats, foursomes/sides, courts 1–6, next-up, remainder (`core/ponytail-rules.mdc`, `core/module-boundaries.mdc`)
- [x] 1.2 Query approved Open Play bookings for `date` + session `slotId`; wire admin + me controllers/routes/OpenAPI (`api/http-api.mdc`, `api/response-contracts.mdc`)
- [x] 1.3 Node tests: ordering, pending excluded, sides, court cap, empty session, invalid query, unauth (`testing/node-testing.mdc`)
- [x] 1.4 `pnpm openapi:generate` + `pnpm format:check && pnpm lint && pnpm typecheck` in `backend`
- [x] 1.5 `pnpm verify` in `backend`
- [x] 1.6 Merge-readiness for api (`backend/.cursor/skills/merge-readiness-check/SKILL.md`)

## 2. web

- [x] 2.1 API clients + TanStack hooks for admin board and player position (`api/api-layer.mdc`, `api/zod-validation.mdc`)
- [x] 2.2 Admin Open Play FIFO board page + sidebar/nav entry (date + session, courts/next-up/remainder, loading/empty/error) (`pages/page-composition.mdc`, `state/async-ui.mdc`, `copy/ui-microcopy.mdc`)
- [x] 2.3 Player approved Open Play booking detail: show queue index + court/side or waiting (`state/async-ui.mdc`)
- [x] 2.4 Vitest: board grouping fixtures + player position empty/assigned (`testing/vitest-testing.mdc`)
- [x] 2.5 `pnpm format:check && pnpm lint && pnpm exec tsc -b --noEmit` then `pnpm verify` in `app`
- [x] 2.6 Merge-readiness for web (`app/.cursor/skills/merge-readiness-check/SKILL.md`)

## 3. plans

- [x] 3.1 `openspec validate open-play-fifo-queue --strict`

## 4. Ship

- [x] 4.1 `/opsx-verify` (api + web) + merge-readiness for both packages
- [x] 4.2 `/opsx-pr` → branch `feat/open-play-fifo-queue` (API with or before web)
