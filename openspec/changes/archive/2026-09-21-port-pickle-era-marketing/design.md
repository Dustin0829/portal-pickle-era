## Context

Standalone Pickle Era site (Vite + React + Tailwind v4 + Lenis + react-router) lives outside this monorepo. Product `app` is the solo-founder web package with providers, shadcn, TanStack Query, API feature modules, and a starter demo home. This change ports the marketing UX into `app` and keeps auth/booking/waitlist as browser stubs until a later `backend` change.

**Source (read-only reference):**  
`/Users/MacBook/Library/Mobile Documents/com~apple~CloudDocs/Documents/GitHub/Pickle Era/`  
(`src/`, `public/`, `index.html`, `package.json`)

**Rules / skills (cite, do not paste):**

- web: `app/.cursor/skills/SKILL.md`, `merge-readiness-check`, `ai-slop-check`
- web rules: `core/naming-conventions.mdc`, `core/ponytail-rules.mdc`, `pages/page-composition.mdc`, `pages/page-layout.mdc`, `copy/marketing-copy.mdc`, `forms/accessibility.mdc`, `ui/design-tokens.mdc`, `ui/icons-and-assets.mdc`, `ui/performance.mdc`, `ui/interaction-polish.mdc`, `security/route-protection.mdc`, `state/data-ownership.mdc`, `testing/vitest-testing.mdc`

## Goals / Non-Goals

**Goals:**

- Marketing `/` with full section set and brand assets
- Auth + booking + waitlist stubs with source-equivalent local behavior
- Layout that matches `app` conventions (page folders, providers, `lib/`)
- `pnpm verify` green in `app`
- Preserve 404 + SPA rewrite + AppProviders shell

**Non-Goals:**

- Any `backend` auth, booking, waitlist, or email APIs
- Rewriting marketing controls to shadcn primitives in this apply
- Implementing `starter-demo-cleanup` or `brand-semantic-tokens` in this apply (see Follow-ups)
- Changing `support`

## Decisions

### 1. Port into `app`, do not replace the package

Keep Vite/TS/pnpm/verify/shadcn/providers. Replace route-level UI and add deps/assets. Do not overwrite `package.json` wholesale from the standalone site.

**Alternative:** Wipe `app/src` and paste the standalone tree. Rejected — loses API scaffolding and conventions.

### 2. Target file layout

```
app/public/                 # brand images + favicon from source public/
app/src/pages/home/         # HomePage + colocated sections
app/src/pages/login|signup|forgot-password|reset-password/
app/src/pages/not-found/    # keep
app/src/components/marketing/  # Navbar, Footer, Logo, AuthLayout, Booking*, SmoothScroll
app/src/providers/AuthProvider.tsx
app/src/providers/BookingModalProvider.tsx
app/src/lib/auth/           # localStorage stub (from source lib/auth.ts)
app/src/lib/booking/
app/src/lib/waitlist/
```

Wire providers in `AppProviders` (keep existing QueryProvider → ThemeProvider → RateLimitGate; nest Auth + Booking inside RateLimitGate with children). Routes in `App.tsx`. Include source `ScrollToTop` behavior on pathname change. Marketing home is full-bleed (`page-layout.mdc`: not forced through `AppPageShell`).

**Lazy routes:** With 3+ page modules, use `React.lazy` + `Suspense` for non-home routes (`performance.mdc`).

**Public assets:** On copy, rename files with spaces (e.g. `PICKLE ERA BRANDING-*.png`) to kebab-case and update `src` references accordingly.

### 3. Brand theme coexists with shadcn

Merge source `@theme` brand colors/fonts and utility classes (`.display`, `.wordmark`, `.dots`, `.pay-action`) into `app/src/index.css` alongside existing shadcn tokens. Marketing UI keeps brand classes (`bg-yellow`, `bg-black`, etc.) — intentional exception to product `design-tokens.mdc` arbitrary-value rules for this marketing surface. Do not re-theme the whole app to Inter/zinc for this change.

Load Oswald / Barlow Condensed / Montserrat via `index.html` (same as source). Update title/description/favicon.

**Alternative:** Map every brand color to shadcn semantic tokens first. Rejected for this change — visual parity first; token unification can follow.

### 3b. Forgot-password stub behavior

Match source: `/forgot-password` only validates non-empty email, shows a continue UI, then navigates to `/reset-password?email=…`. It does **not** check whether the email exists and does **not** send mail. Existence checks happen only on reset.

### 4. Stubs stay out of `api/features/`

Keep localStorage helpers under `src/lib/auth|booking|waitlist`. Do not invent fake HTTP services. Future backend work adds `src/api/features/auth|booking|waitlist` and swaps providers/hooks.

Auth is not a security boundary (`route-protection.mdc`): stubs are UX only; no protected product data in this change.

### 5. Dependency: `lenis`

Add `lenis` to `app` for `SmoothScroll`. Stay on existing React Router **v6** (adapt source v7 imports if any). Keep lucide-react already in `app`.

### 6. RootLayout vs marketing chrome

Keep `RootLayout` (skip link, OfflineBanner, `#main`). Marketing pages supply Navbar/Footer. Accept `pb-10` on main unless it visibly breaks the footer — adjust only if needed during apply.

### 7. Tests

Replace starter `HomePage` tests with smoke coverage for marketing home (renders landmark sections / brand). Add light tests for auth stub helpers and/or waitlist upsert. Follow `vitest-testing.mdc` path mapping under `src/test/`.

## Risks / Trade-offs

- **[Risk] localStorage “auth” looks real** → Mitigation: treat as stub in copy/comments where useful; later backend change replaces it; never store real production secrets.
- **[Risk] Brand CSS fights shadcn / ThemeProvider** → Mitigation: marketing pages use brand surfaces (`bg-black`, etc.); keep ThemeProvider for shell; do not rely on starter theme toggle on `/` after demo removal.
- **[Risk] Large binary assets in git** → Mitigation: copy only files referenced by the UI from source `public/`.
- **[Risk] HomePage test / bones registry break verify** → Mitigation: update tests; leave or retarget boneyard bones that pointed at examples list.
- **[Trade-off] Arbitrary marketing sizes (`text-[11px]`, etc.)** → Accept for parity; do not mass-refactor to the type scale in this change.

## Migration Plan

1. Copy assets + CSS + deps into `app`.
2. Port modules into the layout above; wire routes/providers.
3. Remove starter home UI from `/`.
4. Run `pnpm verify` in `app`.
5. Rollback: revert the feature branch; standalone Pickle Era repo remains the backup.

Deploy: same Vite static deploy as today (`vercel.json` unchanged unless paths require it).

## Open Questions

- (none blocking)

## Follow-ups (specified, not this apply)

Tracked as delta specs in this change for a later proposal/apply:

1. **`starter-demo-cleanup`** — remove unused `api/features/examples`, demo-only page pieces, and orphaned boneyard bones (`specs/starter-demo-cleanup/spec.md`).
2. **`brand-semantic-tokens`** — map Pickle Era brand colors/fonts onto shadcn semantic tokens per `design-tokens.mdc` (`specs/brand-semantic-tokens/spec.md`).
