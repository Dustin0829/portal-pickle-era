Branch: `feat/portal-page-title-align`

## 1. web — admin portal titles

- [x] 1.1 Set Admin Bookings / Top-ups / Food orders / Waitlist `h1` to `display text-[28px] text-zinc-900 sm:text-[32px]` (`pages/page-layout.mdc`, `ui/design-tokens.mdc`)
- [x] 1.2 Set Admin Calendar + Settings `h1` to the same dashboard size tokens
- [x] 1.3 Replace `text-amber-600` accents inside those admin page `h1`s with `text-yellow` (Bookings inbox, Top-ups inbox, Food orders) (`ui/design-tokens.mdc`, `core/ponytail-rules.mdc`)
- [x] 1.4 Confirm Admin Dashboard `h1` already matches; leave non-`h1` amber, modal headers, and sheet `display` amounts alone

## 2. web — player portal titles

- [x] 2.1 Set player Bookings / Wallet / Profile / Calendar / Food / `PlayerComingSoon` `h1`s to dashboard size tokens (drop larger `sm:text-[56px]` on Coming soon)
- [x] 2.2 Confirm Overview already matches; keep existing `text-yellow` accents; do not add accents to plain zinc titles
- [x] 2.3 Grep `pages/admin` + `pages/app` for remaining oversized page `h1`s or `h1` `text-amber-600`; confirm sheet/modal titles untouched

## 3. web — verify

- [x] 3.1 Add or extend a focused Vitest only if an existing page test is cheap to assert title classes (`testing/vitest-testing.mdc`); otherwise skip new tests
- [x] 3.2 Run `pnpm format:check && pnpm lint && pnpm exec tsc -b --noEmit` in `app`
- [x] 3.3 Run `pnpm verify` in `app`
- [x] 3.4 Run merge-readiness check for web (`app/.cursor/skills/merge-readiness-check/SKILL.md`)

## 4. plans

- [x] 4.1 `openspec validate portal-page-title-align --strict`

## 5. Ship

- [ ] 5.1 `/opsx-verify` (in-scope packages)
- [ ] 5.2 `/opsx-pr` → branch `feat/portal-page-title-align`
