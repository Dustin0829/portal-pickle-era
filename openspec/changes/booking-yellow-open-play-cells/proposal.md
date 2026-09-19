## Why

Ops want brand **yellow** schedule chrome and Open Play shown **inside** the hour × court grid—together with private Available cells—without a separate Open Play band or an Open Play / Private Court plan chooser.

## What Changes

- **Yellow chrome:** Header bar and selected date-strip day use Pickle Era yellow with readable black text. Center date pill stays a light contrast chip on yellow.
- **One unified grid:** No Open Play / Private Court checkboxes. Covered hours show `Open Play - n/30` in every visible court column; other hours show Available. Click Open Play or Available in the same grid.
- **Same every day / all courts:** Any day with sessions; all courts in the active Indoor/Outdoor group.

## Capabilities

### New Capabilities

- `booking-open-play-inline-cells`: Yellow schedule chrome + unified Open Play / private cells (no plan chooser, no colspan OP rows)

### Modified Capabilities

- _(none from `openspec/specs/` — additive delta)_

## Impact

- **Repos in scope:** `web` (`UnifiedBookingSchedule` + related tests), `plans`
- **Out of scope:** `api`; capacity math / Open Play session admin config; Food/portal flat chrome; removing Indoor/Outdoor
- **Depends on:** `portal-reference-flat-ui` schedule shell (or equivalent on main)
- **Must not break:** Open Play capacity display/select/toggle-off; private multi-hour court select on non-OP hours; Indoor/Outdoor filter; pending/approved hold labels; create/pay via `BookingModal` / `WalkInBookingModal`
