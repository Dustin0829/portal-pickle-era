## Why

The Pickle Era marketing site already exists as a standalone Vite app (iCloud `Pickle Era` repo). The monorepo `app` package is still the starter demo home. We need the real brand site — landing, auth UI, booking, and waitlist — living in `app` under this repo’s conventions so product work can continue here and later swap stubs for `backend` APIs.

## What Changes

- Port the Pickle Era marketing UI into `app/` following web package layout (pages, providers, `lib/`, shared marketing components).
- Replace the starter demo `/` home with the full-bleed marketing landing (Hero, Pricing, Book CTA, Vibe, Space, Pillars, Location, FAQ, Waitlist, Navbar/Footer).
- Port auth pages (`/login`, `/signup`, `/forgot-password`, `/reset-password`) backed by **localStorage stubs** (same behavior as the source site), not `backend`.
- Port booking modal + waitlist flows as **local stubs** (localStorage / in-browser), not `backend`.
- Copy brand assets into `app/public/`, brand fonts/meta into `app/index.html`, and brand theme CSS into `app/src/index.css` (coexist with existing shadcn tokens).
- Add `lenis` for smooth scroll; keep React Router v6, AppProviders, API scaffolding, NotFoundPage, and SPA hosting as-is.
- Update home (and related) Vitest coverage so `pnpm verify` passes.

**BREAKING** (product `app` UX only): the starter demo home (ExamplesSection / counter / theme playground on `/`) is removed from the default route. Unused `api/features/examples` scaffolding may remain until the follow-up cleanup capability lands.

## Capabilities

### New Capabilities

- `marketing-site`: Public Pickle Era landing, brand chrome, assets, and marketing section composition on `/`
- `auth-stub`: Client-only signup/login/logout/password-reset UI and session via localStorage
- `booking-stub`: Client-only booking modal and waitlist capture via local storage
- `starter-demo-cleanup`: Remove unused starter examples API modules, demo page pieces, and orphaned boneyard bones (**follow-up — not this apply**)
- `brand-semantic-tokens`: Map Pickle Era brand colors/fonts onto shadcn semantic tokens / `design-tokens.mdc` (**follow-up — not this apply**)

### Modified Capabilities

- (none — main `openspec/specs/` is empty; existing change-local `spa-hosting` 404 behavior is preserved without a requirement delta)

## Impact

**kit.repos in scope:** `web` (`./app`), `plans` (this OpenSpec change).

**Non-goals / excluded (this apply):**
- `api` (`./backend`) — no auth, booking, or waitlist API work in this change
- `support` — no operator UI changes
- Real sessions, email, payments, or server-backed booking inventory
- Implementing `starter-demo-cleanup` or `brand-semantic-tokens` (specified for a follow-up change; keep brand markup + examples scaffolding during the port)

**Must not break:** catch-all 404 + `vercel.json` SPA rewrite; `pnpm verify` in `app`; OfflineBanner / ErrorBoundary / RateLimitGate / ThemeProvider / AppProviders shell; `src/api/client.ts` behavior (no interceptor changes required for this port).

- `app`: pages, providers, marketing components, brand CSS/assets, routes, `lenis`, tests
- Root OpenSpec: this change’s proposal/design/specs/tasks
