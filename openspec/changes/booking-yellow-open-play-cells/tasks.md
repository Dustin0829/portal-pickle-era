## 1. web — yellow chrome + inline Open Play cells

- [x] 1.1 Replace schedule header and selected date-strip accents `bg-zinc-900` → yellow + black text; restyle header back control for contrast (`ui/`, `pages/page-composition.mdc`)
- [x] 1.2 Remove Open Play colspan rows; map covered hours → session id; when Open Play plan: OP cells (capacity/select/full/past) + `applyOpenPlaySelect`; when Private Court plan: normal court toggle on covered hours (no reserved-for-OP lock); holds still win (`pages/page-composition.mdc`, `state/async-ui.mdc`)
- [x] 1.3 Vitest: no colspan OP band; Open Play plan Indoor/Outdoor OP cells; Private Court plan can select court on covered hours; empty OP day; multi-hour selected; full/past disabled; yellow selected date (`testing/vitest-testing.mdc`)
- [x] 1.4 Mid-apply: `cd app &&` kit `verify_fast`
- [x] 1.5 Full `cd app && pnpm verify` + merge-readiness before ship (booking modal critical path)

## 2. plans

- [x] 2.1 `openspec validate booking-yellow-open-play-cells`

## 3. Ship

- [ ] 3.1 `/opsx-verify` (web)
- [ ] 3.2 `/opsx-pr` (branch `feat/booking-yellow-open-play-cells`)
