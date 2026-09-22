# Railway deploy (API + Postgres)

Same monorepo — do **not** split repos. Deploy the API from the `backend/` package root.

**Before Railway:** run the [local stage](./local-stage.md) (Docker + smoke tests) on `main`.

## Services

| Railway resource | Root Directory | Role                   |
| ---------------- | -------------- | ---------------------- |
| Postgres plugin  | —              | Product `DATABASE_URL` |
| API service      | `backend`      | Express + Prisma       |

## Build / start (API)

Typical Nixpacks / custom:

1. `pnpm install` (from `backend`)
2. `pnpm prisma generate`
3. `pnpm prisma migrate deploy` (release / start command before listen)
4. `pnpm start` (or `node dist/...` per `package.json`)

## Env (API)

| Variable                                                                                | Notes                                                                                                                                                                   |
| --------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `DATABASE_URL`                                                                          | Railway Postgres connection string                                                                                                                                      |
| `NODE_ENV`                                                                              | `production`                                                                                                                                                            |
| `PORT`                                                                                  | Railway injects; ensure app listens on it                                                                                                                               |
| `API_CORS_ORIGIN`                                                                       | Public **web** origin(s), comma-separated. Canonical: `https://www.pickleera.co` (may include apex during cutover)                                                      |
| `BETTER_AUTH_SECRET`                                                                    | Required in production (session signing)                                                                                                                                |
| `BETTER_AUTH_URL`                                                                       | Public API origin, e.g. `https://api.pickleera.co`                                                                                                                      |
| `AUTH_COOKIE_DOMAIN`                                                                    | Shared cookie domain, e.g. `.pickleera.co`                                                                                                                              |
| `ADMIN_BASIC_AUTH_USER` / `ADMIN_BASIC_AUTH_PASSWORD`                                   | Required in production to mount `/docs`, `/admin/waitlist`, `/admin/bookings`, `/admin/wallet`, `/admin/users`, `/admin/activity-logs`                                  |
| `S3_ENDPOINT` / `S3_ACCESS_KEY_ID` / `S3_SECRET_ACCESS_KEY` / `S3_BUCKET` / `S3_REGION` | Railway Bucket Credentials mapped into the API service (optional; uploads soft-fail when unset)                                                                         |
| `RESEND_API_KEY`                                                                        | Optional; invite, password-reset, booking approved/rejected, welcome (signup), and password-changed emails are skipped when unset                                       |
| `EMAIL_FROM`                                                                            | From address for Resend (e.g. `Pickle Era <hello@pickleera.co>`); required with `RESEND_API_KEY` for those transactional emails                                         |
| `PUBLIC_APP_URL`                                                                        | Canonical SPA origin for invite/login/reset/welcome links **and** email logo — production: `https://www.pickleera.co`; falls back to first `API_CORS_ORIGIN` when unset |

Leave Basic Auth unset only for local/dev. In production without both vars, admin tools (including `GET /admin/waitlist` and `/admin/bookings`) are **not mounted**.

### Railway Bucket (receipts)

1. Project canvas → **+ New** → **Bucket**
2. Open the bucket **Credentials** tab
3. On the API service Variables, map:
   - `ENDPOINT` → `S3_ENDPOINT`
   - `ACCESS_KEY_ID` → `S3_ACCESS_KEY_ID`
   - `SECRET_ACCESS_KEY` → `S3_SECRET_ACCESS_KEY`
   - `BUCKET` → `S3_BUCKET`
   - `REGION` → `S3_REGION` (usually `auto`)
4. Admin inbox uses `GET /admin/bookings/:id/receipt-url` for short-lived preview URLs (bucket stays private)
5. **CORS (required for browser uploads):** allow `PUT`/`GET` from the web origin(s), e.g. `https://www.pickleera.co` (canonical) and optionally `https://pickleera.co` during apex→www cutover. Without this, bookings save with `receiptName` only and the admin modal cannot preview the image.

## Seed (admin / demo users)

Production image must include `src/generated/prisma` (see `Dockerfile` runtime stage). After Better Auth migrate, **re-seed** so admin/demo passwords use Better Auth hashing. Prefer seeding via Railway CLI from `backend/` so you use prod `DATABASE_URL` without SSHing:

```bash
cd backend
pnpm prisma generate   # if client missing locally
railway run --service pickle-era-backend --environment production -- pnpm db:seed
```

`pnpm db:seed` runs `prisma generate` then the seed. Demo admin: `admin@pickleera.local` / `password1`.

## Waitlist / bookings / auth

- Public capture: `POST /waitlist`, `POST /bookings`, `POST /auth/signup|login`
- Better Auth session cookie for `/auth/me` and `/me/bookings` (SPA needs `credentials: "include"`; set `AUTH_COOKIE_DOMAIN=.pickleera.co` in prod)
- Admin list (ops): `GET /admin/waitlist`, `GET /admin/bookings`, `GET /admin/wallet/top-ups` — Swagger `/docs` or curl with Basic Auth when configured
- Receipt upload: `POST /uploads/presign` then PUT to the bucket; store object `key` as `receiptKey` (bookings + wallet top-ups)
- Player wallet: `GET /me/wallet`, `POST /me/wallet/top-ups` (session cookie); admin approve/reject credits balance once
