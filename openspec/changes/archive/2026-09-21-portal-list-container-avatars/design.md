## Context

Several portal list UIs still use `ul` + `gap-3` with each `<li>` as its own `rounded-2xl border` card (Overview recent, Admin Dashboard activity, Bookings, Admin Bookings, Top-ups, Admin Food Orders). Players (`AdminWaitlistPage`) already uses one `overflow-hidden rounded-2xl border … bg-white` wrapper with `border-b` rows — that is the visual target.

Players avatars are initials only. Profile photos live on `User.image` and are already exposed as `imageUrl` on auth/profile via `createPresignedDownload`. Waitlist list DTO has no image field and does not join users.

**In scope:** `api` + `web`. Cite `backend/.cursor/skills/SKILL.md` → `module-boundaries`, `api/http-api.mdc`, `api/response-contracts.mdc`, `api/api-evolution.mdc`, `integrations/file-uploads.mdc`, `testing/`; `app/.cursor/skills/SKILL.md` → `api/api-layer.mdc`, `pages/page-layout.mdc`, `ui/`, `testing/vitest-testing.mdc`.

## Goals / Non-Goals

**Goals:**
- Match Players-style single container on the six in-scope list surfaces
- Admin waitlist list returns nullable `imageUrl`; Players Name column shows photo with initials fallback

**Non-Goals:**
- Extracting a shared React `ListContainer` package unless a tiny local helper clearly reduces duplication (prefer copy the class pattern from Players)
- Food menu grids, Settings CMS rows, player wallet ledger
- Persisting image URLs on waitlist rows; websocket avatar updates
- Support app

## Decisions

### A. List container CSS (web only)

1. **Pattern** — Outer: `overflow-hidden rounded-2xl border border-zinc-200/80 bg-white`. List: `flex flex-col` with **no** `gap-*`. Row: `border-b border-zinc-100 last:border-b-0` (drop per-row outer `rounded-2xl border` / shadow). Preserve inner date-rail / status layout.  
   **Rejected:** Keep gap-3 and only remove margin classes (still reads as stacked cards).

2. **Surfaces** — `OverviewPage` recent `ul`; `AdminDashboardPage` activity list; `BookingsPage` + `AdminBookingsPage` list; `AdminWalletTopUpsPage` list; `AdminFoodOrdersPage` list. Empty/error remain one shell.

3. **Tests** — Update portal/access or page tests that assert per-card structure only if they break; prefer a small DOM assertion that sibling rows share one bordered ancestor where tests already cover these pages.

### B. Waitlist `imageUrl` enrichment (api)

4. **Schema** — Add `imageUrl: z.string().nullable()` to waitlist entry Zod + OpenAPI (additive; safe for clients). Mirror on web `waitlistEntrySchema`.

5. **Join strategy** — After loading the page of waitlist rows, collect normalized emails → `prisma.user.findMany({ where: { email: { in: emails } }, select: { email, image } })` → map by normalized email → resolve presigned URLs only for keys present (reuse auth/food `createPresignedDownload` helper pattern; extract a tiny shared resolve helper only if duplication is painful). Per-key resolve failure → that row’s `imageUrl = null`; do **not** fail the whole list.  
   **Rejected:** N+1 per row; rejected Prisma include/relation (no FK between WaitlistEntry and User).

6. **Create/upsert** — Always return `imageUrl: null` on create/upsert (field required on DTO for client Zod). List is the path that performs user join + resolve.

7. **UI** — `AdminWaitlistPage`: if `entry.imageUrl`, render `<img>` in the circular avatar slot with `onError` → initials; else initials. `object-cover` + same `size-9 rounded-full`.

8. **Shared row components** — Where `BookingCard` / top-up row / activity row components own their outer `rounded-2xl border`, strip that outer chrome (or add a `variant="flush"` / unstyled wrapper) so nesting inside the shared container does not double-border. Prefer minimal props over a new design-system package.

## Risks / Trade-offs

- [Presign latency on list] → Batch users once per page; only sign rows with `image` set; keep page `limit` as today  
- [Email mismatch if waitlist not normalized historically] → Match with same `normalizeWaitlistEmail` / `normalizeEmail` lowercasing used at write time  
- [Broken/expired URL or resolve failure] → API null + UI `onError` initials fallback; list still 200  
- [List CSS regressions on dense mobile] → Keep existing inner padding; only remove inter-card gaps  
- [Client Zod breaks if API omits `imageUrl`] → Ship API first; always include the key (null allowed)

## Migration Plan

1. API: schema + list enrichment + OpenAPI + tests.  
2. Web: Zod + Players avatar + list container refactors (can land same PR).  
3. One monorepo PR; rollback = revert.

## Open Questions

- None blocking. Assumption: admin Dashboard recent activity is in scope alongside player Overview (same “recent activities” complaint).
