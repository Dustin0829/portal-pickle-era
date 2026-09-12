---
name: backend-template
description: >-
  Index and onboarding map for this template's .cursor/rules — points to the
  canonical rule files under categorized subfolders; does not duplicate them.
  Use when adding endpoints, modules, jobs, integrations, or reviewing backend
  diffs; when the user mentions "which rule", module boundaries, or merge
  readiness.
---

# Backend template

**Source of truth:** [`.cursor/rules/`](../rules/) — glob-triggered `.mdc` files in category subfolders. This file is only a **map**: which rules apply, how they relate, and golden-path code. **Do not maintain parallel copies of rule content here.**

Rules layout (all under `.cursor/rules/` — no flat `.mdc` at the rules root):

```
core/   platform/   api/   data/   async/   integrations/   ops/   testing/
```

Golden path: `src/modules/examples/` (routes, service, schema, mapper, job, queue).

## When to use this index vs a rule

| Situation                               | Read                                                                       |
| --------------------------------------- | -------------------------------------------------------------------------- |
| Editing a file that matches a rule glob | That `.mdc` loads automatically — follow it                                |
| New module spanning HTTP + DB + job     | This index → open the linked rules below                                   |
| "Which rule covers X?"                  | This index                                                                 |
| Merge review                            | [`merge-readiness-check`](./merge-readiness-check/SKILL.md) § Cursor rules |

## Rule map (canonical links)

### `core/` — always apply + module shape

| Rule                            | Link                                                           |
| ------------------------------- | -------------------------------------------------------------- |
| Ponytail (YAGNI, minimal diff)  | [`ponytail-rules.mdc`](../rules/core/ponytail-rules.mdc)       |
| Repo skills (commit, PR, merge) | [`repo-agent-skills.mdc`](../rules/core/repo-agent-skills.mdc) |
| Module layout, layers, naming   | [`module-boundaries.mdc`](../rules/core/module-boundaries.mdc) |

### `platform/`

| Rule                                        | Link                                                               |
| ------------------------------------------- | ------------------------------------------------------------------ |
| Auth, RBAC, versioning, audit, cache, flags | [`platform-patterns.mdc`](../rules/platform/platform-patterns.mdc) |

### `api/`

| Rule                         | Link                                                                      |
| ---------------------------- | ------------------------------------------------------------------------- |
| Routes, Zod, OpenAPI         | [`http-api.mdc`](../rules/api/http-api.mdc)                               |
| DTOs, mappers, no raw Prisma | [`response-contracts.mdc`](../rules/api/response-contracts.mdc)           |
| Safe field changes           | [`api-evolution.mdc`](../rules/api/api-evolution.mdc)                     |
| Rate limits, quotas, cost    | [`api-protection.mdc`](../rules/api/api-protection.mdc)                   |
| Search without full scans    | [`search-query-guidelines.mdc`](../rules/api/search-query-guidelines.mdc) |

### `data/`

| Rule                         | Link                                                               |
| ---------------------------- | ------------------------------------------------------------------ |
| Prisma queries, migrations   | [`database.mdc`](../rules/data/database.mdc)                       |
| Races, transactions, locking | [`concurrency.mdc`](../rules/data/concurrency.mdc)                 |
| Tenant isolation             | [`multi-tenant-safety.mdc`](../rules/data/multi-tenant-safety.mdc) |

### `async/`

| Rule                        | Link                                                            |
| --------------------------- | --------------------------------------------------------------- |
| Jobs, idempotency, webhooks | [`async-reliability.mdc`](../rules/async/async-reliability.mdc) |
| Worker concurrency, backoff | [`worker-scaling.mdc`](../rules/async/worker-scaling.mdc)       |

### `integrations/`

| Rule                      | Link                                                                           |
| ------------------------- | ------------------------------------------------------------------------------ |
| Stripe, OpenAI, R2, email | [`external-dependencies.mdc`](../rules/integrations/external-dependencies.mdc) |
| Presigned uploads, MIME   | [`file-uploads.mdc`](../rules/integrations/file-uploads.mdc)                   |

