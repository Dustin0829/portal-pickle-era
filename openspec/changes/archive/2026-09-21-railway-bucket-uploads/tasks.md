## 1. api — S3 adapter and env

- [x] 1.1 Replace R2-specific helper with S3-compatible storage module (`endpoint`, keys, bucket, region); cite `backend/.cursor/rules/integrations/file-uploads.mdc`, `backend/.cursor/rules/core/module-boundaries.mdc`
- [x] 1.2 Wire `env.ts` + `.env.example` for S3/Railway Bucket variables; document mapping from Railway Credentials
- [x] 1.3 Keep `POST /uploads/presign` using server-generated keys; add content-type allowlist (jpeg/png/webp/pdf); cite `backend/.cursor/rules/api/http-api.mdc`
- [x] 1.4 Add `createPresignedDownload` (GetObject) with ~5m TTL
- [x] 1.5 Mid-apply: `pnpm format:check && pnpm lint && pnpm typecheck` in `backend`

## 2. api — Admin receipt URL

- [x] 2.1 Add admin booking receipt-url route (e.g. `GET /admin/bookings/:id/receipt-url`) behind product-admin gate; 404/validation when no `receiptKey`
- [x] 2.2 Unit/schema tests for allowlist, missing storage config, receipt-url auth/missing key cases
- [x] 2.3 Regenerate/check OpenAPI (`pnpm openapi:generate` / `openapi:check`)
- [x] 2.4 Update Railway deploy / local-stage docs for bucket variable inject
- [x] 2.5 Mid-apply: `pnpm format:check && pnpm lint && pnpm typecheck` in `backend`

## 3. web — Upload key + admin preview

- [x] 3.1 Persist upload `key` as `receiptKey` (do not prefer publicUrl); keep soft-fail when presign fails; cite `app/.cursor/rules/api/api-layer.mdc`
- [x] 3.2 Add bookings feature call for `GET /admin/bookings/:id/receipt-url`; map `{ url }` into admin bookings detail preview
- [x] 3.3 On preview load failure or near-expiry, refetch receipt-url once; show empty/missing state when no `receiptKey`
- [x] 3.4 Update tests that mock uploads/walk-in/admin detail as needed
- [x] 3.5 Mid-apply: `pnpm format:check && pnpm lint && pnpm exec tsc -b --noEmit` in `app`

## 4. plans — Ship

- [x] 4.1 `openspec validate railway-bucket-uploads` (or `openspec validate --specs` as applicable)
- [x] 4.2 `/opsx-verify` for in-scope `api` + `web`
- [x] 4.3 `/opsx-pr` on branch `feat/railway-bucket-uploads`
