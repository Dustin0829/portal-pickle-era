---
name: merge-readiness-check
description: >-
  Pre-merge ship review with a decision-first executive summary, then technical
  assessment and verification. Covers bugs, edge cases, regressions, incomplete work,
  Cursor rules compliance (.cursor/rules), evidence-based confidence, and merge impact.
  Local pnpm verify only — never check PR CI. Use when the user asks if work is ready
  to merge, "ready to merge?", edge cases, critical paths, breaking changes, "any bugs",
  "follows cursor rules", or @merge-readiness-check.
disable-model-invocation: true
---

# Merge readiness check

Structured review **before merge**. Report structure:

1. **Scope** — what changed at a glance
2. **Verdict** — decision, reason, confidence, review summary card
3. **Executive review** — should I merge? (outcomes, craftsmanship, checks, merge impact)
4. **Technical assessment** — blocking/resolved, edge cases, paths, rules
5. **Verification** — local checks run
6. **Recommendation** — only when a specific action is needed (otherwise omit)

Run from **this repository’s** root. Use the feature branch and stated base branch (default `main`) unless the user specifies otherwise.

If the user asks about **multiple repos**, run this workflow **once per repo** from each root and apply **that repo’s** `.cursor/rules/`.

## Trigger phrases (same intent)

- Can you check if there are any edge cases we miss?
- Will there be any issue / critical paths after I merge this?
- Did we miss anything or is there anything we need to consider?
- Is this ready to merge?
- Will this have a bad effect on our existing features?
- Are there any potential bugs in this change?

Treat all of these as this skill. **Hunt for likely bugs**, not only product gaps and edge cases.

When the user asks **"ready to merge?"**, produce the **full output template** below.

## Writing tone (required)

Write like a **senior engineer reviewing a teammate's PR**. Be encouraging but evidence-based. Start with strengths, then discuss remaining concerns. Avoid generic praise or unnecessary criticism. **Every conclusion must be supported by something observed in the diff, tests, or verification.**

**Do not invent praise** simply because a section exists. Omit bullets that cannot be directly supported by the diff or verification.

## Issue status labels (required)

Every finding must use **one** status. Map it to the correct section:

| Label         | Meaning                                                                | Where it goes                                                                       |
| ------------- | ---------------------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| **Outcome**   | Objective, verifiable result (verify pass, tests added, no violations) | `### ✅ What's great` only — never in Things I loved                                |
| **Craft**     | Specific engineering craftsmanship (abstraction, naming, API design)   | `### ❤️ Things I loved` only — optional; never duplicate What's great bullets       |
| **Resolved**  | Fixed since the prior review (re-review only)                          | `### Resolved` under Technical assessment — **omit on first review**                |
| **Blocking**  | Must fix before merge; confirmed defect or failed local verification   | `### Blocking` under Technical assessment                                           |
| **Verify**    | Likely OK in code but needs manual/staging check                       | `Before merging` under **Only a few things I'd still check** — **canonical source** |
| **Follow-up** | Acceptable to merge; track after merge                                 | `After merging` under **Only a few things I'd still check** — **canonical source**  |

**What's great vs Things I loved — do not overlap:**

| Section               | Content type           | Examples                                                                                      | Never include                                                                 |
| --------------------- | ---------------------- | --------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| **✅ What's great**   | Objective outcomes     | `pnpm verify` passed; no Cursor violations; contracts unchanged; tests added; isolated change | Craft praise ("elegant abstraction"), implementation details already in loved |
| **❤️ Things I loved** | Engineering craft only | Elegant abstraction; clean separation; excellent naming; smart optimization; good API design  | Outcomes already stated in What's great (tests added, verify passed)          |

**Never repeat the same point across both sections.**

**On re-review:**

1. Read the **prior** merge-readiness comment or conversation findings.
2. For each prior **Blocking** item: confirm fix in diff → move to **Resolved** (cite commit or file). If not fixed → keep under **Blocking**.
3. Add `### Resolved` only when there are resolved items. Do **not** include "None — first review" filler.
4. Do **not** repeat resolved items under Blocking or technical subsections unless the fix regressed.

