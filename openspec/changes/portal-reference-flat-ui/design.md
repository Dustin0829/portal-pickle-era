## Context

Follow-up to `portal-flat-compact-ui` (yellow token, backdrop removal, settings tabs, profile, Indoor/Outdoor baseline). Booking modal is still dark + month calendar + map left; Food is a single-column list; portal pages still sprinkle `shadow-sm`/`shadow-md`. User supplied three references: Courts·Times booking grid, POS food ordering, ARP flat admin dashboard.

**In scope:** `web` only (+ `plans`). Cite: `app/.cursor/skills/SKILL.md` → `pages/page-layout.mdc`, `pages/page-composition.mdc`, `ui/`, `copy/ui-microcopy.mdc`, `state/async-ui.mdc`, `api/api-layer.mdc`.

## Goals / Non-Goals

**Goals:**
- Flat portal surfaces (no content-card shadows; thin borders; Pickle Era colors)
- Booking modal rebuilt to reference layout + court photo right
- Player Food POS two-column layout (menu + order sidebar)

**Non-Goals:**
- Backend/API changes
- Support app; marketing landing redesign
- Admin food-orders POS; Print Bill; multi-order tabs; tax line items
- Pixel-perfect clone of cream/brown or orange — adapt to PE tokens

## Decisions

1. **Flat surfaces = border, not shadow**
   - Sweep `/app` and `/admin` pages: drop `shadow-sm|md|lg` on cards/panels; keep `border border-zinc-200`.
   - Dropdown menus may keep a light shadow for layering (not “content cards”).
   - Modal overlays: keep dimmed backdrop + one shell elevation; inner panels flat.
   - Alternatives: global CSS `* { box-shadow: none }` → rejected (breaks intentional overlays).

2. **Booking chrome: light reference, PE accents**
   - Replace dark schedule chrome with cream/zinc light surface; accents via `--color-yellow` / black text.
   - Structure: header (back → parent close + date pill) → Open Play | Private Court chooser → date strip → Times×CRT grid | court image right.
   - Reuse `UnifiedBookingSelection` / occupancy / capacity hooks; re-skin and restructure layout in `UnifiedBookingSchedule` (or split presentational subcomponents). Pass `onBack`/`onClose` from BookingModal/WalkIn.
   - Horizontal date strip: ~7–14 days around selected date with prev/next; month calendar demoted or removed from primary path.
   - Open Play row: colspan=3 button; private: per-court cells. Indoor|Outdoor toggle retained above grid headers.
   - Court photo: existing `/image.png` (facility map) in right column; omit when `compact`.
   - Alternatives: keep dark theme with only cell tweaks → rejected (user asked for reference look).

3. **Food POS without new API**
   - Refactor `FoodPage` to CSS grid `1fr 320px` (stack on `md` breakpoint).
   - Cards use `imageUrl` when present; qty state stays local until Place order.
   - Sidebar: lines, total, pay mode, notes, Place order — same `useCreateMyFoodOrder`.
   - Categories: single “All menu” tab unless menu gains categories later.
   - Alternatives: port full POS multi-order → rejected (YAGNI).

4. **Branch base**
   - Implement on branch from main after `portal-flat-compact-ui` merges (or include that branch) so yellow/Indoor/Outdoor/profile work is present.

## Risks / Trade-offs

- [Large booking modal rewrite] → Keep selection/API wiring tests; visual rebuild in one component tree
- [Date strip vs month calendar] → Date strip is primary; ensure bookable floor still enforced
- [Past slots on “today”] → Keep `isSlotPast`; show Past state like reference
- [Food sidebar on mobile] → Stack order panel under menu; sticky CTA optional
- [Shadow sweep misses shared components] → Grep `shadow-` under `pages/app`, `pages/admin`, `components/portal`

## Migration Plan

1. Web-only deploy after `portal-flat-compact-ui` is on the target base.
2. No migrations / env changes.
3. Rollback: revert web PR.

## Open Questions

- None blocking — cream adapted to PE zinc/yellow; `/image.png` for court photo; no food categories beyond All.
