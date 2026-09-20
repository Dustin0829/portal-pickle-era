## 1. web — density, gutters, Food cart, pay select

- [x] 1.1 Add Dashboard width token (`max-w-5xl`, e.g. `width="wide"`) in `layout.constants` / `AppPageShell`; sweep portal pages off divergent `max-w-4xl`/`6xl`/`3xl` shells (Profile MAY stay narrow) (`pages/page-layout.mdc`)
- [x] 1.2 Confirm all portal shells use `appContentPaddingClass` (no one-off shell `px-*`) (`pages/page-layout.mdc`)
- [x] 1.3 Lock sidebar nav padding/gap/type/active pill on shared `PortalChrome` (desktop + mobile drawer) for player + admin (`ui/`)
- [x] 1.4 Align Admin Settings tablist `px`/`py`/`gap`/label size to the same density (keep underline + ARIA) (`pages/page-composition.mdc`)
- [x] 1.5 Sweep other portal `role="tablist"` / section tabs; only adjust if density diverges
- [x] 1.6 Food Your order: remove icon per line → clear qty; accessible name (`pages/page-composition.mdc`, `ui/icons-and-assets.mdc`, `copy/ui-microcopy.mdc`)
- [x] 1.7 Food menu + cart images: fixed equal boxes with `object-cover` + matching placeholders (`ui/icons-and-assets.mdc`)
- [x] 1.8 Booking pay + Wallet top-up: select payment method first, then QR/details; shared component; demote/remove carousel prev/next (`pages/page-composition.mdc`, `forms/`)
- [x] 1.9 Vitest: padding/width token; Settings tabs; Food remove + image boxes; pay chooser before QR when ≥2 methods (`testing/vitest-testing.mdc`)
- [x] 1.10 Mid-apply: `cd app &&` kit `verify_fast`
- [x] 1.11 Full `cd app && pnpm verify` + merge-readiness before ship

## 2. plans

- [x] 2.1 `openspec validate portal-tab-padding-align`

## 3. Ship

- [x] 3.1 `/opsx-verify` (web)
- [ ] 3.2 `/opsx-pr` (branch `feat/portal-tab-padding-align`)