## What this review covers

| Category            | Examples                                                                                                   |
| ------------------- | ---------------------------------------------------------------------------------------------------------- |
| **Potential bugs**  | Wrong conditions, missing `await`, null slips, inverted logic, unhandled domain errors, wrong status codes |
| **Edge cases**      | Empty data, pagination boundaries, validation failures, Redis unset vs set                                 |
| **Regressions**     | Existing modules or routes that may break                                                                  |
| **Incomplete work** | TODOs, skipped tests, debug leftovers                                                                      |
| **Critical paths**  | `errorHandler`, `src/app/env.ts`, Prisma migrations, `contracts/openapi.json`, BullMQ producers            |
| **Cursor rules**    | Violations of `.cursor/rules/*.mdc` in touched code                                                        |

## Workflow

```
- [ ] 1. Scope the change (diff vs base, conversation plan, touched areas)
- [ ] 2. Incomplete work scan
- [ ] 3. Plan vs implementation (if a plan exists in context)
- [ ] 4. Potential bugs (logic and correctness)
- [ ] 5. Edge cases and error paths
- [ ] 6. Regression / existing features
- [ ] 7. Critical paths (product-specific high-risk areas)
- [ ] 8. Cursor rules compliance (`.cursor/rules/`)
- [ ] 9. Tests and verification (local only)
- [ ] 10. Fill Scope + review summary card from steps 1–9
- [ ] 11. Write output (executive → technical → verification; recommendation only if needed)
```

### 1. Scope the change

```bash
git fetch origin <base> 2>/dev/null || true
git diff origin/<base>...HEAD --stat
git diff origin/<base>...HEAD
git log origin/<base>..HEAD --oneline
```

List modules/routes/services touched. Note what was **not** touched (auth, migrations, frontend, etc.). Use counts for **Scope** and **Review summary**.

### 2. Incomplete work scan

Search the changed tree (and related call sites):

- `TODO`, `FIXME`, `HACK`, `XXX`
- `test.skip`, `describe.skip`
- `console.log` / `debugger` left for debugging
- Commented-out code blocks that look unfinished
- Feature flags or hardcoded stubs

Report each hit with file path. **Any unresolved item in touched production code → Blocking** unless the user explicitly accepts deferring it.

### 3. Plan vs implementation

If the conversation included a plan, checklist, or acceptance criteria:

| Planned item | Status                   | Notes |
| ------------ | ------------------------ | ----- |
| …            | done / partial / missing | …     |

Call out **missing** or **partial** items. Partial/missing acceptance criteria → **Blocking** or **Verify**.

### 4. Potential bugs (logic and correctness)

Read the diff like a **code review focused on defects**. For each changed route, controller, service, or middleware, look for:

- **Wrong or inverted logic** — `!` mistakes, swapped branches, `&&` vs `||`, early `return` skipping cleanup
- **Async mistakes** — missing `await`, fire-and-forget without error handling, double-submit not guarded
- **Domain errors** — services throwing raw `Error` instead of `AppError` subclasses; controllers branching on HTTP status
- **Null / undefined** — optional chaining omitted where Prisma rows can be missing
- **Types vs runtime** — unsafe casts (`as`), assuming request shape without Zod parse at boundary
- **Wrong identifiers** — copy-paste (wrong param name, wrong queue name, wrong Prisma model)
- **Off-by-one / boundaries** — pagination `page`/`limit`, inclusive vs exclusive filters
- **Transaction mistakes** — Redis/BullMQ inside `prisma.$transaction`; enqueue before commit resolves

Cite **file + line or hunk** when reporting a likely bug. Confirmed defects → **Blocking**. Suspected issues needing repro → **Verify**.

### 5. Edge cases and error paths

For each changed flow, ask:

