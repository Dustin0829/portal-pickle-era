## Context

Today `BookingModal` is plan-locked at open (`openBookingModal(plan)`), so Open Play and court rent feel like two modals. Admin uses `WalkInBookingModal` with an explicit plan toggle. `CourtDayGrid` already renders times × courts for portal calendars but is not the marketing/admin book surface. Clinic remains in `BookingPlan`, Pricing card #03, settings `PLAN_ORDER`, and API `bookingPlanApiSchema`. Product wants one schedule for OP + court (marketing + admin), map left / day grid right, and clinic removed from options. One-way Open Play → court reserved styling already exists (`resolveCourtHourPresentation`).

## Goals / Non-Goals

**Goals:**

- Unify marketing + admin schedule into one Open Play + court day-grid experience
- Preserve left court map image; right day grid
- Remove clinic from bookable UX and new creates
- Keep pay/receipt (marketing) and walk-in confirm (admin) after selection

**Non-Goals:**

- Redesigning student portal calendar pages beyond sharing helpers
- Re-introducing mutual Open Play↔court blocks
- Dropping clinic rows from DB / migrate-delete historical data
- `support` package
- Full reclub clone (roster panels, dashed “proceed to front desk” copy) unless needed for seat counts

## Decisions

1. **Shared schedule shell** — Extract a `UnifiedBookingSchedule` (name flexible) used by marketing modal and admin walk-in: left map, date chrome, right day grid. Marketing wraps it with existing pay/done steps; admin wraps with walk-in submit. Cite: `app/.cursor/rules/pages/page-composition.mdc`, `state/async-ui.mdc`.

2. **Day grid model** — Rows = court hourly slots (`SLOTS.court`); columns = courts (indoor+outdoor). Open Play sessions overlay as selectable session chips/rows spanning covered hours **or** a dedicated Open Play band above/within the grid showing session labels + `booked/30`. Private cells use occupancy + `hoursBlockedByOpenPlay` reserved style. Prefer extending patterns from `CourtDayGrid` over a third grid implementation.

3. **Entry API** — `openBookingModal()` becomes plan-optional (or always opens unified schedule). Pricing CTAs “Book a court” / “Join open play” both open the same modal; optional `prefer?: "court" | "open-play"` may scroll/highlight but MUST NOT hide the other product. Admin walk-in drops plan tabs for clinic/court/OP; selection comes from the grid.

4. **Clinic retirement** — UI: remove Pricing clinic card CTA (and card if it only existed to book); remove from settings plan price editor; strip from walk-in plan lists. API: narrow create Zod enum to `court` | `open-play` (keep DB enum / read path tolerant of historical `clinic`). OpenAPI regen. Cite: `backend/.cursor/rules/api/http-api.mdc`, `api/api-evolution.mdc`.

5. **Selection rules** — Single active selection mode: either one OP session id or courtId + hour ids. Confirm button label/price follows plan (`session` vs hours × court price). Multi-hour court selection remains allowed for `court` only.

6. **Mobile** — Stack: date → map → day grid; do not drop the map entirely.

## Risks / Trade-offs

- [Dense grid on 6 courts] → Horizontal scroll or grouped Indoor/Outdoor sections; keep tap targets ≥44px
- [Admin vs marketing parity drift] → Shared schedule component; only post-confirm steps diverge
- [Existing clinic deep links] → Pricing CTA gone; API 4xx on create; list/detail still show old rows
- [CourtDayGrid coupling] → Extract shared pure occupancy helpers first if full component reuse is awkward

## Migration Plan

1. Ship web unified UI + clinic UI removal with API create enum narrowing in one PR.
2. No Prisma migrate required if DB enum retains `clinic` for history.
3. Rollback: revert PR; plan-locked modals and clinic CTA return.

## Open Questions

- None blocking — Open Play presentation in the right pane: prefer a **session strip/list above the court matrix** (clearer capacity `x/30`) with covered private hours marked reserved; span-row chips are acceptable if clearer on mobile.
