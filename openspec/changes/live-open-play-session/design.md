## Context

Pickle Era already books Open Play as shared seats (`OPEN_PLAY_CAPACITY = 30`, facility session bands) and recently added a **static FIFO opening-wave board** (approved bookings → foursomes → Courts 1–6, compute-on-read). That board does not model check-in, live games, timers, end-game, or rotation after a game finishes.

Product direction (staff brief): treat Open Play as a **live session** — book → check in → wait → assign → play → end game → rotate — with player status first and staff overrides. Players never pick a court at booking time.

**In-scope packages:** `api` (`./backend`), `web` (`./app`), `plans`.  
**Excluded:** `support`.

## Goals / Non-Goals

**Goals:**

- Persist live session state (status, participants, courts, games, queue) as backend source of truth
- Check-in gated rotation; no-show / left-session
- Live board + personalized player status + staff ops
- Idempotent end-game + fair queue rotation under concurrency
- Evolve player `/app/open-play` and admin Open Play into live dashboards (mobile-first)
- Keep booking capacity and private-court UX unchanged

**Non-Goals (v1):**

- Auto-end by timer or score
- WebSocket/SSE productization (polling is enough for v1)
- Full drag-and-drop queue surgery UI (minimum staff assign/start/end/unavailable)
- Optional score entry UI (schema hook optional; default off)
- Changing court count, capacity 30, or Indoor|Outdoor private booking toggle
- `support` package

## Decisions

1. **New module + persisted models (not compute-only)**  
   Add an `open-play` (or `openPlaySession`) domain module with Prisma models, e.g. `OpenPlaySession`, `OpenPlayParticipant`, `OpenPlayCourtState`, `OpenPlayGame`, `OpenPlayQueueEntry` (exact names in implementation). Static FIFO remains available to **seed** the first wave when going `LIVE`, then live rows are authoritative.  
   *Alternatives:* Extend FIFO compute-on-read only — rejected; cannot support end-game, timers, or concurrency safely.

2. **Session key = `date` + existing Open Play `slotId`**  
   Align with facility settings sessions and booking `slotIds has slotId`. One live session row per band. **Get-or-create** on first admin/me live read or staff go-live so operators are not blocked on a separate “create session” step.  
   *Alternatives:* Free-form session ids — rejected; breaks booking linkage.

3. **Participants link to `bookingId` (+ userId/email)**  
   Approved bookings are the eligibility set; check-in flips participant into the queue.  
   *Alternatives:* Re-enter names at the desk — rejected; duplicates bookings.

4. **End-game transaction**  
   Single DB transaction: lock game row (`UPDATE … WHERE status = PLAYING` / version), mark completed, append finishers to queue, dequeue next four if court usable, write new game or set court `AVAILABLE`. Reject if already completed.  
   Cite: `backend/.cursor/rules/data/concurrency.mdc`, `database.mdc`.

5. **Real-time = TanStack Query polling (v1)**  
   Short `refetchInterval` on live board queries while session is `LIVE` (player + admin). Invalidate on mutations. SSE/WebSocket deferred.  
   Cite: `app/.cursor/rules/state/async-ui.mdc`, `api/api-layer.mdc`.

6. **API shape (sketch)**  
   - `GET /me/open-play/sessions/:date/:slotId` (or query) → board + myStatus  
   - `POST /me/open-play/games/:gameId/end` (confirm client-side; membership check server-side)  
   - `GET/PATCH /admin/open-play/sessions…` → status, check-in, no-show, left, court unavailable, start/end game, assign  
   Follow `http-api.mdc`, `response-contracts.mdc`, OpenAPI generate.

7. **UI**  
   - Player: extend `/app/open-play` — status hero, stacked courts on mobile, UP NEXT  
   - Admin: evolve `/admin/open-play` into live staff dashboard  
   Cite: `pages/page-composition.mdc`, `page-layout.mdc`, `copy/ui-microcopy.mdc`.

8. **Phasing inside this change**  
   - **Must ship:** session lifecycle, check-in/no-show/left, board + states, start/end game, fair rotation, player status, polling, staff unavailable + assign/start/end  
   - **Defer if needed:** score capture UI, court-specific “next four” preview, rich swap/reorder, game history browse, push realtime

9. **Rules cited**  
   - api: `core/ponytail-rules.mdc`, `core/module-boundaries.mdc`, `api/http-api.mdc`, `api/response-contracts.mdc`, `data/database.mdc`, `data/concurrency.mdc`, `testing/node-testing.mdc`  
   - web: `api/api-layer.mdc`, `api/zod-validation.mdc`, `state/async-ui.mdc`, `pages/page-composition.mdc`, `pages/page-layout.mdc`, `copy/ui-microcopy.mdc`, `testing/vitest-testing.mdc`

## Risks / Trade-offs

- **[Risk] Scope explosion vs FIFO** → Mitigation: explicit v1 must-ship list; defer score/history/WS; seed from FIFO once.  
- **[Risk] Double rotation under concurrent End Game** → Mitigation: transactional conditional update; tests for concurrent end.  
- **[Risk] Polling lag / battery** → Mitigation: poll only while `LIVE` and tab visible; backoff when hidden.  
- **[Risk] Staff expectations for verbal overrides** → Mitigation: staff end/assign/unavailable in v1; document advanced swap as follow-up.  
- **[Trade-off] Persisted state vs simple FIFO** → More migrations and ops complexity; required for live play.

## Migration Plan

1. Deploy API migrations + endpoints (sessions empty until staff goes live).  
2. Deploy web live dashboards; keep booking flows unchanged.  
3. Optional: one-time seed of first wave from FIFO when session → `LIVE`.  
4. Rollback: feature-flag or hide live UI; bookings unaffected; drop/ignore new tables if needed.

## Open Questions

- None blocking v1. Locked defaults: check-in only while `LIVE`; sides = queue order 1–2 vs 3–4 each assignment; score UI off; complete session rejected while any court is `PLAYING`; realtime = polling.