- Empty / null results from Prisma queries
- Invalid `body` / `query` / `params` — does middleware reject before controller?
- `REDIS_URL` unset — do queue producers no-op safely?
- Migration required but not committed?
- Zod validation: optional vs nullable vs coerced query numbers (see `http-api.mdc`)
- Env misconfiguration (`DATABASE_URL`, webhook URLs) — does `env.ts` fail fast?

Document in **Technical assessment → Edge cases**. New gaps → **Blocking** or **Verify**.

### 6. Regression / existing features

- What **existing modules** import or depend on changed services or schemas?
- Did we change Zod schemas or OpenAPI without regenerating `contracts/openapi.json`?
- Do changes assume Redis, R2, or Discord webhooks that may be unset locally?

Document in **Technical assessment → Regression risks**.

### 7. Critical paths

Pay extra attention when the diff touches areas **critical for this backend**, for example:

| Area                             | Risk                                               |
| -------------------------------- | -------------------------------------------------- |
| Auth / session (when added)      | Wrong gate, token validation, audit gaps           |
| `src/middleware/errorHandler.ts` | Wrong status mapping for domain errors             |
| `src/app/env.ts`                 | Missing validation, unsafe defaults                |
| Prisma schema / migrations       | Deploy order, data loss, missing `db push` docs    |
| `contracts/openapi.json`         | Stale contract vs routes/schemas                   |
| BullMQ producers / worker        | Jobs enqueued inside transactions; no-Redis breaks |

Cite **N/A** when the diff does not touch relevant flows. Document in **Technical assessment → Critical paths**.

### 8. Cursor rules compliance (required)

**Read every rule file** under `.cursor/rules/` (category subfolders — see [SKILL.md](../SKILL.md)) before judging merge readiness. Do not rely on memory — open each `.mdc` and check the diff against it.

| Rule file                      | Folder          | What to verify on this diff                                                                                                                                                                                                            |
| ------------------------------ | --------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `module-boundaries.mdc`        | `core/`         | Naming; flat layout; layers; domain errors; no cross-module service imports                                                                                                                                                            |
| `platform-patterns.mdc`        | `platform/`     | API versioning; auth/tenant scoping; audit logs; caching; feature flags when touched                                                                                                                                                   |
| `http-api.mdc`                 | `api/`          | Resource routes; Zod at boundary; pagination/filter/sort; OpenAPI; no shared DTOs                                                                                                                                                      |
| `api-evolution.mdc`            | `api/`          | Additive changes preferred; breaking field removals/renames coordinated; OpenAPI regenerated                                                                                                                                           |
| `response-contracts.mdc`       | `api/`          | DTO/mapper/`select` only; no raw Prisma; response Zod schema defined first                                                                                                                                                             |
| `api-protection.mdc`           | `api/`          | High-cost/public/auth endpoints have rate limits, quotas, jobs, or idempotency                                                                                                                                                         |
| `search-query-guidelines.mdc`  | `api/`          | No multi-column contains chains; indexed search; min query length; paginated search                                                                                                                                                    |
| `database.mdc`                 | `data/`         | Migrations; bounded queries; no N+1; validated sort; select/include                                                                                                                                                                    |
| `concurrency.mdc`              | `data/`         | No read-modify-write races on balances/inventory; transactions or conditional updates                                                                                                                                                  |
| `multi-tenant-safety.mdc`      | `data/`         | Every tenant query scoped; `organizationId` from context not body; IDOR-safe lookups                                                                                                                                                   |
| `async-reliability.mdc`        | `async/`        | CRUD without Redis; idempotency; enqueue after writes; webhook dedup                                                                                                                                                                   |
| `worker-jobs.mdc`              | `async/`        | Jobs in `src/modules/**/*.job.ts`; API never imports `src/worker/**`; queue in `*.queue.ts`                                                                                                                                            |
| `worker-scaling.mdc`           | `async/`        | Worker concurrency/attempts/backoff; chunking for bulk jobs; dead-letter visibility                                                                                                                                                    |
| `external-dependencies.mdc`    | `integrations/` | Vendors in `src/lib/`; timeouts; retries with idempotency keys; no blocking HTTP on slow APIs                                                                                                                                          |
| `reliability-workers-deps.mdc` | `integrations/` | When to async; process split; enqueue after commit; short transactions; vendor resilience                                                                                                                                              |
| `file-uploads.mdc`             | `integrations/` | MIME allowlist; server keys; size limits; no trusted extensions                                                                                                                                                                        |
| `observability.mdc`            | `ops/`          | Structured logs; `requestId`; redaction for alerts                                                                                                                                                                                     |
| `security-secrets.mdc`         | `ops/`          | No `process.env` outside env.ts; no secrets in logs or client errors                                                                                                                                                                   |
| `activity-logs.mdc`            | `ops/`          | When diff touches `src/lib/activity-logs/` or auth capture paths: PII keys, envelope paths, fail-open; optional lens [`activity-logs-hunter`](./activity-logs-hunter/SKILL.md) — **no** Discord/Workspace filing required on PR review |
| `node-testing.mdc`             | `testing/`      | Co-located `*.test.ts`; `node:test`; Redis optional in tests                                                                                                                                                                           |

