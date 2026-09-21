## Context

Booking receipts already upload via `POST /uploads/presign` and optional `receiptKey` on bookings. Storage today is Cloudflare R2-shaped (`backend/src/lib/storage/r2.ts`). Production hosts on Railway; Railway Buckets are private S3-compatible object stores. Explore chose **Option A**: short-lived presigned GET for admin preview (not a backend byte proxy).

In-scope packages: `api` (`./backend`), `web` (`./app`). Cite: `backend/.cursor/rules/integrations/file-uploads.mdc`, `backend/.cursor/rules/api/http-api.mdc`, `backend/.cursor/rules/core/module-boundaries.mdc`, `app/.cursor/rules/api/api-layer.mdc`.

## Goals / Non-Goals

**Goals:**

- Run uploads against Railway Bucket (or any S3-compatible endpoint) via env.
- Keep browser → presigned PUT; store object key on bookings.
- Let facility admin load receipt preview via short-lived presigned GET.
- Soft-fail cleanly when storage env is unset (local/dev without a bucket).

**Non-Goals:**

- Public CDN / permanent public object URLs.
- Backend streaming proxy (Option B).
- Virus scan jobs, multipart uploads, support-app changes.
- Changing booking conflict/occupancy rules unrelated to receipts.

## Decisions

1. **Generic S3 adapter over R2 helper**
   - Replace R2 account-id endpoint builder with explicit `S3_ENDPOINT` (or Railway-injected `ENDPOINT` mapped in env), access key, secret, bucket, region (`auto`).
   - Keep AWS SDK `S3Client` + `@aws-sdk/s3-request-presigner` (already depended).
   - **Alternatives:** keep R2 names + dual providers — rejected (YAGNI; Railway is the target).

2. **Env naming (resolved)**
   - Code and `.env.example` use `S3_ENDPOINT`, `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY`, `S3_BUCKET`, `S3_REGION` (default `auto`).
   - On Railway, map bucket Credentials (`ENDPOINT`, `ACCESS_KEY_ID`, `SECRET_ACCESS_KEY`, `BUCKET`, `REGION`) into those service variables via Variable References.
   - Remove reliance on `R2_*` for new deploys (delete or leave unused until cleaned up in the same PR).

3. **Option A — admin receipt URL on bookings**
   - Exact route: `GET /admin/bookings/:id/receipt-url` on the existing admin bookings router / `protectProductAdmin` gate.
   - Response shape: `{ url: string, expiresAt: string }` (ISO timestamp). TTL **5 minutes**.
   - Load booking by id → if missing booking → `404`; if no `receiptKey` → `404`; if storage unset → validation/config error; if signing fails → mapped API error.
   - **Alternatives:** generic `POST /uploads/download-url` with raw key — rejected (key enumeration risk).

4. **`receiptKey` semantics**
   - Always the object key (`uploads/<uuid>.ext`). SPA MUST persist `key` only (never `publicUrl`).
   - Admin UI: on detail open, call receipt-url and bind preview to `url`; on load failure/expiry, refetch once.

5. **Upload content-type allowlist (in scope)**
   - Change `presign` `contentType` to an allowlist enum: `image/jpeg`, `image/png`, `image/webp`, `application/pdf` per `file-uploads.mdc`.

6. **Deploy order**
   - Ship API first (adapter + receipt-url). Web can follow; soft-fail upload still allows bookings without binaries until bucket vars are set.

## Risks / Trade-offs

- **[Risk] Misconfigured Railway credentials break uploads in prod** → Mitigation: clear ValidationError; health/docs call out required vars; soft-fail on SPA upload keeps booking UX.
- **[Risk] Presigned GET leaked while valid** → Mitigation: short TTL; admin-only route; HTTPS only.
- **[Risk] Admin UI still expects `receiptDataUrl` data URLs** → Mitigation: map download URL into preview fields; handle missing receipt.
- **[Risk] OpenAPI / env drift** → Mitigation: regenerate `contracts/openapi.json`; update `.env.example` and Railway deploy docs.

## Migration Plan

1. Add Railway Bucket to project; inject credentials into API service variables.
2. Deploy API with S3 adapter + receipt-url endpoint.
3. Deploy web using object key + admin receipt-url fetch.
4. Rollback: unset S3 env → uploads soft-fail; bookings remain; old R2 keys (if any) won’t resolve — acceptable for pre-prod.

## Open Questions

None — env naming and MIME allowlist resolved above.
