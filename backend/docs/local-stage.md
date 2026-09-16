# Local stage (before Railway)

Use this as the **local stage** gate: API + Postgres running on your machine, smoke-tested, before any Railway deploy.

```text
main (merged) → local stage (Docker) → smoke tests pass → Railway deploy
```

Web wiring to these APIs can come later; this stage proves the **backend** is healthy with real Postgres + migrations.

## Prerequisites

- Docker Desktop running
- Node 22+, pnpm 10 (for host `pnpm` / smoke curls)
- Repo on latest `main`

```bash
git checkout main
git pull origin main
```

## 1. Start local stage (Docker)

From `backend/`:

```bash
cd backend
pnpm install
pnpm dev:docker
# same as: docker compose up -d
```

What starts:

| Service                | Port / notes                                                 |
| ---------------------- | ------------------------------------------------------------ |
| API (`backend-server`) | http://localhost:3000 — runs `prisma migrate deploy` on boot |
| Postgres               | `localhost:5432` — DB `backend`                              |
| Timescale (logs)       | `localhost:5433` — optional                                  |
| Redis + worker         | jobs / Bull Board — optional for auth/bookings smoke         |

Logs:

```bash
docker compose logs -f backend-server
```

Wait until migrations finish and the API is listening. Quick check:

```bash
curl -s http://localhost:3000/health
# or: curl -s http://localhost:3000/
```

Swagger (no Basic Auth in local by default): http://localhost:3000/docs

## 2. Smoke checklist (must pass)

```bash
# Auth signup + cookie
curl -sS -c /tmp/pe-cookies.txt -X POST http://localhost:3000/auth/signup \
  -H 'Content-Type: application/json' \
  -d '{"name":"Local Tester","email":"local-stage@example.com","password":"password1"}'

curl -sS -b /tmp/pe-cookies.txt http://localhost:3000/auth/me

# Booking (date on/after opening day)
curl -sS -b /tmp/pe-cookies.txt -X POST http://localhost:3000/bookings \
  -H 'Content-Type: application/json' \
  -d '{"plan":"court","date":"2026-10-05","courtId":"in-1","slotIds":["08:00"],"name":"Local Tester","email":"local-stage@example.com","referenceId":"LOCAL"}'

curl -sS 'http://localhost:3000/bookings/occupancy?date=2026-10-05'
curl -sS -b /tmp/pe-cookies.txt http://localhost:3000/me/bookings
```

Optional admin (local, Basic Auth unset → open):

- http://localhost:3000/docs → try `GET /admin/bookings`
- Or: `curl -sS http://localhost:3000/admin/bookings`

**Pass criteria:** signup/me OK, booking create returns `201`/`pending`, occupancy lists the slot, `/me/bookings` includes the row.

## 3. Optional: web on host (UI still stubs)

```bash
cd app
pnpm install
# .env: VITE_API_URL=http://localhost:3000
pnpm dev
```

Marketing/portal UIs may still use localStorage until a wiring change. Local stage for **API** does not require the SPA.

## 4. After local stage passes → deploy stage

1. Railway: Postgres plugin + API service (`backend` root) + web (`app` root) — see [railway-deploy.md](./railway-deploy.md)
2. Set `DATABASE_URL`, `API_CORS_ORIGIN`, production `ADMIN_BASIC_AUTH_*`
3. Deploy API first (migrate on start), then web with `VITE_API_URL`

## Reset local DB

```bash
cd backend
docker compose down -v   # wipes volumes — fresh migrate on next up
pnpm dev:docker
```

## Hybrid (Postgres Docker, API on host)

```bash
cd backend
docker compose up -d backend-postgres
cp -n .env.example .env
pnpm install && pnpm prisma generate && pnpm prisma migrate deploy
pnpm dev
```

Same smoke curls against `http://localhost:3000`.
