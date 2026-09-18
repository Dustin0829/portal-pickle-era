## Context

Open Play today: `PLAN_META` ₱150, four hardcoded slots in `SLOTS["open-play"]`, and `createBookingRow` blocks any overlapping `courtId|slotIds` for all plans — so open-play cannot share a session. Admin can edit prices via `facilitySettingsStore` but not sessions. Marketing `BookingModal` loads court occupancy only.

**Rules / skills (cite, do not paste):**

- api: `backend/.cursor/skills/SKILL.md`, `core/module-boundaries.mdc`, `api/http-api.mdc`, `api/response-contracts.mdc`, `data/prisma-data.mdc`, `testing/*`
- web: `app/.cursor/skills/SKILL.md`, `state/async-ui.mdc`, `state/react-state-zustand.mdc`, `api/api-layer.mdc`, `copy/ui-microcopy.mdc`, `ui/interaction-polish.mdc`, `testing/vitest-testing.mdc`

## Goals / Non-Goals

**Goals:**

- ₱250 default; three default 2h sessions; admin-editable sessions in Settings (draft+Save)
- Shared capacity 30 per date+slotId for `open_play`; X/30 UI; server reject when full
- Occupancy (or sibling query) returns open-play counts for UI
- Court/clinic exclusivity unchanged

**Non-Goals:**

- Wallet, Resend credentials email, Food tab
- Server-persisted facility catalog API (slots stay client store this change)
- Admin UI for capacity number (fixed 30)
- Changing clinic slot catalog

## Decisions

### 1. Capacity key = date + slotId (ignore court for open-play)

- Count `plan === open_play` + `date` + `slotIds` has the session id; status in `pending|approved`.
- **BREAKING** vs today’s court exclusivity for open-play only.
- On create open-play: if `count >= 30` → `ConflictError` with clear message; else allow (still store a `courtId` for schema — use fixed `in-1` or client-sent value; do not use it in open-play conflict).
- **Alternatives:** capacity per court — rejected (product is shared session).

### 2. Occupancy API shape

- Add **`GET /bookings/open-play-sessions?date=YYYY-MM-DD`** returning `{ sessions: [{ slotId, bookedCount, capacity: 30 }] }` for all requested catalog slots the client cares about — server returns counts for any `slotId` that has bookings **and** may include zeros only if client passes slot ids, **or** return only slots with bookings and let the client merge with its catalog (prefer: return map of all slotIds that have count > 0 plus client fills 0; simplest: return `{ items: [{ slotId, bookedCount, capacity }] }` aggregating pending+approved open_play for that date).
- Leave existing court `GET /bookings/occupancy` unchanged for calendar consumers.
- **Alternatives:** overload occupancy response — rejected (risk breaking court calendar).

### 3. Session catalog: Zustand + code defaults

- Mirror plan prices: `openPlaySlots` on `facilitySettingsStore`; defaults = three 2h examples; Admin Settings editor with Save.
- `getOpenPlaySlots()` / hook for BookingModal + WalkIn.
- Id = `HH:00` from start hour; label auto-generated for 2h window.
- **Alternatives:** backend FacilitySettings now — deferred (non-goal).

### 4. BookingModal UX for open-play

- Use saved slots; fetch capacity for selected date; show X/30; disable at full.
- Hide court picker for open-play (server assigns fixed courtId) to avoid implying exclusivity.
- Keep GCash + receipt submit path.

### 5. Constant capacity

- `OPEN_PLAY_CAPACITY = 30` shared constant in api (+ mirrored in web for display fallback).

## Risks / Trade-offs

- **[Risk] LocalStorage slots** → Marketing visitors only see admin slots on same browser → Mitigation: copy in Settings; API later.
- **[Risk] Concurrent 31st booking** → Mitigation: count inside same Prisma transaction as create (like today’s conflict check).
- **[Risk] Existing open-play rows as exclusive holds** → Mitigation: after deploy, multiple players can join same slot; document ops.
- **[Risk] Persisted ₱150 in local settings** → Mitigation: bump default; mention Reset defaults / re-Save.
- **[Risk] Occupancy response change breaks clients** → Mitigation: additive field/endpoint only.

## Migration Plan

1. Deploy api then web (or same monorepo PR).
2. No Prisma schema migration required if only query logic changes.
3. Rollback: revert deploy; old exclusivity returns.

## Open Questions

None — capacity fixed at 30; slots client-persisted; open-play sessions endpoint additive.

## Assumed OK (non-blocking)

- Same email may book multiple seats for one session (no unique constraint this change).
- Server does not validate `slotId` against admin catalog (client owns catalog).
