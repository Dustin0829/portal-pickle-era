## Why

Food ordering is not ready to operate, but the Food tab is still the fourth item in both portal sidebars and food rows still appear in player Overview and admin Dashboard activity — so players can place orders nobody will fulfil. Separately, both portals still read tall and airy (wide sidebar, oversized display headings, generous page padding) compared to the reference admin console the owner wants, which fits stats plus a full activity list above the fold.

Food is being **hidden, not removed**: pages, API, and the admin Food-menu settings tab stay in place behind a single flag so ordering can be switched back on without re-implementation.

## What Changes

- **Food hidden behind one flag:** A new `FOOD_ENABLED` web feature flag (default `false`) removes the Food nav item from the player and admin sidebars, suppresses food rows and food CTAs in player Overview and admin Dashboard activity, and skips the food queries entirely so hidden surfaces do no network work.
- **Food routes redirect:** `/app/food` redirects to `/app` and `/admin/food` redirects to `/admin` while the flag is off. `FoodPage` and `AdminFoodOrdersPage` remain in the codebase and mounted behind the flag.
- **Food menu management stays:** The admin Settings **Food menu** tab is unchanged — menu rows were deliberately preserved in the database and must remain editable.
- **Compact portal chrome:** Narrower sidebar, tighter brand block and nav rows, pill active state, and an avatar + name + email sidebar identity block in place of the current bare name line, matching the reference console's sidebar.
- **Compact page density:** Shared page shell drops vertical padding and section gaps; portal page headers become a single title-plus-action row with a smaller heading; stat cards and activity rows tighten so player Overview and admin Dashboard show stats plus the full recent-activity list without scrolling on a laptop viewport.
- **Theme preserved:** Black sidebar, `#F5C518` yellow accent, and the existing light `portal-shell` content surface are unchanged — only density, hierarchy, and the sidebar identity block follow the reference.

## Capabilities

### New Capabilities

- `food-visibility-flag`: Single web flag that hides every Food entry point (nav, activity rows, CTAs, queries) and redirects food routes, while keeping food pages, food API, and the admin Food-menu settings tab intact for re-enabling
- `portal-compact-density`: Compact portal chrome (sidebar width, nav rows, identity footer) and compact page density (shell padding, page headers, stat cards, activity rows) for both player and admin portals, retaining the existing black/yellow theme

### Modified Capabilities

- _(none — `openspec/specs/` is empty; prior portal density work lives in unarchived change deltas, so these are additive capabilities)_

## Impact

- **Repos in scope:** `web` (`app` — new `lib/featureFlags.ts`, `App.tsx` routes, both portal layouts, `PortalChrome`, `AppPageShell`, `portal-skeletons`, `OverviewPage`, `AdminDashboardPage`, the `pages/page-layout.mdc` spacing rule, affected tests), `plans`
- **Out of scope:** `api` (`backend` — food endpoints, schema, and seeded menu rows untouched), `support`, marketing pages, the admin Settings Food-menu tab, and any deletion of food code or data
- **Assumptions:** Flag is a build-time constant in the web app (no API, no env var, no per-facility toggle) since this is a temporary facility-wide pause; reference console is followed for density and hierarchy only, not for its light sidebar or red accent
- **Blast radius of the shell change:** `AppPageShell` is shared by every portal page (Bookings, Wallet, Calendar, Profile, Settings, Players, Top-ups, admin Bookings) plus `NotFoundPage`, so the rhythm change reaches all of them by design; only Overview and Dashboard get per-page tuning in this change
- **Must not break:** Booking create/pay flows, wallet and top-ups, Open Play sessions, admin Settings tabs including Food menu, facility settings API reads, sidebar logout, admin Dashboard stat values (sales, bookings, players — all derived from bookings and waitlist, never from food), 320px reflow and 44×44 touch targets on portal nav, and the shared `appContentPaddingClass` contract asserted in `app/src/test/components/layout/appContentPadding.test.ts`
- **Rule impact:** `app/.cursor/rules/pages/page-layout.mdc` currently mandates `gap-8` page zones and `py-8 sm:py-10` shell padding; the compact tokens must be written into that rule in the same change or merge-readiness will read the new spacing as a rule violation
- **Test impact:** `app/src/test/layouts/StudentFoodNav.test.tsx` currently asserts the Food link exists and must be inverted; `PortalAccess.test.tsx` asserts the food-flavored Overview empty state; `FoodPage.test.tsx` and portal page tests that assert current spacing or activity contents need review
