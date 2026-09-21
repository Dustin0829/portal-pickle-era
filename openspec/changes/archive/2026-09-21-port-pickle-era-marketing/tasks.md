## 1. plans

- [x] 1.1 Use branch prefix `feat/port-pickle-era-marketing` for the monorepo PR
- [x] 1.2 Keep this change’s OpenSpec artifacts under `openspec/changes/port-pickle-era-marketing/` in sync if scope shifts during apply

## 2. web (`./app`)

Rules/skills: `app/.cursor/skills/SKILL.md`, `merge-readiness-check`, `ai-slop-check`; `core/naming-conventions.mdc`, `core/ponytail-rules.mdc`, `pages/page-composition.mdc`, `pages/page-layout.mdc`, `copy/marketing-copy.mdc`, `forms/accessibility.mdc`, `ui/design-tokens.mdc`, `ui/icons-and-assets.mdc`, `ui/performance.mdc`, `ui/interaction-polish.mdc`, `security/route-protection.mdc`, `state/data-ownership.mdc`, `testing/vitest-testing.mdc`

Source tree (read-only): `/Users/MacBook/Library/Mobile Documents/com~apple~CloudDocs/Documents/GitHub/Pickle Era/`

- [x] 2.1 Add `lenis` dependency with pnpm; verify install succeeds
- [x] 2.2 Copy referenced brand assets + favicon from source `public/` into `app/public/` (rename spaced filenames to kebab-case and update references); update `app/index.html` title, description, favicon, and Google Fonts links (Oswald, Barlow Condensed, Montserrat)
- [x] 2.3 Merge source brand `@theme` tokens and utility classes (`.display`, `.wordmark`, `.dots`, `.pay-action`, Lenis CSS import) into `app/src/index.css` alongside existing shadcn tokens (`design-tokens.mdc` coexistence)
- [x] 2.4 Port stub libs: `src/lib/auth/`, `src/lib/booking/`, `src/lib/waitlist/` from source (camelCase modules per `naming-conventions.mdc`); no `api/features` HTTP for stubs
- [x] 2.5 Add `AuthProvider` and `BookingModalProvider` under `src/providers/`; register them in `AppProviders` inside existing RateLimitGate; do not change `src/api/client.ts`
- [x] 2.6 Port shared marketing components to `src/components/marketing/` (Navbar, Footer, Logo, AuthLayout pieces, BookingButton/Modal, SmoothScroll, BookCta as needed) with `@/` imports
- [x] 2.7 Port marketing home: replace `pages/home/HomePage.tsx` with full-bleed landing; colocate sections (Hero, Pricing, Vibe, Space, Pillars, Location, FAQ, Waitlist, etc.) per `page-composition.mdc` / `page-layout.mdc`; remove starter ExamplesSection/counter/DemoErrorTrigger from `/`
- [x] 2.8 Port auth pages under `pages/login|signup|forgot-password|reset-password/` and wire routes in `App.tsx` (`/login`, `/signup`, `/forgot-password`, `/reset-password`); add ScrollToTop on pathname change; keep catch-all `*` → NotFoundPage; lazy-load non-home pages when 3+ modules (`performance.mdc`)
- [x] 2.9 Smoke-check booking modal open/submit (and incomplete reject) and waitlist submit/empty reject against local stubs; confirm no product API calls from those paths
- [x] 2.10 Update Vitest: rewrite `src/test/pages/home/HomePage.test.tsx` for marketing home; add focused tests for auth stub (signup validation / duplicate email) and waitlist upsert (`vitest-testing.mdc`); fix or retire broken examples-list bones if they fail verify
- [x] 2.11 `pnpm format` on touched files, then `pnpm format:check && pnpm lint && pnpm exec tsc -b --noEmit` (`verify_fast`)

## 3. Ship

- [x] 3.1 `/opsx-verify` — full `pnpm verify` + `@merge-readiness-check` in `app`
- [x] 3.2 `/opsx-pr` — one monorepo PR from `feat/port-pickle-era-marketing`
