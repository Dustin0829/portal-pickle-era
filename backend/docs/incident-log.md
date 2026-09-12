# Incident log

Track mistakes AI (or humans) make while building on this template. **Rules grow from repeated pain — not prediction.**

## When to add a rule

| Occurrences | Action                                          |
| ----------- | ----------------------------------------------- |
| **1×**      | Log it here only — fix the PR, no new rule      |
| **2×**      | Log it — mention in PR review / merge-readiness |
| **3×**      | Add or strengthen a `.cursor/rules/*.mdc` file  |

Do not add rules for one-off mistakes. Do not add generic architecture rules (CQRS, DDD, SOLID, etc.) — see repo rules philosophy in `README.md`.

## How to log an entry

```txt
## YYYY-MM-DD — Short title

**What happened:** one sentence
**Rule (if any):** existing rule violated, or "none yet"
**Fix:** what we did in the PR
**Count:** 1 | 2 | 3 → promote to rule
```

## Log

<!-- Add new entries at the top -->

## Example entries (delete when real incidents are logged)

### 2026-07-01 — Forgot organization scope

**What happened:** `findUnique({ where: { id } })` on a campaign without `organizationId`.
**Rule (if any):** `multi-tenant-safety.mdc`
**Fix:** Scoped query + `NotFoundError` for wrong tenant.
**Count:** 1

### 2026-07-05 — Returned Prisma model directly

**What happened:** `return user` exposed fields when a new column was added to the User model.
**Rule (if any):** `response-contracts.mdc`
**Fix:** Added `userPublicSchema` + `toUserPublic()` mapper.
**Count:** 1

### 2026-07-09 — Missing timeout on OpenAI call

**What happened:** Request hung when OpenAI was slow; no `AbortSignal.timeout`.
**Rule (if any):** `external-dependencies.mdc`
**Fix:** Moved to job queue + timeout in `src/lib/openai/`.
**Count:** 1

---

Promoted rules from this process should link back here in their **AI guidance** section when helpful.
