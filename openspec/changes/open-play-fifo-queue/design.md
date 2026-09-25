## Context

Open Play already persists per-person bookings (`plan: open_play`) with shared seat capacity (`OPEN_PLAY_CAPACITY = 30`) and admin approve/reject. Occupancy and `GET /bookings/open-play-sessions` expose counts, but there is no ordered “who plays next” board. Private court booking keeps the Indoor|Outdoor toggle (3 courts visible at a time); Open Play is a session band across the facility, not a per-court exclusive hold.

Product choice: **FIFO by booking time** (not a random mixer). Within each foursome, sides follow booking order.

## Goals / Non-Goals

**Goals:**

- Pure, deterministic FIFO board from approved Open Play bookings for `date` + session `slotId`
- Groups of 4 with sides 1–2 vs 3–4; assign to Courts 1–6; overflow = next up; incomplete tail = remainder
- Admin board UI + player own-position visibility
- OpenAPI + tests; no change to capacity or Indoor|Outdoor private-court UX

**Non-Goals:**

- Live 4-on/4-off advance, paddle re-queue after a game, or persisted rotation state
- Skill matching / random mixer / fixed partners beyond FIFO sides
- Including pending bookings on the play board
- Changing Open Play capacity or marketing pricing copy
- `support` package

## Decisions

1. **Compute, don’t persist (v1)**  
   Board is derived on read from approved bookings. No new Prisma tables.  
   *Alternatives:* Persist queue rows / “waves” — rejected for YAGNI until rotation is needed.

2. **Approved-only on the board**  
   Pending still hold seats (existing capacity) but do not play until approved.  
   *Alternatives:* Include pending — rejected; staff must approve payment first.

3. **Ordering**  
   `createdAt ASC`, then `id ASC`. Walk-in approved creates use their `createdAt` like any booking.

4. **Session key**  
   `date` + Open Play session start `slotId` (e.g. `07:00`, `16:00`, `18:00`). Filter: `plan = open_play`, `status = approved`, `date = …`, `slotIds has slotId` — same `has` semantics as capacity aggregation.

5. **Court assignment**  
   Facility order Court 1…6 (`COURTS` list). First N complete foursomes → courts; rest → nextUp. No Indoor/Outdoor split on the OP board (session is facility-wide).

6. **API shape**  
   - `GET /admin/bookings/open-play-queue?date=&slotId=` (admin)  
   - `GET /me/bookings/open-play-queue?date=&slotId=` — returns **caller’s** position only (queue index, court/side or waiting). No other players’ emails; opponent names omitted in v1.  
   Invalid/missing query → 400 validation (existing validate middleware patterns).

7. **UI**  
   Admin: `/admin/open-play` with nav entry — date + session picker, board.  
   Player: booking detail for approved open-play shows position via hook.

8. **Must-not-break**  
   Public/admin create, occupancy, `open-play-sessions` counts, approve/reject, Indoor|Outdoor private court toggle, receipt URLs.

9. **Rules cited**  
   - api: `backend/.cursor/rules/api/http-api.mdc`, `response-contracts.mdc`, `core/module-boundaries.mdc`, `testing/node-testing.mdc`  
   - web: `app/.cursor/rules/api/api-layer.mdc`, `state/async-ui.mdc`, `pages/page-composition.mdc`, `copy/ui-microcopy.mdc`, `testing/vitest-testing.mdc`

## Risks / Trade-offs

- **[Risk] Staff expect live rotation after each game** → Mitigation: label board “opening wave / booking order”; document rotation as follow-up.
- **[Risk] Same email multiple seats** → Mitigation: one booking = one seat; duplicates allowed only if separate booking rows exist.
- **[Risk] Approve order vs create order** → Mitigation: FIFO uses **create** time, not approve time (fair to early bookers waiting on payment review).
- **[Trade-off] No opponent names on player view** → Less social, fewer PII leaks; admin has full board.

## Migration Plan

- Deploy API before or with web.
- No DB migration.
- Rollback: remove routes/UI; bookings unchanged.

## Open Questions

- None blocking v1; rotation/advance deferred.
