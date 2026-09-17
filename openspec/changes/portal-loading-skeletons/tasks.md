## 1. web — shared primitives

- [x] 1.1 Add portal skeleton helpers (`PortalListSkeleton`, `PortalStatSkeleton`, `PortalCalendarSkeleton`, `PortalTableSkeleton`) on `Skeleton` under `app/src/components/portal/` (`ui/design-tokens.mdc`, `core/naming-conventions.mdc`, `core/ponytail-rules.mdc`)
- [x] 1.2 Document usage: `isPending && !data` → skeleton; `isFetching && data` → keep content (`state/async-ui.mdc`, `state/data-ownership.mdc`)
- [x] 1.3 Add plan unit-price helper that reads `facilitySettingsStore` with `PLAN_META` fallback for booking totals / marketing (`state/react-state-zustand.mdc`, `lib/booking/booking.ts`)

## 2. web — admin portal

- [x] 2.1 Admin dashboard: stats + recent activity skeletons while bookings/waitlist pending (`AdminDashboardPage.tsx`, `pages/page-layout.mdc`)
- [x] 2.2 Admin bookings inbox: row skeletons on first load (`AdminBookingsPage.tsx`)
- [x] 2.3 Booking detail: receipt panel skeleton while signed URL loads (`state/async-ui.mdc`)
- [x] 2.4 Approve/Reject: disable + busy label while `usePatchAdminBooking` pending; re-enable on failure (`ui/interaction-polish.mdc`, `copy/ui-microcopy.mdc`, `state/error-handling.mdc`)
- [x] 2.5 Admin calendar: month grid skeleton while bookings pending (`AdminCalendarPage.tsx` / `CourtDayGrid`)
- [x] 2.6 Players: replace text loader with table skeletons; Export button busy while generating CSV (`AdminWaitlistPage.tsx`)
- [x] 2.7 Settings Plan prices: draft inputs + **Save** (busy + “Saved” status); stop live-on-type writes; fix header copy (`AdminSettingsPage.tsx`, `copy/ui-microcopy.mdc`)

## 3. web — player portal + marketing

- [x] 3.1 Overview + My bookings: list/stat skeletons on `useMyBookings` pending (`OverviewPage.tsx`, `BookingsPage.tsx`)
- [x] 3.2 Player calendar: grid skeleton on `useOccupancy` pending (`CalendarPage.tsx`)
- [x] 3.3 Portal logout control: busy/disabled while `logout()` runs (`PortalChrome.tsx`)
- [x] 3.4 BookingModal: occupancy loading for courts/slots; use saved unit prices for amount copy/totals; keep submit busy labeling (`BookingModal.tsx`, `state/async-ui.mdc`)
- [x] 3.5 Marketing `Pricing.tsx`: display saved plan prices from facility settings (`pages/home/Pricing.tsx`)

## 4. web — verify

- [x] 4.1 Add/adjust Vitest: skeleton gate, approve busy, and saved price shown on Pricing / booking total (`testing/vitest-testing.mdc`)
- [x] 4.2 Mid-apply: `cd app &&` kit `verify_fast` (`pnpm format:check && pnpm lint && pnpm exec tsc -b --noEmit`)
- [x] 4.3 `cd app && pnpm verify`
- [x] 4.4 Run `app/.cursor/skills/merge-readiness-check/SKILL.md` for web

## 5. plans

- [x] 5.1 Keep proposal/design/specs/tasks aligned after any scope trim
- [x] 5.2 `openspec validate portal-loading-skeletons`

## 6. Ship

- [x] 6.1 `/opsx-verify` (web)
- [x] 6.2 `/opsx-pr`
