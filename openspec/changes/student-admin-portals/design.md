## Context

Marketing + localStorage auth/booking/waitlist stubs already ship in `app`. There are no `/app` or facility `/admin` product routes; `ProtectedRoute` is unused. `support/` remains the activity-logs operator app (Basic Auth) — out of scope.

**Rules / skills (cite, do not paste):**

- web: `app/.cursor/skills/SKILL.md`, `merge-readiness-check`, `ai-slop-check`, `shadcn`
- web rules: `core/naming-conventions.mdc`, `core/ponytail-rules.mdc`, `pages/page-composition.mdc`, `pages/page-layout.mdc`, `security/route-protection.mdc`, `security/frontend-security.mdc`, `state/data-ownership.mdc`, `state/error-handling.mdc`, `copy/ui-microcopy.mdc`, `forms/accessibility.mdc`, `ui/design-tokens.mdc`, `ui/performance.mdc`, `testing/vitest-testing.mdc`

## Goals / Non-Goals

**Goals:**

- Student portal MVP: overview, my bookings, court calendar (read-only), profile
- Facility admin MVP: bookings inbox (+ approve/reject), day calendar, waitlist, light settings
- Stub role gate for `/admin/*`; session gate for `/app/*`
- Reuse booking/waitlist localStorage shapes; fixtures when empty
- `pnpm verify` green in `app`

**Non-Goals:**

- Backend APIs / Better Auth / real RBAC
- Changing `support/` or activity-logs
- Receipt binary upload/preview
- Marketing CMS / brand redesign
- Full member CRM or equipment inventory

## Decisions

### 1. UI-only portals; APIs later

Portals read/write client stub stores. Document swap path: later `src/api/features/{auth,booking,waitlist}` + Query hooks replace stub adapters.

**Alternative:** Build APIs in the same change. Rejected — user chose portal UI first.

### 2. Route layout

```
/app                  → student overview (ProtectedRoute)
/app/bookings         → my bookings
/app/calendar         → court day calendar (read-only occupancy)
/app/profile          → profile
/admin                → admin home / bookings inbox
/admin/bookings       → bookings inbox (or alias)
/admin/calendar       → court day calendar (ops view)
/admin/waitlist       → waitlist
/admin/settings       → stub catalog/payment settings
```

Pages under `src/pages/app/...` and `src/pages/admin/...` per `naming-conventions.mdc` / `page-composition.mdc`. Use `AppPageShell` for portal chrome (`page-layout.mdc`); marketing stays full-bleed.

Student and admin calendars MAY share a presentational court-grid component, but student calendar MUST remain read-only (no status mutations). Admin calendar stays the ops view tied to approve/reject workflows elsewhere.

### 3. Stub admin role

Extend auth stub user with optional `role: 'student' | 'admin'` (default `student`). Seed or document one admin user in localStorage for demo (e.g. signup path or fixed fixture email). Client gate only — not security (`frontend-security.mdc`).

Auth provider MUST expose a resolved status (`loading` | `authenticated` | `unauthenticated`) so portal gates do not flash protected content (`route-protection.mdc`).

**Alternative:** Separate admin password gate. Rejected — keep one AuthProvider.

### 3b. Entry from marketing

When signed in, marketing Navbar links to `/app`. When role is admin, also link to `/admin`. Signed-out users keep Login.

### 4. Booking status machine (client)

Extend local booking status beyond `pending` to include at least `approved` and `rejected` (or `confirmed` / `rejected`) for admin actions. Student “my bookings” filters by session email match on booking `email` field (guest bookings stay visible if email matches).

### 5. Settings stub store

Client store for prices/slots/GCash display used by admin settings. Marketing Pricing hard-code need not sync live in this change; note follow-up to single-source catalog when APIs land.

### 6. Distinct from `support/`

No dependency on support package. Product `/admin` ≠ activity-logs.

### 7. Tests

Route-gate tests (signed-out → login; non-admin → blocked); smoke render tests for student overview and admin bookings inbox with providers.

## Risks / Trade-offs

- **[Risk] Stub admin looks like real security** → Mitigation: comment/copy that gates are UX-only; replace with API roles later.
- **[Risk] Booking email mismatch leaves student list empty** → Mitigation: empty state + fixtures; optional “link” note in design copy.
- **[Risk] Settings diverge from marketing Pricing.tsx** → Mitigation: accepted for MVP; follow-up single source.
- **[Trade-off] Receipt filename only** → Admin shows filename; no preview until uploads API.

## Migration Plan

1. Add portal routes, layouts, stub role, pages.
2. Wire ProtectedRoute + admin gate in `App.tsx`.
3. Connect bookings/waitlist stub reads/writes for admin actions.
4. Verify; ship. Rollback = revert branch. Marketing unaffected.

## Open Questions

- (none blocking) Demo admin bootstrap: fixed fixture user vs toggle in profile — default to fixture admin email documented in README/tasks.
