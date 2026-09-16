# Railway deploy (API + Postgres)

Same monorepo — do **not** split repos. Deploy the API from the `backend/` package root.

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

| Variable                                              | Notes                                                                              |
| ----------------------------------------------------- | ---------------------------------------------------------------------------------- |
| `DATABASE_URL`                                        | Railway Postgres connection string                                                 |
| `NODE_ENV`                                            | `production`                                                                       |
| `PORT`                                                | Railway injects; ensure app listens on it                                          |
| `API_CORS_ORIGIN`                                     | Public **web** service origin(s), comma-separated                                  |
| `ADMIN_BASIC_AUTH_USER` / `ADMIN_BASIC_AUTH_PASSWORD` | Required in production to mount `/docs`, `/admin/waitlist`, `/admin/bookings`, `/admin/users`, `/admin/activity-logs` |

Leave Basic Auth unset only for local/dev. In production without both vars, admin tools (including `GET /admin/waitlist` and `/admin/bookings`) are **not mounted**.

## Waitlist / bookings / auth

- Public capture: `POST /waitlist`, `POST /bookings`, `POST /auth/signup|login`
- Session cookie `pe_session` for `/auth/me` and `/me/bookings` (SPA needs `credentials: "include"`)
- Admin list (ops): `GET /admin/waitlist`, `GET /admin/bookings` — Swagger `/docs` or curl with Basic Auth when configured
