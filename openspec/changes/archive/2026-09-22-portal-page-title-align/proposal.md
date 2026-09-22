## Why

Admin and player portal page titles use inconsistent display sizes (`text-[28px]/[32px]` vs `[32]/[40]`, `[36]/[44]`, `[42]/[52]`) and some accent the second word with orange (`text-amber-600`) instead of brand yellow (`text-yellow`). Ops and players see uneven hierarchy; the Admin Dashboard title is the agreed visual standard.

## What Changes

- Standardize every **portal page `h1`** (admin + player) to the Admin Dashboard size: `display text-[28px] text-zinc-900 sm:text-[32px]`.
- Where a page title accents a second word (e.g. “Bookings **inbox**”, “My **bookings**”), use `text-yellow` only — replace `text-amber-600` on those accents.
- Leave non-title amber usage alone (status chips, receipt icons, secondary links, section labels) unless it is part of the page `h1`.
- Do not invent yellow accents on titles that are currently plain zinc (Settings, Players, Profile, Wallet, Food, Coming soon).
- Out of scope: marketing site, auth/login/signup/forgot/reset heroes, modal/sheet headers and nested `display` amounts, and support app.
- **Must not break:** Admin Dashboard / Overview title look; pending/status amber chips; modal title treatments.

## Capabilities

### New Capabilities

- `portal-page-title-align`: Shared portal page-title size and accent color rules for admin and player shell pages.

### Modified Capabilities

- (none in main `openspec/specs/` — delta lives under this change)

## Impact

- **In scope:** `web` (`app/`), `plans`
- **Out of scope / non-goals:** `api`, `support`; marketing/home; auth screens; modal/sheet titles and nested `display` amounts; status badge colors; shared `PageTitle` component; inventing yellow accents on plain titles
- **Assumptions:** Canonical size is Admin Dashboard (`text-[28px] sm:text-[32px]`); brand accent token is `text-yellow` (Tailwind theme yellow), not amber/orange; `PlayerComingSoon` counts as a player portal page title
- **Code (likely):** `app/src/pages/admin/**` and `app/src/pages/app/**` page `h1`s (Bookings, Top-ups, Food, Waitlist/Players, Calendar, Settings, Wallet, Profile, Overview already aligned, Coming soon)
