## Why

Player and admin portals feel spacious and card-heavy (rounded shadows, neon yellow `#f5ed5a`, decorative ball photos), while admin settings is one long scroll and player profile still shows local seed credentials plus a page logout. The unified booking Courts·Times matrix (all six courts × hours) is overwhelming. Ops want a flatter, denser portal chrome, a richer yellow, tabbed admin settings, a real player profile (avatar + password), and a calmer court grid with Indoor/Outdoor toggle.

## What Changes

- **Brand yellow:** Replace neon/lime `#f5ed5a` with a richer, more noticeable gold yellow (**`#F5C518`**) via `--color-yellow` (app-wide token so marketing + portals + email CTA stay aligned).
- **Portal density:** Player + admin portal pages use **flat** surfaces (minimal radius/shadow) and **tighter** spacing; remove `PortalBackdrop` court/ball photos from portal pages.
- **Admin Settings tabs:** Reorganize into tabs — **Prices**, **Open play sessions**, **Payment Method**, **Food menu** (existing sections; pre-signup may live under Prices or a small overflow — default: keep pre-signup under Prices or drop from primary tabs if legacy-only).
- **Player profile:** Remove local seed info banner and the profile-page Log out button (sidebar logout remains). Enable **profile photo upload**, **display-name edit** (existing patch-me), and **change password** while logged in.
- **Booking Courts·Times:** Keep Open Play session strip as-is. Replace the dense six-column “OPEN” grid with a clearer times × courts grid (reference-style cells) and an **Indoor | Outdoor** toggle (3 courts at a time). Left facility map unchanged.

## Capabilities

### New Capabilities

- `portal-chrome-density`: Flat/compact portal chrome, richer yellow token, no portal backdrop photos
- `admin-settings-tabs`: Tabbed admin Settings (Prices, Open play sessions, Payment Method, Food menu)
- `player-profile-account`: Profile cleanup + avatar upload + name edit + authenticated password change
- `booking-court-grid-ux`: Courts·Times Indoor/Outdoor toggle and calmer grid presentation (Open Play unchanged)

### Modified Capabilities

- _(none required from `openspec/specs/` — empty main specs; deltas are additive capabilities)_

## Impact

- **Repos in scope:** `web` (`app` — layouts, portal pages, Profile, AdminSettings, UnifiedBookingSchedule, CSS tokens), `api` (`backend` — expose/update user `image`; authenticated change-password; DTO fields), `plans`
- **Out of scope:** `support`; redesigning marketing landing beyond the shared yellow token; rebuilding student calendar; mutual Open Play↔court blocks
- **Assumptions:** Yellow hex `#F5C518`; Better Auth change-password for logged-in users; avatar = R2 key on `User.image` + resolved `imageUrl` on me DTO (food-style)
- **Must not break:** Booking create/pay flows; Open Play capacity; one-way reserved hours; wallet/food; sidebar navigation logout; receipt PDF uploads (still allowed outside Profile)