### `ops/`

| Rule                          | Link                                                        |
| ----------------------------- | ----------------------------------------------------------- |
| Logging, requestId, redaction | [`observability.mdc`](../rules/ops/observability.mdc)       |
| Secrets, env, no leakage      | [`security-secrets.mdc`](../rules/ops/security-secrets.mdc) |
| Activity log capture hygiene  | [`activity-logs.mdc`](../rules/ops/activity-logs.mdc)       |

### `testing/`

| Rule                 | Link                                                    |
| -------------------- | ------------------------------------------------------- |
| `node:test` patterns | [`node-testing.mdc`](../rules/testing/node-testing.mdc) |

## Docs (examples, not rules)

| Doc                                                        | Contents                                                           |
| ---------------------------------------------------------- | ------------------------------------------------------------------ |
| [API response samples](../../docs/api-response-samples.md) | Success/error envelopes, validation, nested dot-path `fieldErrors` |
| [Incident log](../../docs/incident-log.md)                 | Track repeated AI mistakes; promote to rules after 3×              |

## Workflows (pointers only)

**New endpoint or module** — read in order:

1. [`add-feature-module`](./add-feature-module/SKILL.md)
2. [`core/module-boundaries.mdc`](../rules/core/module-boundaries.mdc) + [`api/http-api.mdc`](../rules/api/http-api.mdc)
3. [`api/response-contracts.mdc`](../rules/api/response-contracts.mdc) + [`data/database.mdc`](../rules/data/database.mdc)
4. Jobs / vendors → [`async/async-reliability.mdc`](../rules/async/async-reliability.mdc) + [`integrations/external-dependencies.mdc`](../rules/integrations/external-dependencies.mdc)
5. [`testing/node-testing.mdc`](../rules/testing/node-testing.mdc) → `pnpm verify`

Error envelope examples → [`docs/api-response-samples.md`](../../docs/api-response-samples.md).

**External vendor (Stripe, OpenAI, …)** → [`add-external-integration`](./add-external-integration/SKILL.md).

**Merge review** → [`merge-readiness-check`](./merge-readiness-check/SKILL.md) (§8 rules table).

## OpenSpec planning ladder (multi-repo / plans root)

This **code** repo owns merge-readiness per package; **commit** and **PR** skills live at the repository root (`.cursor/skills/`).

Cross-repo planning lives in the **plans** OpenSpec root (sibling `*-plans` or monorepo root with `openspec/`):

```text
/opsx-explore → /opsx-propose → /opsx-review-proposal → /opsx-apply → /opsx-verify → /opsx-pr → /opsx-archive
```

- After apply, prefer **`/opsx-verify`** from the plans root (orchestrates this repo’s `pnpm verify` + `@merge-readiness-check`).
- Standalone here: `@merge-readiness-check` / `@commit-changes` / `@create-pull-request`.
- Kit install/sync: `Templates/openspec-kit/sync.sh` or `install.sh`.

## Related skills

| Task                 | Skill                                                                            |
| -------------------- | -------------------------------------------------------------------------------- |
| Commit               | [`commit-changes`](../../../../.cursor/skills/commit-changes/SKILL.md)           |
| PR                   | [`create-pull-request`](../../../../.cursor/skills/create-pull-request/SKILL.md) |
| Merge ready?         | [`merge-readiness-check`](./merge-readiness-check/SKILL.md)                      |
| Activity logs hunter | [`activity-logs-hunter`](./activity-logs-hunter/SKILL.md)                        |
| Activity logs fixer  | [`activity-logs-fixer`](./activity-logs-fixer/SKILL.md)                          |
| Prisma Client        | [`prisma-client-api`](./prisma-client-api/SKILL.md)                              |
| Prisma CLI           | [`prisma-cli`](./prisma-cli/SKILL.md)                                            |
