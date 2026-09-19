## 1. api — waitlist imageUrl

- [x] 1.1 Add `imageUrl: z.string().nullable()` to waitlist entry schema + OpenAPI (`api/http-api.mdc`, `api/api-evolution.mdc`, `api/response-contracts.mdc`)
- [x] 1.2 Enrich `listWaitlistEntries`: batch-load users by normalized email, resolve presigned URLs for `User.image`; per-key resolve failure → null for that row; create/upsert always returns `imageUrl: null` (`module-boundaries`, `integrations/file-uploads.mdc`)
- [x] 1.3 Tests: matching user+image → non-null URL; no user / no image → null; case-insensitive email; resolve failure does not fail list (`testing/`)
- [x] 1.4 Mid-apply: `cd backend &&` kit `verify_fast`
- [x] 1.5 Full `cd backend && pnpm verify` + merge-readiness before ship

## 2. web — list containers + Players avatars

- [x] 2.1 Extend client `waitlistEntrySchema` with `imageUrl`; Players Name avatar uses photo + initials/`onError` fallback (`api/api-layer.mdc`, `ui/icons-and-assets.mdc`)
- [x] 2.2 Single-container list (no inter-row gap): Overview recent + Admin Dashboard activity (`pages/page-layout.mdc`)
- [x] 2.3 Same container pattern: My Bookings + Admin Bookings; strip outer card chrome on shared booking row components when nested (`pages/page-composition.mdc`)
- [x] 2.4 Same container pattern: Top-ups Inbox + Admin Food Orders; strip outer card chrome on shared row components when nested
- [x] 2.5 Vitest/Portal tests updated for container + avatar when covered (`testing/vitest-testing.mdc`)
- [x] 2.6 Mid-apply: `cd app &&` kit `verify_fast`
- [x] 2.7 Full `cd app && pnpm verify` + merge-readiness before ship

## 3. plans

- [x] 3.1 `openspec validate portal-list-container-avatars`

## 4. Ship

- [x] 4.1 `/opsx-verify` (api + web)
- [ ] 4.2 `/opsx-pr` (branch `feat/portal-list-container-avatars`)
