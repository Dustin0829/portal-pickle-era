---
name: add-feature-module
description: >-
  Add or extend a backend feature module — routes, CRUD, paginated lists, optional
  BullMQ jobs, and OpenAPI. Use when adding an endpoint, module, list API, or
  background job.
---

# Add feature module

Golden reference: `src/modules/examples/`.

## 1. Scaffold (new domain only)

```bash
pnpm make:module <plural-kebab-name>
```

## 2. Schema (`<feature>.schema.ts`)

- Parse `body`, `query`, `params` with Zod (see `http-api.mdc`).
- Define **response** Zod schemas (`exampleSchema`) before service implementation (`response-contracts.mdc`).
- Extend `paginatedQuerySchema` from `src/lib/pagination.schema.ts` (`http-api.mdc`).
- Multi-tenant resources: plan `organizationId` scoping (`multi-tenant-safety.mdc`).

## 3. Service (`<feature>.service.ts`)

- Business logic and Prisma calls only (see `module-boundaries.mdc`).
- Throw `NotFoundError`, `ConflictError`, etc. — never `res.status()` in services.
- **Paginated list:** `parseSortField`, `pageToOffset`, `Promise.all` for items + count, `buildPaginationMeta`.
- **Multi-write flows:** use `prisma.$transaction` — see `database.mdc` and `prisma-client-api` skill.
- **After write:** enqueue optional jobs only after DB success (see `async-reliability.mdc`).
- **External APIs:** call via `src/lib/<vendor>/` only (see `external-dependencies.mdc`).

## 4. Controller (`<feature>.controller.ts`)

- Thin: read validated input, call service, `sendSuccess(res, data, "ok", status, meta?)` — see `module-boundaries.mdc`.
- Map DB rows to response DTOs in service or `*.mapper.ts` (`response-contracts.mdc`).
- Paginated lists: pass `meta` from the service as the fifth argument.

## 5. Routes (`<feature>.routes.ts`)

- Wire `validate()` middleware, then `asyncHandler(controller)`.

## 6. OpenAPI (`<feature>.openapi.ts`)

- Register paths from Zod schemas (see `http-api.mdc`).
- Document query params and pagination meta for list routes.
- Response schemas must match safe fields only (`response-contracts.mdc` — DTO, mapper, or explicit `select`).

## 7. Wire the app

- Import router in `src/app/router.ts`.
- Register OpenAPI in `src/app/openapi.ts`.

## 8. Optional background job

Only when the feature needs async work:

1. Add `<feature>.queue.ts` with `createOptionalQueue` from `src/queues/queue.ts`.
2. Add `<feature>.job.ts` with a `register*Worker()` function.
3. Register worker in `src/worker/index.ts`.
4. Add `registerQueueForBoard("<queue-name>")` in `src/queues/register-queues.ts` for Bull Board.
5. CRUD must still work when `REDIS_URL` is unset (`async-reliability.mdc`).

## 9. Tests

- Co-located `<feature>.test.ts` — schema defaults, pagination parsing, key service behavior.
- Keep Redis optional in tests (`node-testing.mdc`).

## 10. Finish

```bash
pnpm openapi:generate
pnpm verify
```

Commit `contracts/openapi.json`. Never create shared frontend/backend DTOs (`http-api.mdc`). Additive vs breaking schema changes: `api-evolution.mdc`. Billable or AI endpoints: `api-protection.mdc` before shipping.

## When not needed

- Health checks and internal routes may skip OpenAPI if they are not part of the public contract.
- Single-write CRUD does not need `$transaction`.