In the report: summarize **Pass** or **Fail** first with highlights; violations → **Blocking** unless the user explicitly defers. Put the detailed checklist under **Technical assessment → Cursor rules**.

### 8b. Activity log hygiene (when capture / redact / envelope / sampling touched)

If the diff changes activity capture, redaction, envelope paths, or sampling:

1. Confirm new sensitive fields are in `PII_KEYS` (or secret sets) with unit coverage.
2. Confirm high-PII 2xx identity paths stay enveloped where required.
3. Confirm fail-open behavior is unchanged.
4. Do **not** require a Discord digest or hunter run as merge evidence.

If the diff does not touch those areas → cite **N/A**.

### 9. Tests and verification (local only — do not check PR CI)

**Do not** check GitHub PR CI status. Do not run `gh pr checks`, poll GitHub Actions, or wait for deploy results.

Run full local `pnpm verify` when the diff is not trivially docs-only:

```bash
pnpm verify
```

For docs-only changes (`.md`, `.mdc` skills/rules with no `src/` changes), at minimum:

```bash
pnpm format:check
pnpm lint
```

Failed `pnpm verify` → **Blocking**. Per `node-testing.mdc`: flag missing tests for non-trivial logic.

### 10–11. Output (required format)

Lead with **scope and decision**, then **evidence**. Follow the writing tone above.

#### Verdict rules

| Verdict                | Emoji | When                                                                     |
| ---------------------- | ----- | ------------------------------------------------------------------------ |
| **Ready to merge**     | 🟢    | No **Blocking** items; optional **Verify** only if user accepts skipping |
| **Ready with caveats** | 🟡    | No code **Blocking** items; one or more **Verify** before merge          |
| **Not ready to merge** | 🔴    | One or more **Blocking** items or failed local verification              |

#### Confidence (evidence-based — do not default to High)

State confidence **after Reason**, and justify it from observed evidence. Weigh:

- **Verify status** — did `pnpm verify` pass locally?
- **Tests** — new/changed tests for touched logic?
- **Review coverage** — how much of the diff was read; any blind spots?
- **Production validation** — has behavior been checked in staging/production?
- **Architectural complexity** — isolated change vs cross-cutting refactor

Example: _Confidence: High — `pnpm verify` passed with 12 new tests; change isolated to `src/lib/intelligence/`; no production enrich run yet._

Do **not** assign High or Very high without citing at least two evidence factors.

#### Recommendation (conditional)

Include **## Recommendation** only when a **specific action** is required that is not already clear from Verdict + Reason + Overall (e.g. "fix `brands.service.ts` line 42 before merge"). **Omit entirely** when Verdict/Reason/Overall already state the merge stance — avoid repeating "merge after verifying X."

