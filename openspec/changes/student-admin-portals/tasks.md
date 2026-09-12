## 1. plans

- [x] 1.1 Use branch prefix `feat/student-admin-portals` for the monorepo PR
- [x] 1.2 Keep OpenSpec artifacts under `openspec/changes/student-admin-portals/` in sync if scope shifts during apply

## 2. web (`./app`)

Rules/skills: `app/.cursor/skills/SKILL.md`, `merge-readiness-check`, `ai-slop-check`, `shadcn`; `core/naming-conventions.mdc`, `core/ponytail-rules.mdc`, `pages/page-composition.mdc`, `pages/page-layout.mdc`, `security/route-protection.mdc`, `security/frontend-security.mdc`, `state/data-ownership.mdc`, `state/error-handling.mdc`, `copy/ui-microcopy.mdc`, `forms/accessibility.mdc`, `ui/design-tokens.mdc`, `ui/performance.mdc`, `testing/vitest-testing.mdc`

- [x] 2.1 Extend auth stub with `role: 'student' | 'admin'` (default student); seed/document one admin fixture for local demo (`route-protection.mdc` UX-only)
- [x] 2.2 Add student layout + pages under `src/pages/app/` (overview, bookings, court calendar read-only, profile) using `AppPageShell` / portal nav (`page-layout.mdc`, `page-composition.mdc`); share court-grid UI with admin calendar if practical
- [x] 2.3 Add facility admin layout + pages under `src/pages/admin/` (bookings inbox, calendar, waitlist, settings) with stub data adapters over booking/waitlist stores
- [x] 2.4 Extend booking stub status to support admin approve/reject; persist updates in local store; student bookings list filters by session email
- [x] 2.5 Add stub settings store for prices/slots/GCash display fields used by admin settings page
- [x] 2.6 Wire `App.tsx` routes: `/app/*` behind session `ProtectedRoute` (loading/unauth/auth branches); `/admin/*` behind session + admin role gate; lazy-load portal pages (`performance.mdc`); keep marketing + public auth + 404; add entry links from marketing navbar when signed in (student portal; admin link only for admin role)
- [x] 2.7 Add Vitest coverage for access gates (signed-out, non-admin, loading shell) and smoke renders of student overview + admin bookings inbox including empty states (`vitest-testing.mdc`, `error-handling.mdc`)
- [x] 2.8 `pnpm format` on touched files, then `pnpm format:check && pnpm lint && pnpm exec tsc -b --noEmit` (`verify_fast`)

## 3. Ship

- [x] 3.1 `/opsx-verify` — full `pnpm verify` + `@merge-readiness-check` in `app`
- [ ] 3.2 `/opsx-pr` — one monorepo PR from `feat/student-admin-portals`
