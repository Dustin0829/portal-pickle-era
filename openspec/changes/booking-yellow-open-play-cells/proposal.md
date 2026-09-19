## Why

The booking schedule still uses black (`zinc-900`) for header/selected-date chrome and renders Open Play as separate wide rowspan rows above the hourly grid. Ops want brand **yellow** accents instead of black, and Open Play shown **inside the normal hour × court cells** for the covered timeslots—every day, on every court—not as a separate band. **Private court selection must still work** on those same hours (Open Play must not lock courts as “Reserved”).

## What Changes

- **Yellow chrome:** Replace black/zinc-900 accents on the unified booking schedule header bar and the selected day on the horizontal date strip with Pickle Era yellow (`bg-yellow` / `--color-yellow`) and readable black text. The center date summary chip may stay a contrasting light pill on the yellow header.
- **Inline Open Play (no colspan rows):** Remove Open Play colspan rows. Covered Open Play hours appear in the normal hour × court grid for every court in the active Indoor/Outdoor group.
- **Plan mode decides click behavior:** With **Open Play** plan selected, covered cells show Open Play (capacity / select / full / past) and select the session. With **Private Court** plan selected, those same hours remain normal private Available / Taken / Past — **selectable as court hours** (no “Reserved for Open play” lock).
- **Same every day / all courts:** Applies for any selected date with Open Play sessions; all courts in the active group.

## Capabilities

### New Capabilities

- `booking-open-play-inline-cells`: Yellow schedule chrome + Open Play in hour×court cells (no separate rows); private court still selectable on covered hours

### Modified Capabilities

- _(none from `openspec/specs/` — additive delta)_

## Impact

- **Repos in scope:** `web` (`UnifiedBookingSchedule` + related tests), `plans`
- **Out of scope:** `api`; capacity math / Open Play session admin config; Food/portal flat chrome; removing Indoor/Outdoor or plan checkboxes
- **Depends on:** `portal-reference-flat-ui` schedule shell (or equivalent on main)
- **Must not break:** Open Play capacity display/select/toggle-off; private multi-hour court select **including on Open Play–covered hours**; Indoor/Outdoor filter; pending/approved hold labels; create/pay via `BookingModal` / `WalkInBookingModal`
