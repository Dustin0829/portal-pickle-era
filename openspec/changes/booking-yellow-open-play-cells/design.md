## Context

User feedback on the yellow + inline OP schedule: drop the Open Play / Private Court checkboxes; show both cell types **together** in one grid (as in the reference screenshot).

**In scope:** `web` only. Cite: `app/.cursor/skills/SKILL.md` → `pages/page-composition.mdc`, `ui/`, `testing/vitest-testing.mdc`.

## Goals / Non-Goals

**Goals:**
- Yellow chrome accents on schedule header + selected date-strip day
- Remove Open Play colspan rows and plan checkboxes
- Always show Open Play on covered hours + Available on other hours in the same grid
- All courts in the active group; any day with configured sessions

**Non-Goals:**
- API/capacity changes; Food/portal shadow work; removing Indoor/Outdoor; changing session admin config

## Decisions

1. **Unified grid — no plan checkboxes**
   - Remove Open Play / Private Court checkbox row. Build hour.id → Open Play `session.id` via `expandOpenPlaySessionToHourIds`. If two sessions claim the same hour, first in `openPlaySlots` wins.
   - Covered hours (no hold): Open Play capacity label; click → `applyOpenPlaySelect`. Multi-hour: shared selected state. Full/past → not selectable.
   - Non-covered hours: private Available via `applyCourtHourToggle`.
   - Alternatives: separate plan chooser → rejected (product: magkasama sa grid).

2. **Yellow tokens**
   - Header → `bg-yellow text-black`; date-strip selected → yellow; center pill stays light on yellow.

3. **Holds still win**
   - Pending/approved private holds still show Taken/Pending over Open Play.

## Risks / Trade-offs

- [Multi-hour session] → Shared selected styling across covered hours
- [Duplicate capacity text per court column] → Acceptable (matches reference)
- [Private court on OP-covered hours] → Not available; those cells are Open Play (select Available hours for private)

## Migration Plan

1. Web-only; ship on feature branch.
2. Rollback: revert web PR.

## Open Questions

- None blocking.
