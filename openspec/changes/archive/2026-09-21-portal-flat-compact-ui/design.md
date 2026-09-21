## Context

Unified booking day grid and wallet/food shipped; portals still use neon yellow `#f5ed5a`, `PortalBackdrop` photos on most `/app` and `/admin` pages, and spacious rounded cards. Admin Settings is one long scroll (`AdminSettingsPage` + `FoodMenuSettingsSection`). Profile shows seed fixture credentials and a duplicate Log out; avatar is a placeholder and “Edit profile” is a stub. `User.image` already exists in Prisma/Better Auth; `patchMe` only allows `name`. Password reset via email exists; change-password while logged in was explicitly deferred in `auth-password-reset-email`. Courts·Times currently renders all six `COURTS` columns with short “OPEN” cells.

**In scope:** `web` (`app`), `api` (`backend`), `plans`. Cite: `app/.cursor/skills/SKILL.md` → `ui/`, `pages/page-layout.mdc`, `api/api-layer.mdc`; `backend/.cursor/skills/SKILL.md` → `platform/platform-patterns.mdc`, `api/http-api.mdc`, `integrations/file-uploads.mdc`.

## Goals / Non-Goals

**Goals:**
- Richer yellow `#F5C518` in CSS tokens + Resend `BRAND_YELLOW`
- Flat/compact portal pages; remove all `PortalBackdrop` usages from portal pages
- Tabbed admin Settings: Prices · Open play sessions · Payment Method · Food menu
- Profile: drop seed banner + page logout; avatar upload; name edit; logged-in change password
- Courts·Times: Indoor|Outdoor toggle (3 courts); calmer cells; Open Play strip untouched

**Non-Goals:**
- Redesigning marketing landing layout (token sync only)
- New facility settings persistence backend (Zustand store stays)
- Mutual Open Play↔court blocking; capacity math changes
- Support app; forced password change on first invite login

## Decisions

1. **Yellow hex `#F5C518`**
   - Update `app/src/index.css` (`--color-yellow`, `--primary`, `--ring`) and `backend/src/lib/resend/client.ts` `BRAND_YELLOW`; update email tests.
   - Prefer token over scattering hex. Demo SVG receipt hardcodes may stay or follow — prefer updating if visible in UI.
   - Alternatives: keep `#f5ed5a` with saturation tweak only → rejected (user asked richer, more noticeable).

2. **Remove backdrop, densify chrome**
   - Delete `PortalBackdrop` imports/usages from portal pages; leave component file deletable if unused, or keep unused for now and remove if dead.
   - Prefer tightening `AppPageShell` / section wrappers (less `rounded-2xl shadow-sm`, smaller gaps) over inventing a new design system.
   - Alternatives: CSS-only hide backdrop → rejected (still loads assets / layout noise).

3. **Admin Settings tabs**
   - Client-only tab state on `AdminSettingsPage` (URL hash optional; default in-memory). Reuse existing save handlers per section.
   - Pre-signup controls nest under **Prices**.
   - Alternatives: four routes under `/admin/settings/*` → deferred (overkill for local Zustand).

4. **Avatar via existing uploads + `User.image` (food-style key → URL)**
   - Client: presign + PUT (jpeg/png/webp only — reject PDF on Profile even though uploads allow PDF for receipts).
   - Persist **storage key** on `User.image` via `PATCH /auth/me` body field `image` (string key or `null` to clear). Do not expose the raw key on read DTOs.
   - Mapper pattern matches food: `toUserDto(row, imageUrl)` — resolve URL in the auth **service** with `createPresignedDownload` before mapping (login, me, patchMe responses).
   - After successful patch, web refreshes session/`me` so chrome/profile show the new avatar.
   - Alternatives: store public URL in `User.image` → rejected (private bucket; URLs expire). Separate Avatar table → YAGNI.

5. **Change password via Better Auth**
   - Prefer Better Auth client `changePassword` (current + new) from Profile; if unavailable, thin Express wrapper calling `auth.api.changePassword` with session cookies — same header pattern as reset.
   - On success: user **stays logged in**; no forced re-login.
   - Alternatives: only email reset → rejected (explicit profile requirement).

6. **Profile name edit (replace stub)**
   - Replace “Edit profile isn’t available yet” with a small name editor using existing `patchMe` `{ name }` (email stays read-only).
   - Alternatives: leave stub → rejected (conflicts with new avatar/password UI).

7. **Indoor/Outdoor filter in `UnifiedBookingSchedule`**
   - Local state `courtGroup: "Indoor" | "Outdoor"` default Indoor; `COURTS.filter(c => c.group === courtGroup)`.
   - Toggle UI above Courts·Times headers; map left unchanged; Open Play strip unchanged.
   - When toggling groups, **keep** existing selection in state (hidden courts stay selected until user clears or switches plan); do not wipe on toggle.
   - Cell copy/styling: prefer short time labels + clearer selected/held/reserved states (iterate toward reference look without pixel-perfect clone).
   - Alternatives: collapse Indoor/Outdoor as section headers in one scroll → rejected (user asked toggle).

## Risks / Trade-offs

- [Better Auth changePassword API surface unclear in-tree] → Confirm against installed `better-auth` docs/types during apply; fall back to authenticated `auth.api` call
- [Presigned avatar URLs expire] → Accept short TTL like food images; refresh on `me` refetch; do not cache forever in Zustand
- [Removing backdrop + densifying many pages] → Large cosmetic diff; keep behavior tests; update selectors that target backdrop
- [Yellow change affects marketing + emails] → Intentional brand sync; update email unit tests expecting `#f5ed5a`
- [Hidden outdoor selection while on Indoor] → Keep selection; summary/pay still reflects full selection; user can switch Outdoor to edit those hours

## Migration Plan

1. Deploy API (`imageUrl` on user DTO, patchMe image key, change-password if server route added) then web.
2. No DB migration — `User.image` already exists.
3. Rollback: revert CSS/token + UI; password/avatar endpoints unused harmlessly.

## Open Questions

- None blocking — pre-signup under Prices and Indoor default are locked assumptions in specs.
