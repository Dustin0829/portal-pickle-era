## Context

Three product asks in one change:

1. **Merged Open Play** — one band + full window label (not duration × courts cells).
2. **Multi-court private booking** — one checkout / one DB booking with 2+ courts.
3. **Uniform portal padding** — match player Food `AppPageShell` padding on all player + admin main tabs.

**Padding today:** Food / most shells use `AppPageShell` → `py-8 sm:py-10` + `appContentPaddingClass` (`px-4 sm:px-6`). Player/Admin Calendar and Admin Settings use custom `px-4 py-4 sm:px-6 sm:py-5`.

**In scope:** `api` + `web`. Cite `backend/.cursor/skills/SKILL.md` → `data/`, `api/`, `testing/`; `app/.cursor/skills/SKILL.md` → `pages/page-layout.mdc`, `pages/page-composition.mdc`, `ui/`, `api/`, `testing/`.

## Goals / Non-Goals

**Goals:**
- Merged OP session UI
- Multi-court private selection + one booking persist
- Pricing = unit × total court-hours; conflicts; occupancy/lists
- Uniform Food-equivalent shell padding on all portal main pages
- Backward compatible single-court create/read

**Non-Goals:**
- Fan-out to multiple booking rows
- Changing Open Play capacity math / admin session CRUD
- Redesigning Food cards, order rail, or wallet flows
- Changing modal/sheet padding
- Forcing identical `max-w-*` across pages
- Removing Indoor/Outdoor
- Mixing Indoor + Outdoor in one booking (**clear selection on group switch**)

## Decisions

### A. Merged Open Play (UI)

1. **Render units** — Walk `DAY_HOURS`: skip continuation hours of an already-emitted session band; on session start emit gutter + one OP button with `gridRow: span durationHours` and `gridColumn: span visibleCourts.length`; else normal private cells.  
2. **OP selection** — `applyOpenPlaySelect` unchanged (session id; placeholder court for OP).  
3. **Holds under OP band** — do not paint per-court Taken inside the span; API enforces conflicts.

### B. Multi-court private (data + UI)

4. **Persist shape** — Add Prisma `courtSlots Json` as `Array<{ courtId: string; slotIds: string[] }>` (unique courtIds, each slotIds non-empty). Migrate existing rows to `[{ courtId, slotIds }]`. Hard cut DTOs to `courtSlots` / derived `courtIds`.  
   **Rejected:** shared identical `slotIds` across `courtIds[]` only; fan-out N booking rows.

5. **API body** — `plan: court` create accepts `courtSlots: [{ courtId, slotIds }]`. Open Play keeps session `slotIds` (+ placeholder court as today).

6. **Conflict / pricing / lists** — Per-segment conflict; `totalCourtHours = sum(slotIds.length)`; occupancy expands all segments; list labels show all courts.

7. **UI selection** — `courtSlots[]` on selection; toggle without clearing other courts; OP clears private; Indoor↔Outdoor clears private selection.

### C. Uniform page padding

8. **Canonical tokens** — Keep `appContentPaddingClass` (`px-4 sm:px-6`) and `AppPageShell` vertical `py-8 sm:py-10` as the single source of truth (Food already uses this).  
9. **Migrate outliers** — Player `CalendarPage`, Admin `AdminCalendarPage`, `AdminSettingsPage`: wrap with `AppPageShell` (or apply the same padding classes) instead of `py-4 sm:py-5` wrappers. Prefer `AppPageShell` for consistency.  
10. **Width** — Continue passing `className="max-w-…"` / `width="full"` as today; padding only is standardized.  
11. **Full-height calendars** — Shell padding applies; inner grid may still use `min-h-0 flex-1` — do not drop vertical shell padding to “fit” the grid.

## Risks / Trade-offs

- [JSON `courtSlots`] → v1 OK; migrate later if needed
- [Calendar feels taller with py-8] → Accept for uniformity; scroll/flex inside
- [CSS grid OP spans] → Explicit placement + Vitest
- [Occupancy one courtId] → Update mapping in same change

## Migration Plan

1. Prisma `court_slots` Json backfill; cut API/DTOs.
2. Web: selection + OP merge + shell padding migrations.
3. One monorepo PR; rollback = revert + down migration.

## Open Questions

- None blocking.
