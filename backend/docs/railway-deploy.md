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

| Variable                                                                                | Notes                                                                                                                 |
| --------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| `DATABASE_URL`                                                                          | Railway Postgres connection string                                                                                    |
| `NODE_ENV`                                                                              | `production`                                                                                                          |
| `PORT`                                                                                  | Railway injects; ensure app listens on it                                                                             |
| `API_CORS_ORIGIN`                                                                       | Public **web** service origin(s), comma-separated                                                                     |
| `ADMIN_BASIC_AUTH_USER` / `ADMIN_BASIC_AUTH_PASSWORD`                                   | Required in production to mount `/docs`, `/admin/waitlist`, `/admin/bookings`, `/admin/users`, `/admin/activity-logs` |
| `S3_ENDPOINT` / `S3_ACCESS_KEY_ID` / `S3_SECRET_ACCESS_KEY` / `S3_BUCKET` / `S3_REGION` | Railway Bucket Credentials mapped into the API service (optional; uploads soft-fail when unset)                       |

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

## Waitlist / bookings / auth

- Public capture: `POST /waitlist`, `POST /bookings`, `POST /auth/signup|login`
- Session cookie `pe_session` for `/auth/me` and `/me/bookings` (SPA needs `credentials: "include"`)
- Admin list (ops): `GET /admin/waitlist`, `GET /admin/bookings` — Swagger `/docs` or curl with Basic Auth when configured
- Receipt upload: `POST /uploads/presign` then PUT to the bucket; store object `key` as `receiptKey`
