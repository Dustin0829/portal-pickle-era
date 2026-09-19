## 1. api — yellow email, user image, change password

- [x] 1.1 Set Resend `BRAND_YELLOW` to `#F5C518`; update `client.test.ts` expectations (`integrations/external-dependencies.mdc`)
- [x] 1.2 User DTO: add `imageUrl` (resolved via `createPresignedDownload` from `User.image` key); include `image` in public select; `patchMe` accepts optional image key; OpenAPI + mapper tests (`api/http-api.mdc`, `api/response-contracts.mdc`, `api/api-evolution.mdc`, `integrations/file-uploads.mdc`)
- [x] 1.3 Authenticated change-password: Better Auth `changePassword` (current + new) via client or thin `/auth` wrapper; stay logged in on success; OpenAPI + tests for success/wrong-current (`platform/platform-patterns.mdc`, `testing/`)
- [x] 1.4 Profile photos reuse existing image MIME allowlist on uploads; no PDF for avatar (client gate; server rejects non-image keys on patch if needed) (`integrations/file-uploads.mdc`)
- [x] 1.5 Mid-apply: `cd backend &&` kit `verify_fast`
- [x] 1.6 Full `cd backend && pnpm verify` + merge-readiness before ship

## 2. web — chrome, settings tabs, profile, court grid

- [x] 2.1 Update `--color-yellow` / `--primary` / `--ring` to `#F5C518` in `index.css` (`ui/` tokens)
- [x] 2.2 Remove `PortalBackdrop` from all player + admin portal pages; delete dead component if unused; tighten flat/compact spacing on portal shells (`pages/page-layout.mdc`, `core/ponytail-rules.mdc`)
- [x] 2.3 Admin Settings: tabs Prices · Open play sessions · Payment Method · Food menu; nest pre-signup under Prices (`pages/page-composition.mdc`, `forms/`)
- [x] 2.4 Profile: remove seed banner + page Log out; keep chrome logout (`copy/ui-microcopy.mdc`)
- [x] 2.5 Profile: name edit via patchMe; avatar upload (presign jpeg/png/webp → patch image key) + `imageUrl` display; refresh `me` after save; change-password form (stay logged in) (`api/api-layer.mdc`, `state/async-ui.mdc`, `forms/`)
- [x] 2.6 `UnifiedBookingSchedule`: Indoor|Outdoor toggle (default Indoor, filter `COURTS`); retain selection across toggle; calmer Courts·Times cells; Open Play strip unchanged (`pages/page-composition.mdc`)
- [x] 2.7 Vitest: settings tab switch; profile seed/logout absent; Indoor/Outdoor column filter + selection retain; reserved cell still works (`testing/vitest-testing.mdc`)
- [x] 2.8 Mid-apply: `cd app &&` kit `verify_fast`
- [x] 2.9 Full `cd app && pnpm verify` + merge-readiness before ship

## 3. plans

- [x] 3.1 `openspec validate portal-flat-compact-ui`

## 4. Ship

- [x] 4.1 `/opsx-verify` (api + web)
- [ ] 4.2 `/opsx-pr` (branch `feat/portal-flat-compact-ui`)
