## Why

Production deploys on Railway, and receipt binaries should live in a Railway Bucket (S3-compatible, private) instead of Cloudflare R2. Uploads already use presigned PUT; we need a generic S3 adapter plus short-lived presigned GET for admin receipt preview (Option A).

## What Changes

- Replace R2-specific storage helper with an S3-compatible client configured via Railway Bucket env (`ENDPOINT`, keys, `BUCKET`, `REGION`).
- Keep `POST /uploads/presign` for browser PUT uploads; stop relying on public object URLs.
- Persist booking `receiptKey` as the object key only (never a public URL).
- Add an admin-authenticated way to obtain a short-lived **presigned GET** URL for a booking receipt (Option A).
- Wire facility admin booking detail to load receipt preview via that URL.
- Document Railway Bucket variable wiring; local soft-fail when storage env is unset.
- Update OpenAPI for any new/changed upload or receipt-download routes.

## Capabilities

### New Capabilities

- `object-storage`: S3-compatible upload/download signing against Railway Bucket (or any S3 endpoint), env contract, and failure behavior when unset.

### Modified Capabilities

- `booking-api`: Admin can request a short-lived receipt download URL for a booking that has `receiptKey`; clients must not expect a permanent public receipt URL.

## Impact

- **kit.repos in scope:** `api` (`./backend`), `web` (`./app`), `plans` (this OpenSpec change).
- **Out of scope / non-goals:** `support` package; Cloudflare R2 as primary; public CDN URLs; backend byte-proxy streaming (Option B); profile/avatar media beyond booking receipts; Prisma schema changes (metadata fields already exist); virus scanning jobs.
- **Must not break:** `POST /bookings` (with or without receipt), `GET /me/bookings`, admin list/patch/walk-in, occupancy, waitlist; bookings without receipt files remain valid when storage is unset.
- **Touches:** `backend/src/lib/storage/*`, `uploads` module, bookings admin routes/OpenAPI, `env` + `.env.example` + Railway docs, admin bookings UI receipt preview, SPA upload soft-fail path.
