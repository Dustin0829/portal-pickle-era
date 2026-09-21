## Context

Food ordering already ships: player menu + place order (`POST /me/food/orders`), admin list + status patch (`pending → preparing → ready`). Gaps: no `GET /me/food/orders`, Food page cart rail is `lg:sticky lg:self-start` (content-height only), Overview/Admin dashboard recent feeds are bookings-centric, and uneven photos still feel misaligned even with `aspect-[4/3]` if wrappers stretch.

**In scope:** `api` + `web`. Cite `backend/.cursor/skills/SKILL.md` → `module-boundaries`, `api/`, `testing/`; `app/.cursor/skills/SKILL.md` → `api/api-layer.mdc`, `pages/page-layout.mdc`, `pages/page-composition.mdc`, `ui/`, `state/async-ui.mdc`, `testing/vitest-testing.mdc`.

## Goals / Non-Goals

**Goals:**
- Player can see Preparing / Ready for their orders on the Food tab
- Food orders show in player + admin recent activity
- Full-height Your order rail on desktop; equal menu image boxes
- Minimal API: list-my-orders only (reuse existing DTOs)

**Non-Goals:**
- Websockets / push notifications
- New statuses (`completed`, `cancelled`) or pickup confirmation
- Redesigning admin Food inbox beyond activity deep-links
- Changing Food page outer `AppPageShell` padding
- Support app

## Decisions

### A. `GET /me/food/orders`

1. **Shape** — Return an array (or small paginated list, default limit ~20) of existing `FoodOrderDto` for `userId = session`, `orderBy createdAt desc`.  
   **Rejected:** Piggyback on admin list with a client filter (leaks other users if misconfigured).

2. **Auth** — Same student session gate as menu/create.

### B. Food tab UI

3. **Rail layout** — On `lg`: grid with `items-stretch`; aside `flex flex-col min-h-full` (or `lg:min-h-[…]` tied to content); middle section `flex-1 overflow-y-auto`; footer (pay + place) `shrink-0`. Drop `self-start` that collapses height.

4. **Active orders** — Section inside the same rail below cart (or above pay controls): list from `useMyFoodOrders`, show `pending|preparing|ready`, newest first, **cap 20**. Labels: `pending` → “Queued”, `preparing` → “Preparing”, `ready` → “Ready” (same strings on Overview/Admin). Invalidate/refetch on successful place; `refetchOnWindowFocus` optional.

5. **Images** — Keep `aspect-[4/3]` media wrapper with `shrink-0`, `object-cover object-center`, card `h-full` + `mt-auto` on Add. No server-side image re-encode in this change.

### C. Activity feeds

6. **Player Overview** — Fetch my bookings + my food orders; merge by `createdAt` into recent rows (cap ~5). Empty state only when both empty. If one query fails, keep the other feed + inline alert. Food row may link to `/app/food`.

7. **Admin Dashboard** — Fetch admin food orders (existing `GET /admin/food/orders`, page 1, small limit) alongside bookings/waitlist; merge into `ActivityItem` with tone + href `/admin/food`. One row per order showing **current** status (no activity event table).

## Risks / Trade-offs

- [Ready orders accumulate forever] → Active Food rail caps at 20 newest active-status orders  
- [Dashboard extra query] → Accept one more admin food list call; keep limit small  
- [Full-height feels tall on short viewports] → Inner scroll; do not remove vertical shell padding  
- [Partial Overview failure] → Spec requires non-blanking partial success  

## Migration Plan

1. Ship API `GET /me/food/orders` + OpenAPI.  
2. Wire Food rail + images + Overview/Admin activity.  
3. One monorepo PR; rollback = revert.

## Open Questions

- None blocking.
