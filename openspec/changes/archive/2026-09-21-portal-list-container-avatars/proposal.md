## Why

Portal list screens (recent activity, bookings, top-ups, food orders) still render each row as its own card with vertical gaps, while the Players tab already uses one shared container with flush rows. That mismatch looks unfinished and wastes space. Players also show initials only even when the lead has a portal account with a profile photo.

## What Changes

- Unify **list layout** on player Overview recent activity, admin Dashboard recent activity, My Bookings, Admin Bookings, Top-ups Inbox, and Admin Food Orders: one bordered container, rows separated by dividers, **no** per-row card margins/gaps
- Keep empty/error/loading shells as a single container (already mostly true); do not invent a new design system beyond matching Players
- Enrich admin **Players** waitlist list responses with optional **`imageUrl`** when a matching `User` exists and has a profile image; UI shows the photo with initials fallback

## Capabilities

### New Capabilities

- `portal-list-containers`: Shared single-container list presentation for the named portal list surfaces
- `waitlist-player-avatars`: Admin waitlist/Players DTO + UI surface profile image when email matches a user with an uploaded photo

### Modified Capabilities

- (none — `openspec/specs/` has no main waitlist/list specs yet; behavior is captured as new deltas)

## Impact

- **In scope:** `api`, `web`, `plans`
- **Out of scope:** `support`; Food menu card grids; Settings food CMS rows; player wallet history rows (not Top-ups Inbox); changing Players table chrome beyond avatar; real-time avatar sync beyond list fetch; new upload flows
- **Must not break:** Existing waitlist list fields/auth; booking/top-up/food list data and actions (status, open detail); Players table columns besides avatar
- Branch: `feat/portal-list-container-avatars`
- **Deploy order:** API waitlist `imageUrl` enrichment first (web can ship list CSS independently; avatars need API)
