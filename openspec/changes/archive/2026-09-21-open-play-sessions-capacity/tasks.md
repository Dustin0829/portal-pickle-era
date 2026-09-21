## 1. api — capacity + occupancy

- [x] 1.1 Add `OPEN_PLAY_CAPACITY = 30` and open-play seat count helper (`bookings.service.ts`, `core/module-boundaries.mdc`, `core/ponytail-rules.mdc`)
- [x] 1.2 Change `createBookingRow`: court/clinic keep court exclusivity; `open_play` uses date+slotId capacity check inside the transaction (`data/prisma-data.mdc`)
- [x] 1.3 Add `GET /bookings/open-play-sessions?date=` returning per-slot bookedCount + capacity 30; leave court occupancy unchanged (Zod + OpenAPI) (`api/http-api.mdc`, `api/response-contracts.mdc`)
- [x] 1.4 Backend tests: full session rejects; under capacity allows; concurrent last-seat; court exclusivity unchanged (`testing/`)
- [x] 1.5 Mid-apply: `cd backend &&` kit `verify_fast`
- [x] 1.6 Full `cd backend && pnpm verify` + `backend/.cursor/skills/merge-readiness-check/SKILL.md` before ship

## 2. web — catalog + Settings

- [x] 2.1 Set `PLAN_META` open-play price to 250; default `SLOTS["open-play"]` to three 2h sessions (`lib/booking/booking.ts`)
- [x] 2.2 Extend `facilitySettingsStore` with `openPlaySlots` + setters; persist with existing key (`state/react-state-zustand.mdc`)
- [x] 2.3 Add `getOpenPlaySlots` / `useOpenPlaySlots` helper with code defaults fallback
- [x] 2.4 Admin Settings: Open Play sessions editor (add/remove/start hour, draft+Save, copy) (`AdminSettingsPage.tsx`, `copy/ui-microcopy.mdc`, `ui/interaction-polish.mdc`)

## 3. web — booking UX

- [x] 3.1 BookingModal open-play: saved slots, fetch counts, show X/30, disable full, hide court picker, keep GCash pay (`BookingModal.tsx`, `state/async-ui.mdc`, `api/api-layer.mdc`)
- [x] 3.2 WalkInBookingModal: same slot source + X/30 for open-play creates
- [x] 3.3 Pricing / plan price helpers use ₱250 default
- [x] 3.4 Vitest: defaults, Settings save → slots, X/30 / full disable, capacity fetch error (`testing/vitest-testing.mdc`)
- [x] 3.5 Mid-apply: `cd app &&` kit `verify_fast`
- [x] 3.6 Full `cd app && pnpm verify` + `app/.cursor/skills/merge-readiness-check/SKILL.md` before ship

## 4. plans

- [x] 4.1 Keep proposal/design/specs/tasks aligned after any scope trim
- [x] 4.2 `openspec validate open-play-sessions-capacity`

## 5. Ship

- [x] 5.1 `/opsx-verify` (api + web)
- [x] 5.2 `/opsx-pr`
