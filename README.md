# solo-founder-starter

Template for a new product: **web app**, **support app**, **API**, **OpenSpec**, and Cursor `/opsx-*` commands.

Use it as a GitHub template. Then rename `app` / `support` / `backend` to your product.

The **workspace hub** (boards, cards, MCP) is a separate template: **[solo-founder-workspace](https://github.com/franzegos/solo-founder-workspace)**. It is not in this repo. Point Cursor MCP at your hub when you want `/opsx-explore` to load a board card.

How we plan and ship: [.cursor/WORKFLOW.md](.cursor/WORKFLOW.md). Verify is **local** (`pnpm verify` in each package, or `/opsx-verify`) — there is no GitHub Actions verify workflow.

## Run it

**1. API** (Postgres, Timescale, Redis, server, worker):

```bash
cp backend/.env.example backend/.env
docker compose up -d
```

**2. Web:**

```bash
cd app && cp .env.example .env && pnpm install && pnpm dev
```

**3. Support** (activity logs):

```bash
cd support && cp .env.example .env && pnpm install && pnpm dev
```

| Where | URL |
|-------|-----|
| Product app | http://localhost:5173 |
| Support app | http://localhost:5174 |
| Product API | http://localhost:3000 |
| Activity logs API | http://localhost:3000/admin/activity-logs |
| Swagger | http://localhost:3000/docs |

Postgres `5432`, Timescale logs `5433`, Redis `6379`. The product app is a demo shell (no login). Activity capture is fail-open if `LOGS_DATABASE_URL` is unset. Timescale compresses chunks older than 7 days and drops data older than 30 days.

Stop: `docker compose down`. `backend/docker-compose.yml` still works if you run from that folder (`cp .env.example .env && docker compose up -d`).

## What’s in the repo

```text
.cursor/     slash commands (/opsx-*), commit-changes + create-pull-request skills
app/         product web
support/     operator web (activity logs)
backend/     product API
openspec/    specs (this is the only OpenSpec root)
```

Git and GitHub PRs run from the repo root. Use `@commit-changes` and `@create-pull-request` from [`.cursor/skills/`](.cursor/skills/) — not per-package copies.

After clone, reload the Cursor window so `/opsx-*` shows up.

| I want to… | Command |
|------------|---------|
| Think before building | `/opsx-explore` |
| Write the plan | `/opsx-propose` (then review) |
| Implement | `/opsx-apply` (then verify → PR) |
| Archive after merge | `/opsx-archive` |

Optional MCP: copy `.cursor/mcp.json.example` → `.cursor/mcp.json` (gitignored) and point it at your [solo-founder-workspace](https://github.com/franzegos/solo-founder-workspace) hub.

OpenSpec stays at the repo root (`openspec list`). Do not add `openspec/` under packages.
