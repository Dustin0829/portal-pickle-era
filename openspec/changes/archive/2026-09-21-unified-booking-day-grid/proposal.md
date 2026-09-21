## Why

Players and admins open separate Open Play vs court-rent flows, so they cannot see sessions and private-court availability together. Clinic remains a bookable plan though the product no longer offers it. Ops want one schedule modal (marketing + admin) with a day grid beside the court map.

## What Changes

- **Unified booking modal:** One schedule experience for Open Play and private court rent — marketing (`BookingModal`) and admin walk-in (`WalkInBookingModal` / calendar book flows). Entry CTAs open the same modal (no plan-locked split UI).
- **Day grid (right) + court map (left):** After date selection, right pane shows a day grid (times × courts) with Open Play sessions visible (bookable OP seats and/or yellow **Reserved for Open play** on covered private-court hours). Left pane keeps the court facility map image.
- **Selection → plan:** Choosing an Open Play session books `open-play`; choosing court hour cell(s) books `court`. Existing one-way overlap rules stay (Open Play blocks court hours; court does not block Open Play).
- **BREAKING (product):** Remove **clinic** from bookable options — pricing cards, plan pickers, admin settings prices, and create payloads. Historical clinic bookings (if any) remain readable; new clinic creates are rejected or impossible from UI + API validation.

## Capabilities

### New Capabilities

- `unified-booking-day-grid`: Single Open Play + court schedule modal (marketing + admin) with left map / right day grid, and clinic retirement from booking UX/API create

### Modified Capabilities

- _(none in `openspec/specs/` — clinic/plan UI lives in marketing + booking modules covered by the new capability)_

## Impact

- **Repos in scope:** `web` (`app` — BookingModal, WalkInBookingModal, Pricing, facility settings, CourtDayGrid reuse), `api` (`backend` — reject/stop advertising `clinic` on create schemas if currently accepted), `plans`
- **Out of scope:** `support`; rebuilding portal student calendar as the marketing modal; mutual Open Play↔court block (already one-way); email branding; food; wallet
- **Assumptions:** Clinic FAQ/marketing copy may stay informational (“coaching coming later”) without a Book CTA; default day-grid hours follow existing court `SLOTS.court`; Open Play rows span or annotate covered hours facility-wide
- **Must not break:** Advance-booking date floor; Open Play capacity 30; wallet apply on booking; occupancy/hold states; payment/receipt flow after schedule confirm; one-way Open Play → court reserved hours
