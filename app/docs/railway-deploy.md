# Railway deploy (web SPA)

Same monorepo — Root Directory **`app`**. Pair with the API + Postgres services documented in `backend/docs/railway-deploy.md`.

## Service

| Railway resource | Root Directory | Role                        |
| ---------------- | -------------- | --------------------------- |
| Web              | `app`          | Vite marketing + portal SPA |

## Build

1. `pnpm install`
2. `pnpm build` (sets `VITE_API_URL` at **build** time)
3. Serve `dist/` with an SPA fallback so `/login`, `/app`, `/admin/*` return `index.html`

Example start with `serve`:

```bash
npx serve -s dist -l $PORT
```

Or configure Railway static hosting / Caddy / nginx with `try_files … /index.html`.

## Env (build-time)

| Variable       | Notes                                                                           |
| -------------- | ------------------------------------------------------------------------------- |
| `VITE_API_URL` | Public Railway API URL (no trailing slash), e.g. `https://api-….up.railway.app` |

On the **API** service, set `API_CORS_ORIGIN` to this web service’s public origin.

## Waitlist / admin notes

- Join the club + newsletter call `POST /waitlist` on the API.
- Admin Waitlist page calls `GET /admin/waitlist` **without** Basic Auth secrets in the Vite bundle. Local/dev (Basic Auth unset) works; production with Basic Auth shows an ops message — use Swagger `/docs` or the DB for lead review until session auth exists.

No Vercel required.
