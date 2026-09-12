# Docker

`docker-compose.yml` runs the full local stack with **hot reload** (`tsx watch`). Source is bind-mounted from your machine; `node_modules` stays in a named Docker volume. Edits under `src/` restart the API and worker without rebuilding the image.

## Default stack

```bash
docker compose up -d
```

Or: `pnpm dev:docker`

Services:

- `backend-server` — API on port 3000
- `backend-worker` — BullMQ worker
- `backend-postgres` — PostgreSQL on port 5432
- `backend-timescale` — Timescale activity logs on port 5433
- `backend-redis` — Redis on port 6379

With `REDIS_URL` set on the server and worker, open Bull Board at `http://localhost:3000/admin/queues`.

When cloning this template for a new product, rename the compose project, service keys, container names, and `POSTGRES_DB` to match your app (e.g. `burn-radar-server`, `burn_radar`).

## Hot reload details

- First run builds the `dev` image target (`Dockerfile`).
- Only `backend-server` runs migrations and `prisma generate` on start. The worker sets `SKIP_PRISMA_SETUP=true` and waits for the server so both containers never race on the bind-mounted `src/generated/prisma` tree. The entrypoint removes `src/generated/prisma` before generate so stale host output cannot fail with `ENOTEMPTY`. Generated output is excluded from `tsx watch` so restarts are not triggered mid-generate.
- If file changes are not detected (common on Docker Desktop for Mac/Windows), `CHOKIDAR_USEPOLLING=true` is set on `backend-server` and `backend-worker`.

## Migrations on startup

The Docker image entrypoint (`scripts/docker-entrypoint.sh`) runs `prisma migrate deploy` before starting the API or worker. `DATABASE_URL` must be set (compose provides it for `backend-server` and `backend-worker`). The dev image includes `prisma.config.ts`, which Prisma 7 uses for the datasource URL.

## Production images

For deployment, build the `runtime` target from the `Dockerfile` (compiled `dist/`, no bind mounts):

```bash
docker build -t backend .
```
