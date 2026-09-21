## Context

Admin and player portals load bookings/waitlist/occupancy via TanStack Query but most pages ignore `isPending` and render empty shells. Mutations (approve/reject, export, logout) often fire without disabling controls. Auth/session already uses `AuthLoadingShell`; Players shows text-only “Loading…”. Portal chrome must stay mounted (recent Suspense fix).

Admin Settings already edits plan prices via `facilitySettingsStore.setPlanPrice` on every keystroke, but marketing `Pricing.tsx` and `BookingModal` / `PLAN_META` stay hardcoded — copy even says marketing does not sync. Payment display already uses draft + Save; Plan prices should match that pattern and feed marketing + booking totals.

**Rules / skills (cite, do not paste):**

- web: `app/.cursor/skills/SKILL.md`, `merge-readiness-check`, `ai-slop-check`
- web rules: `state/async-ui.mdc`, `state/error-handling.mdc`, `state/data-ownership.mdc`, `state/react-state-zustand.mdc`, `pages/page-layout.mdc`, `pages/page-composition.mdc`, `ui/interaction-polish.mdc`, `copy/ui-microcopy.mdc`, `core/ponytail-rules.mdc`, `testing/vitest-testing.mdc`

## Goals / Non-Goals

**Goals:**

- Layout-matched skeletons on first load for admin dashboard, bookings, calendar, players; player overview, bookings, calendar; booking modal occupancy; receipt preview
- Mutation busy states for approve/reject, export, logout, **plan prices Save**; keep existing submit busy labels
- **Plan prices Save** publishes to `facilitySettingsStore`; marketing Pricing + booking unit prices read saved values
- Distinguish initial pending vs background refetch (no full skeleton flash on refetch)
- `pnpm verify` green in `app`

**Non-Goals:**

- API / schema changes (`backend`) — no server-side facility catalog yet
- Multi-device / multi-browser sync of prices (localStorage only)
- `support/` app
- Optimistic approve/reject cache updates
- Redesigning page layouts beyond placeholders and Plan prices Save
- Home section skeleton (loading) for static Pricing content

## Decisions

### 1. Shared skeleton primitives over one-off markup

- Add small presentational helpers under `app/src/components/portal/` (e.g. `PortalListSkeleton`, `PortalStatSkeleton`, `PortalCalendarSkeleton`, `PortalTableSkeleton`) built on `Skeleton`.
- **Alternatives:** inline skeletons per page — rejected (duplication); Boneyard LayoutSkeleton everywhere — rejected (heavier than needed for list/grid).

### 2. Query status contract

- **Initial:** `isPending && !data` → skeleton.
- **Refetch:** `isFetching && data` → keep content; optional subtle opacity/indicator only if already used on Players search.
- Use Query hooks already in `use-bookings` / `use-waitlist`; do not invent parallel loading stores (`data-ownership.mdc`).

### 3. Mutation busy = disable + label

- Wire `usePatchAdminBooking().isPending` (or per-id tracking if concurrent) on Approve/Reject.
- Export: local `exporting` boolean around sync CSV work.
- Logout: local busy around `logout()`.
- Plan prices Save: brief busy around persist + success status (same UX language as “Saved locally” for payment).
- Prefer button-level busy over modal overlays (`interaction-polish.mdc`).

### 4. Plan prices: draft + Save, then read from store

- Mirror GCash display: keep **draft** price inputs; **Save** calls `setPlanPrice` (or batch `setPlans`) once.
- Stop live `setPlanPrice` on every `onChange` (current Settings behavior).
- Marketing `Pricing.tsx`: read `useFacilitySettingsStore().plans` for displayed amounts (keep static copy/images/points).
- Booking totals: prefer a small helper (e.g. `getPlanUnitPrice(plan)` / extend `bookingTotal`) that reads store when available, fallback to `PLAN_META` defaults for tests/SSR-safe defaults.
- **Alternatives:** wire backend facility settings API now — deferred (non-goal); keep live-on-type without Save — rejected (user asked for Save + explicit publish).

### 5. Scope surfaces (P0/P1)

| Surface | Skeleton | Action busy |
| ------- | -------- | ----------- |
| Admin dashboard | stats + activity | — |
| Admin bookings | inbox rows | approve/reject |
| Admin detail receipt | preview box | — |
| Admin calendar | month grid | walk-in CTA if async |
| Admin players | table rows | export |
| Admin settings plan prices | — | Save |
| Player overview / bookings / calendar | yes | logout |
| BookingModal occupancy | slots/courts | submit (exists) |
| Marketing Pricing | — | reflects saved prices |

## Risks / Trade-offs

- **[Risk] Skeleton flash on fast networks** → Mitigation: only when `isPending && !data`; keep refetch content.
- **[Risk] Concurrent approve on two bookings** → Mitigation: track pending id or disable all approve/reject while any patch pending (YAGNI: single pending flag OK for v1).
- **[Risk] Visual noise / AI-slop skeletons** → Mitigation: match existing card/row rhythm; run `ai-slop-check` on new UI.
- **[Risk] Stuck skeleton on error** → Mitigation: specs require error/empty after settle; tasks wire `isError` branches where missing.
- **[Risk] Regress full-screen Suspense** → Mitigation: do not wrap portal `Routes` in a chrome-replacing Suspense; keep nested chrome Suspense / eager portal pages.
- **[Risk] Operators expect cross-device price sync** → Mitigation: copy says saved for this browser / local settings; API later.
- **[Risk] Tests hardcode PLAN_META amounts** → Mitigation: helpers fall back to defaults; update Pricing/booking tests that assert ₱300/150/500 when store is empty.

## Migration Plan

1. Ship web-only; no migrate/seed.
2. Existing persisted `pickle-era-facility-settings` keeps working; Save becomes the write path for plans.
3. Rollback: revert web deploy; localStorage may retain last saved prices.

## Open Questions

None — server catalog deferred.
