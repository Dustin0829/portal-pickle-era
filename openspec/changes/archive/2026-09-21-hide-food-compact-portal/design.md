## Context

Both portals share one chrome (`app/src/components/portal/PortalChrome.tsx`) and one page shell (`app/src/components/layout/AppPageShell.tsx`), so density is a two-file lever plus per-page header/card tuning. Food, by contrast, leaks into six places: the two layout nav arrays, two routes in `App.tsx`, and the activity/CTA sections of `OverviewPage.tsx` and `AdminDashboardPage.tsx`.

Food data was deliberately preserved during the recent production cleanup — menu items and payment methods were the only rows kept — so this change must hide the ordering experience without touching food persistence or the admin Settings Food-menu tab.

Applicable rules from `app/.cursor/skills/SKILL.md`:

- `app/.cursor/rules/core/ponytail-rules.mdc` — minimal diff; hiding must not become a refactor of food code
- `app/.cursor/rules/pages/page-layout.mdc` — `AppPageShell`, rhythm, responsive and mobile rules govern the density pass
- `app/.cursor/rules/ui/design-tokens.mdc` — density changes must go through existing tokens, not new hardcoded colors
- `app/.cursor/rules/ui/boneyard-skeletons.mdc` — skeletons must track the new compact heights
- `app/.cursor/rules/state/async-ui.mdc` — gated queries must not leave stale pending states behind
- `app/.cursor/rules/forms/accessibility.mdc` — sidebar identity block and nav must stay reachable and labelled
- `app/.cursor/rules/security/route-protection.mdc` — food route redirects sit inside the existing guard, not around it
- `app/.cursor/rules/testing/vitest-testing.mdc` — test files mirror source paths for the inverted Food nav test

## Goals / Non-Goals

**Goals:**

- One flag flips Food off today and back on later with no other source edits
- Zero food network requests from hidden surfaces
- Player Overview and admin Dashboard fit stats plus full activity above the fold on a laptop
- Shared chrome and shell carry most of the density change so both portals move together

**Non-Goals:**

- Deleting food pages, food API modules, food endpoints, or food data
- Hiding or altering the admin Settings Food-menu tab
- Any `backend` change, any `support` change, any marketing page change
- Adopting the reference console's light sidebar or red accent
- Per-facility or runtime-configurable food toggling

## Decisions

### Build-time constant over API-driven or env flag

`FOOD_ENABLED` is a plain exported constant in `app/src/lib/featureFlags.ts`.

Alternatives considered: (a) an env var via `import.meta.env` — adds a Railway variable to manage and a deploy-time failure mode for a temporary pause; (b) a field on the facility-settings API we just built — the right long-term home for per-facility feature toggles, but it costs a schema migration, DTO change, and a loading state on every gated surface, which is disproportionate for "turn this off for now". A constant keeps the diff reviewable and the re-enable path a one-line commit. If food returns as a per-facility feature, the constant is the seam to swap for a settings field.

### Filter nav arrays rather than comment out items

Both layouts keep their full `items` array and apply a conditional filter. Commenting out the entries would hide them too, but a filter keeps the Food entry in source as live code that type-checks, so the item cannot rot while it is hidden.

### Redirect food routes inside the existing portal route tree

`/app/food` and `/admin/food` stay declared as routes but render `<Navigate replace>` when the flag is off, keeping the elements mounted behind the flag. This preserves the `ProtectedRoute` layout wrapper, so auth behavior for those URLs is identical to every other portal route, and `replace` avoids a Back-button loop. Removing the routes entirely would send visitors to the 404 page, which reads as breakage rather than a paused feature.

### Gate the query at its `enabled` argument

`useMyFoodOrders(Boolean(user) && FOOD_ENABLED)` and the admin equivalent keep the hooks called unconditionally — React's rules of hooks forbid conditional calls — while preventing the request. Downstream derived values (`foodLoading`, `foodFailed`, the food branch of `recent`) then collapse to their bookings-only forms.

### Density lives in shared chrome and shell first

Sidebar width, nav row padding, brand block, and identity footer change once in `PortalChrome`; vertical rhythm changes once in `AppPageShell`. Only what the shared components cannot reach — page heading size, stat card internals, activity row padding — is touched per page. `appContentPaddingClass` is explicitly left alone because `app/src/test/components/layout/appContentPadding.test.ts` pins it as a cross-page alignment contract.

