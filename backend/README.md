# Backend

## Description

Production-ready Express backend starter for solo-founder SaaS projects. Run the full stack in Docker, ship typed APIs from Zod schemas, and turn on background jobs only when you need them.

## Key Features

- **Express 4** API with Zod validation and consistent error responses
- **Prisma 7 + PostgreSQL** — migrations run on container start
- **OpenAPI** generated from backend-owned Zod schemas (`contracts/openapi.json`)
- **Swagger UI** at `/docs` (optional basic auth in production)
- **BullMQ + Redis** — worker included in default Docker stack; CRUD works without Redis when running the API locally outside Docker
- **Bull Board** at `/admin/queues` when async mode is enabled
- **Winston logging** + Discord alert hooks for API errors
- **Cloudflare R2** presigned upload example
- **`pnpm make:module`** — scaffold flat feature modules
- **`pnpm verify`** — format, lint, typecheck, test, OpenAPI check, build

## Pre-requisites

| Tool    | Version / notes   |
| ------- | ----------------- |
| Node.js | 22+               |
| pnpm    | 10 (via Corepack) |
| Docker  | Docker Compose v2 |

Prisma agent skills (`prisma-client-api`, `prisma-cli`) are included under `.cursor/skills/` for accurate Prisma 7 codegen.

## Local Environment Setup

### 1. Install dependencies

```bash
pnpm install
```

### 2. Start the stack

API, worker, PostgreSQL, and Redis with hot reload. Migrations apply automatically on startup.

```bash
docker compose up -d
```

Or: `pnpm dev:docker`

Edits under `src/` reload the API and worker without rebuilding the image.

| URL                                | What         |
| ---------------------------------- | ------------ |
| http://localhost:3000              | API          |
| http://localhost:3000/docs         | Swagger UI   |
| http://localhost:3000/health/db    | Health check |
| http://localhost:3000/admin/queues | Bull Board   |

### 3. Seed sample data (optional)

```bash
cp .env.example .env   # first time only
pnpm db:seed
```

### 4. Add a feature

```bash
pnpm make:module campaigns
```

Follow the [add-feature-module](.cursor/skills/add-feature-module/SKILL.md) skill, then `pnpm openapi:generate` and `pnpm verify`.

### Useful scripts

| Script                    | Purpose                                             |
| ------------------------- | --------------------------------------------------- |
| `pnpm dev:docker`         | Docker Compose with hot reload (`tsx watch`)        |
| `pnpm verify`             | Format, lint, typecheck, test, OpenAPI check, build |
| `pnpm db:seed`            | Seed 10 Example rows                                |
| `pnpm make:module <name>` | Scaffold a feature module                           |
| `pnpm openapi:generate`   | Regenerate `contracts/openapi.json`                 |

## Documentation

| Doc                                                               | Contents                                                                                     |
| ----------------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| [Docker](docs/docker.md)                                          | Hot reload compose, default full stack                                                       |
| [Environment](docs/environment.md)                                | Env vars, admin auth, optional integrations                                                  |
| [API response samples](docs/api-response-samples.md)              | Success/error envelopes, validation, nested field paths                                      |
| [Platform patterns](.cursor/rules/platform/platform-patterns.mdc) | Auth, RBAC, API versioning, audit logs, caching, feature flags                               |
| [API protection](.cursor/rules/api/api-protection.mdc)            | Rate limits, quotas, cost controls for high-risk endpoints                                   |
| [Incident log](docs/incident-log.md)                              | Track AI mistakes; promote to rules after 3×                                                 |
| [Cursor rules index](.cursor/skills/SKILL.md)                     | Full ruleset map — `core/repo-agent-skills` explains loading; start with `module-boundaries` |
