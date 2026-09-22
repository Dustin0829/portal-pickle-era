## Context

Portal shell pages under `app/src/pages/admin/**` and `app/src/pages/app/**` ship inconsistent page `h1` scales. Admin Dashboard and Overview already use `display text-[28px] text-zinc-900 sm:text-[32px]` with brand `text-yellow` accents. Several inbox/list pages use `text-[42px] sm:text-[52px]` with `text-amber-600` accents; calendars use `text-[32px] sm:text-[40px]`; Settings/Food use mid sizes. Product direction: match Admin Dashboard everywhere in both portals; no orange on titles.

**kit.repos in scope:** `web`, `plans` (no `api` / `support`).

Applicable web rules/skills (cite only): `app/.cursor/skills/SKILL.md` → `app/.cursor/rules/core/ponytail-rules.mdc`, `app/.cursor/rules/pages/page-layout.mdc`, `app/.cursor/rules/ui/design-tokens.mdc`, `app/.cursor/rules/copy/ui-microcopy.mdc`, `app/.cursor/skills/merge-readiness-check/SKILL.md`.

## Goals / Non-Goals

**Goals:**

- One canonical portal page-title size (dashboard tokens) on all admin + player shell page `h1`s.
- Replace title-accent `text-amber-600` with `text-yellow`.
- Minimal class-string edits; keep existing two-word title copy.

**Non-Goals:**

- Shared `PageTitle` abstraction (YAGNI for this change).
- Changing marketing, auth, modals/dialogs, section `h2`s, sheet detail `display` amounts, or amber status/icon treatments.
- Adding yellow accents to currently plain (zinc-only) page titles.
- Backend or support-app changes.
- Introducing new design tokens beyond existing `yellow` / `display`.

## Decisions

1. **Canonical class string** — Use exactly `display text-[28px] text-zinc-900 sm:text-[32px]` on each portal page `h1`, matching `AdminDashboardPage` / `OverviewPage`.  
   - *Alternatives:* CSS variable / `@apply` utility, shared `PageTitle` component. Rejected for this pass as overkill (ponytail); revisit if a third portal appears.

2. **Accent token** — `text-yellow` only for `h1` accent spans. Map known offenders: Admin Bookings, Top-ups, Food orders (`text-amber-600` → `text-yellow`). Pages already on yellow (Calendar, Bookings player, Overview, Dashboard) keep accents as-is after size fix.

3. **Inventory (apply checklist)** — Update `h1` size on:  
   - Admin: Bookings, Top-ups, Food orders, Waitlist/Players, Calendar, Settings  
   - Player: Bookings, Wallet, Profile, Calendar, Food, PlayerComingSoon  
   - Already correct size: Admin Dashboard, Player Overview  

4. **Tests** — Prefer a lightweight class/snapshot or render assertion on 1–2 representative pages if existing page tests exist; otherwise visual/manual verify is enough for a CSS-token change (no new API surface). Follow `app/.cursor/rules/testing/vitest-testing.mdc` only if touching tested files.

## Risks / Trade-offs

- **[Risk] Missed page `h1`** → Mitigation: grep `pages/admin` + `pages/app` for `h1 className="display` before merge; include Coming soon.  
- **[Risk] Over-replacing amber elsewhere** → Mitigation: only change amber classes that sit inside page `h1` accents.  
- **[Trade-off] Titles look smaller on inbox pages** → Intentional; consistency over former hero-scale inbox titles.

## Migration Plan

- Single frontend PR; no deploy order with API.  
- Rollback: revert the class-string commit.

## Open Questions

- None material — `PlayerComingSoon` included as a player portal page title per proposal assumptions.
