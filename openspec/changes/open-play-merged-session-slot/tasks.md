## 1. api — multi-court booking persist

- [x] 1.1 Prisma: add `courtSlots` JSON (backfill from `courtId` + `slotIds`); update indexes/queries as needed (`data/` migrations)
- [x] 1.2 Zod + OpenAPI: court create accepts `courtSlots[]`; DTOs/occupancy expose multi-court; single-court still valid (`api/`, `zod-validation`)
- [x] 1.3 Service: conflict check per court-hour; pricing by total court-hours; Open Play path unchanged (`module-boundaries`, `testing/`)
- [x] 1.4 Mid-apply: `cd backend &&` kit `verify_fast`
- [x] 1.5 Full `cd backend && pnpm verify` + merge-readiness

## 2. web — merged OP + multi-court + uniform padding

- [x] 2.1 Refactor `UnifiedBookingSchedule`: merged OP band (row/col span, full window label); skip continuation hours (`pages/page-composition.mdc`, `ui/`)
- [x] 2.2 `unifiedBookingSelection`: court plan accumulates `courtSlots` across courts; OP clears private and vice versa; clear on Indoor/Outdoor switch (`state/`)
- [x] 2.3 BookingModal / WalkIn: totals from total court-hours; create payload sends `courtSlots`; list/detail labels show all courts (`api/`, `pages/`)
- [x] 2.4 Migrate player + admin pages to Food shell padding: Calendar, Admin Calendar, Admin Settings (and any remaining custom `py-4` main shells) via `AppPageShell` / `appContentPaddingClass` (`pages/page-layout.mdc`)
- [x] 2.5 Vitest: one OP button + window label; multi-court toggle; padding/shell regression where practical (`testing/vitest-testing.mdc`)
- [x] 2.6 Mid-apply: `cd app &&` kit `verify_fast`
- [x] 2.7 Full `cd app && pnpm verify` + merge-readiness

## 3. plans

- [x] 3.1 `openspec validate open-play-merged-session-slot`

## 4. Ship

- [x] 4.1 `/opsx-verify` (api + web)
- [x] 4.2 `/opsx-pr` (branch `feat/open-play-merged-session-slot`)
