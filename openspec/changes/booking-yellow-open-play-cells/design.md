## Context

`portal-reference-flat-ui` shipped a cream Courts·Times schedule with black header/date accents and Open Play as wide rowspan rows above hourly private cells. User feedback: use **yellow** instead of black; put Open Play **in the timeslot cells** on all courts, every day—not separate rows; **private court select must still work** on Open Play–covered hours.

**In scope:** `web` only. Cite: `app/.cursor/skills/SKILL.md` → `pages/page-composition.mdc`, `ui/`, `testing/vitest-testing.mdc`. Critical path: high-traffic booking modal schedule (`merge-readiness-check` Critical paths — UI booking route).

## Goals / Non-Goals

**Goals:**
- Yellow chrome accents on schedule header + selected date-strip day
- Remove Open Play colspan rows; show Open Play inside `DAY_HOURS` × court cells when Open Play plan is active
- Private Court plan: covered hours stay privately selectable (no reserved-for-OP lock)
- All courts in the active group; any day with configured sessions

**Non-Goals:**
- API/capacity changes; renaming Open Play; Food/portal shadow work; removing Indoor/Outdoor or plan checkboxes; changing session admin config

## Decisions

1. **Plan mode gates cell behavior on covered hours**
   - Build hour.id → Open Play `session.id` via `expandOpenPlaySessionToHourIds` on `openPlaySlots`. If two sessions claim the same hour (misconfig), first in `openPlaySlots` order wins.
   - When `activePlan === "open-play"`: covered cells (no pending/approved hold) show Open Play capacity; click → `applyOpenPlaySelect(selection, sessionId)`. Multi-hour: same session id + shared selected state across covered hours. Full/past → not selectable.
   - When `activePlan === "court"`: covered cells behave as normal private court hours (`applyCourtHourToggle`); do **not** apply `hoursBlockedByOpenPlay` / “Reserved for Open play” for those hours.
   - Alternatives: OP-only cells that block court select → rejected (product: “pwede naman select court”).

2. **Yellow tokens**
   - Header `bg-zinc-900 text-white` → `bg-yellow text-black` (back control borders/icons to match).
   - Date-strip selected day `bg-zinc-900 text-white` → `bg-yellow text-black`.
   - Center date summary pill stays light/contrasting on yellow header.

3. **Holds still win**
   - Pending/approved private holds on a court-hour still show Taken/Pending in both plan modes.
   - Hours with no Open Play coverage stay private Available / Taken / Past as today.

## Risks / Trade-offs

- [Multi-hour session spans several DAY_HOURS rows] → Same session id + shared selected styling when Open Play plan is active
- [Tests expect colspan band + reserved OP cells] → Update Vitest for plan-mode behavior + no colspan
- [Duplicate capacity text on every court column in Open Play mode] → Acceptable
- [Header back button on yellow] → Restyle for contrast

## Migration Plan

1. Web-only; base on branch/main that includes reference schedule.
2. Rollback: revert web PR.

## Open Questions

- None blocking.