```markdown
# Merge readiness

## Scope

**Area:** Backend only | Frontend only | Full stack | Docs/skills only

**Touched:** N modules — (list key paths)

**Not touched:** (e.g. no auth changes, no database migrations, no frontend, no API contract changes)

---

## Verdict

🟢 Ready to merge | 🟡 Ready with caveats | 🔴 Not ready to merge

### Reason

(One paragraph: why you arrived at this verdict. Connect blocking/verify state, verify results, isolation, contract stability, and whether remaining work is code fix vs manual check.)

### Confidence

Very high | High | Medium | Low — (cite evidence factors; do not pick a label without justification)

### Review summary

|                        | Count |
| ---------------------- | ----- |
| Files reviewed         | N     |
| Modules touched        | N     |
| Potential bugs found   | N     |
| Blocking issues        | N     |
| Manual verification    | N     |
| Cursor rule violations | N     |
| Tests added (in diff)  | N     |

---

## Executive review

### Overall

(2–4 sentences. State whether you would merge, what feels solid, and what — if anything — still needs attention. On re-review, note what improved.)

### Merge impact

| Dimension           | Level (Low / Low–Medium / Medium / High) | Notes |
| ------------------- | ---------------------------------------- | ----- |
| User impact         |                                          |       |
| Deployment risk     |                                          |       |
| Rollback difficulty |                                          |       |
| Regression risk     |                                          |       |

### ✅ What's great

<!-- Objective outcomes ONLY. Every bullet must be verifiable from diff or verify. -->
<!-- Do not invent praise. Omit bullets that lack direct evidence. -->
<!-- Examples: pnpm verify passed; 12 tests added in evidence-preprocess.test.ts; OpenAPI unchanged; no Cursor violations -->

- …

### ❤️ Things I loved

<!-- OPTIONAL — engineering craftsmanship ONLY. Omit entire subsection when nothing noteworthy. -->
<!-- Never repeat What's great bullets. No outcomes here (no "tests added", "verify passed"). -->
<!-- Examples: prompt dedup in one function; caching kept inside claude.ts abstraction -->

- …

### ⚠️ Only a few things I'd still check

<!-- Canonical home for Verify and Follow-up. Checks/smoke tests/staging — not code tweaks. -->
<!-- Use "None." when clean. -->

#### Before merging

- …

#### After merging

- …

### Biggest remaining risk

(One sentence: if this PR fails in production, this is probably why. Be specific.)

---

## Technical assessment

### Blocking

<!-- Empty → None. Confirmed defects and failed verify only. -->

### Resolved

<!-- RE-REVIEW ONLY — omit this entire subsection on first review. -->

### Remaining

See **Executive review → Only a few things I'd still check**. Do not duplicate bullets here.

### Edge cases

### Critical paths

### Breaking changes

### Regression risks

### Cursor rules

**Pass** | **Fail**

**Highlights**

- …

<details>
<summary>Detailed checklist</summary>

| Rule | Result        | Notes |
| ---- | ------------- | ----- |
| …    | Pass/Fail/N/A | …     |

</details>

---

## Verification

- `pnpm verify` — ✅ pass | ❌ fail | not run (docs-only: `format:check` + `lint` minimum)
- PR CI — **not checked** (by design)

---

## Recommendation

<!-- OPTIONAL — include only when a concrete action is needed beyond what Verdict/Reason/Overall already say. Otherwise omit this entire section. -->

(Specific next step — e.g. fix file X, run migration Y. Do not restate the verdict.)
```

**Formatting rules**

- **Scope** comes first — reader knows what areas are in/out before the verdict.
- **Verdict order:** emoji verdict → **Reason** → **Confidence** (why before how confident).
- **What's great** = objective outcomes; **Things I loved** = craft only; **never overlap**.
- **Do not invent praise** — omit unsupported bullets in either positive section.
- **Verify** / **Follow-up** live only under **Only a few things I'd still check** — not duplicated under Remaining.
- **Biggest remaining risk** — one sentence, always include (even when risk is low).
- **Recommendation** — omit when redundant with Overall/Reason.
- **Technical assessment** subsections provide evidence — do not repeat Blocking bullets or executive check lists.
- Use emoji verdict indicators (🟢/🟡/🔴) consistently.
