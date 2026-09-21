Branch: `feat/hide-food-compact-portal`

## 1. web — hide Food behind a flag

- [x] 1.1 Add `app/src/lib/featureFlags.ts` exporting `FOOD_ENABLED = false` with a one-line comment stating food is paused, not removed (`app/.cursor/rules/core/ponytail-rules.mdc`)
- [x] 1.2 Filter the `/app/food` item out of the nav array in `app/src/layouts/StudentPortalLayout.tsx` when `FOOD_ENABLED` is false, keeping the entry in source
- [x] 1.3 Filter the `/admin/food` item out of the nav array in `app/src/layouts/AdminPortalLayout.tsx` the same way
- [x] 1.4 In `app/src/App.tsx`, render `<Navigate to="/app" replace />` for `/app/food` and `<Navigate to="/admin" replace />` for `/admin/food` while the flag is off, leaving both page components imported and mounted behind the flag (`app/.cursor/rules/security/route-protection.mdc`)
- [x] 1.5 In `app/src/pages/app/overview/OverviewPage.tsx`, gate `useMyFoodOrders` on `Boolean(user) && FOOD_ENABLED`, drop food entries from `recent`, collapse `foodLoading`/`foodFailed` into bookings-only loading and error states, remove the "Order food" link, and reword the empty state to bookings only (`app/.cursor/rules/state/async-ui.mdc`, `app/.cursor/rules/copy/ui-microcopy.mdc`)
- [x] 1.6 In `app/src/pages/admin/dashboard/AdminDashboardPage.tsx`, gate `useAdminFoodOrders` the same way, drop food activity entries and the `/admin/food` href, and collapse the food error branch
- [x] 1.7 Remove the now-unused food imports from both pages (`foodOrderStatusLabel`, food DTO types, `UtensilsCrossed` where no longer referenced) so lint stays clean
- [x] 1.8 Confirm `app/src/pages/admin/settings/AdminSettingsPage.tsx` and its Food menu section are untouched
- [x] 1.9 Invert `app/src/test/layouts/StudentFoodNav.test.tsx` to assert no Food link renders, and add admin-side coverage plus a redirect assertion for `/app/food` and `/admin/food` (`app/.cursor/rules/testing/vitest-testing.mdc`)
- [x] 1.10 Update the food-flavored assertion in `app/src/test/pages/portal/PortalAccess.test.tsx` (line ~205) to the new bookings-only empty state copy
- [x] 1.11 Confirm `app/src/test/pages/app/food/FoodPage.test.tsx` still passes by mounting the page directly; adjust only if it routes through the redirect
- [x] 1.12 Run `pnpm format:check && pnpm lint && pnpm exec tsc -b --noEmit` in `app`

## 2. web — compact portal chrome

- [x] 2.1 In `app/src/components/portal/PortalChrome.tsx`, narrow the sidebar to `w-56` and tighten the brand block to `px-4 py-4` with a smaller logo, dropping the "A new era of pickleball" subline
- [x] 2.2 Tighten `SidebarNav` to `gap-0.5 px-2.5 py-3` with `text-[13px]` normal-case rows and a `rounded-full` yellow active pill, keeping the existing hover treatment (`app/.cursor/rules/ui/design-tokens.mdc`)
- [x] 2.3 Replace `SidebarFooter` content with an initials avatar plus truncating name and email, keeping the Log out control and its pending state accessible (`app/.cursor/rules/forms/accessibility.mdc`)
- [x] 2.4 Reduce the mobile header to `h-12` and apply the same nav density inside the mobile drawer
- [x] 2.5 Give nav rows and the Log out control a 44×44 minimum hit area on touch viewports while keeping the compact desktop height (`app/.cursor/rules/pages/page-layout.mdc` touch targets)
- [x] 2.6 Cover the identity block with a test: initials derived from the signed-in name (including single-word names), name and email rendered, Log out still reachable (`app/.cursor/rules/testing/vitest-testing.mdc`)
- [x] 2.7 Verify nav labels ("Court calendar", "My bookings") do not truncate at the new width on desktop and in the drawer

## 3. web — compact page density

- [x] 3.1 In `app/src/components/layout/AppPageShell.tsx`, reduce vertical padding to `py-5 sm:py-6` and the section gap to `gap-5`, leaving `appContentPaddingClass` and `appContentWidthClass` unchanged (`app/.cursor/rules/pages/page-layout.mdc`)
- [x] 3.2 Reduce the `OverviewPage` heading to `text-[28px] sm:text-[32px]` and keep title plus booking button on one desktop row that stacks on mobile
- [x] 3.3 Apply the same header treatment to `AdminDashboardPage` with the range selector as the right-hand action
- [x] 3.4 Tighten stat cards on both pages: smaller padding, small uppercase label, `text-2xl` value, icon top-right
- [x] 3.5 Tighten recent-activity rows on both pages to `py-3` with dividers, a small leading icon, and right-aligned timestamps
- [x] 3.6 Update `PortalStatSkeleton` and `PortalListSkeleton` in `app/src/components/portal/portal-skeletons.tsx` to the new compact heights so nothing shifts on resolve (`app/.cursor/rules/ui/boneyard-skeletons.mdc`)
- [x] 3.7 Smoke-check every other shell consumer at desktop and 320px — player Bookings, Calendar, Wallet, Profile; admin Bookings, Top-ups, Calendar, Players, Settings; and `NotFoundPage` — deferred to the deploy preview per owner decision (local backend container is broken; no login possible)
- [x] 3.8 Update the spacing rhythm table, the `py-8 sm:py-10` alignment line, and the `gap-8` checklist item in `app/.cursor/rules/pages/page-layout.mdc` to the new compact tokens so the rule matches the code
- [x] 3.9 Check `/app` and `/admin` in a 1024×640 content area — deferred to the deploy preview per owner decision (no local backend)
- [x] 3.10 Confirm `app/src/test/components/layout/appContentPadding.test.ts` still passes unchanged
- [x] 3.11 Update portal page tests whose assertions the density change genuinely invalidates, without rewriting them to match arbitrary new markup
- [x] 3.12 Run `pnpm format:check && pnpm lint && pnpm exec tsc -b --noEmit` in `app`

## 4. plans

- [x] 4.1 Run `openspec validate hide-food-compact-portal --strict` from the repo root

## 5. Ship

- [x] 5.1 Run `pnpm verify` in `app` and `@merge-readiness-check` (`app/.cursor/skills/merge-readiness-check/SKILL.md`)
- [x] 5.2 `/opsx-verify`
- [x] 5.3 `/opsx-pr` (one PR from the repository root)