Target values, to be treated as the starting point rather than gospel: sidebar `w-64` → `w-56`; brand block `px-5 py-6` → `px-4 py-4` with the "A new era of pickleball" subline dropped; nav `gap-1.5 px-3 py-5` → `gap-0.5 px-2.5 py-3` with rows at `text-[13px]` normal-case and a `rounded-full` active pill; mobile header `h-14` → `h-12`; shell `py-8 sm:py-10` → `py-5 sm:py-6` and `gap-8` → `gap-5`; page headings `text-[42px] sm:text-[52px]` → `text-[28px] sm:text-[32px]`; activity rows `py-4` → `py-3`.

### The spacing rule moves with the code

`app/.cursor/rules/pages/page-layout.mdc` is not neutral about density: its Spacing rhythm table pins page zones at `gap-8`, its Alignment section pins shell padding at `py-8 sm:py-10`, and its checklist asserts "Major phases separated (`gap-8`…)". Shipping compact spacing without editing that rule leaves the repo self-contradictory and guarantees a Cursor-rules Fail in the next `merge-readiness-check`. The rule is updated to the new compact tokens as part of this change, so the rule keeps describing reality.

### Compact on desktop, thumb-sized on touch

The same rule enforces a 44×44 CSS px minimum hit area (WCAG 2.5.5). A nav row at `py-2` with `text-[13px]` lands near 34px, which is fine for a pointer but fails on touch. Nav rows therefore carry a touch-height floor (`min-h-11` or equivalent) that applies in the mobile drawer while the desktop sidebar renders at the compact height. Density is a pointer-surface goal, not a reason to shrink thumb targets.

### Skeletons change with the content they stand in for

`PortalStatSkeleton` and `PortalListSkeleton` in `app/src/components/portal/portal-skeletons.tsx` hardcode the current card padding and row heights. They are updated in the same pass so nothing shifts when data resolves.

## Risks / Trade-offs

- **Hidden code decays** → The flag is a constant, so TypeScript and lint still cover the food pages and the flagged route elements; `FoodPage.test.tsx` stays green because it mounts the page directly rather than routing to it.
- **Nav label truncation at `w-56`** → Longest labels are "Court calendar" and "My bookings"; the density pass switches nav rows off wide uppercase tracking to normal-case `text-[13px]`, which shortens them well inside the new width. Verify visually before committing.
- **Broad test churn from the density pass** → Several portal page tests assert current copy and structure. Scope the updates to assertions that the density change genuinely invalidates; resist rewriting tests to match whatever the new markup happens to emit.
- **Overview empty state and error copy mention food** → These are user-visible strings, not just markup, and `PortalAccess.test.tsx` asserts the food-flavored copy at line 205. Copy must be reworded for bookings only and the test updated deliberately.
- **Above-the-fold goal is viewport dependent** → The stated target is a 1024×640 content area with a full activity list. On shorter viewports scrolling is still expected; the requirement is a density target, not a promise for every device.
- **Sidebar email exposure** → The identity block surfaces the signed-in user's own email in their own session only, matching the reference; no other user's data is shown.
- **Shell change reaches pages nobody reviewed** → `AppPageShell` is used by every portal page and by `NotFoundPage`. That spread is intended (one rhythm everywhere), but each consumer needs a visual smoke check at desktop and 320px before commit, not just Overview and Dashboard.
- **Dashboard stats are safe** → Grounded check: `totalSales` sums approved bookings, `totalBookings` counts ranged bookings, and `totalPlayers` counts waitlist rows. None read `foodOrders`, so gating the food query cannot move a stat value. The regression risk is limited to the activity list.

## Migration Plan

Single web deploy, no backend or database change and no data migration. Food endpoints stay live, so any in-flight order placed before the deploy remains readable through the API and through the admin Settings Food-menu data.

Rollback: revert the commit, or set `FOOD_ENABLED` to `true` and redeploy to restore Food alone while keeping the compact layout.

Sequencing within the change: land the Food hide first and verify, then the density pass. The two are independent, and keeping them as separate commits on one branch makes the density diff readable without the food noise.

## Resolved Questions

- **No "food is paused" notice.** Food disappears silently. A notice would need copy, a placement, and its own removal later; the flag already answers "how do we bring it back", and players who never see the tab will not look for it.
- **Per-page tuning is limited to Overview and Dashboard.** The shared chrome and shell already move every portal page, which is the bulk of the win. Bookings, Wallet, Calendar, Profile, Settings, Players, and Top-ups inherit the new rhythm and are smoke-checked, not redesigned; any page-specific tightening they need is a follow-up change rather than scope creep here.

## Open Questions

- None outstanding.
