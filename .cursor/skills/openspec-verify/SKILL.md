---
name: openspec-verify
description: >-
  Post-apply ship-readiness verification for OpenSpec changes. Run after
  /opsx-apply tasks complete. Uses verify_fast during autofix loops and full
  verify + merge-readiness once as the ship gate. Auto-fixes Blocking until
  clean or Blocking+human-judgment. Use with /opsx-verify (also chained from
  /opsx-apply post-ship when patched).
disable-model-invocation: true
---

# OpenSpec verify (post-/opsx-apply)

Run **after** `/opsx-apply` completes implementation tasks for a change.
Does not replace `/opsx-apply` — this is ship-readiness verification before PRs/archive.

Standalone `/opsx-verify` remains available anytime (re-run after fixes, skip apply chaining, etc.).

## Config

Read `openspec/config.yaml`:

- `kit.repos[]` — `id`, `path`, `verify`, optional `verify_fast`, `format`, `merge_readiness_skill`
- `kit.store` — pass `--store` when set
- `kit.default_base_branch` — default `main`

Resolve each repo’s skill paths relative to that repo’s `path`.

### Verify tiers (required behavior)

Agents **must** pick the command from config — do not invent ad-hoc scripts or ask the user which gate to run.

| Key | When to run | Purpose |
| --- | ----------- | ------- |
| `verify_fast` | Autofix / iteration rounds; mid-apply task checks when tasks call “verify” | Cheap feedback (lint/typecheck/etc.) |
| `verify` | **Once** per repo after autofix is clean (or immediately if no autofix); also the gate `/opsx-pr` re-runs | Full ship gate (tests, build, openapi, …) |

**Fallback:** If `verify_fast` is missing, use `verify` for every round (backward compatible, slower).

**Do not** run full `verify` on every autofix iteration when `verify_fast` is configured.

## When to skip

Skip full code verify when the change is **documentation-only**:

- `proposal.md` / `tasks.md` state no application `src/` changes
- Only the plans store / `openspec/` artifacts were edited

For documentation-only: run `openspec validate <change>` (with `--store` if needed) and stop.

## Inputs

- **Change name** — conversation or `openspec list --json`
- **Repos in scope** — from `proposal.md` intersected with `kit.repos`

```bash
openspec status --change "<name>" --json
```

## Workflow per touched code repo

```
1. cd to repo.path
2. Optional: run repo.format on touched files
3. Iteration loop (no round cap):
   a. Run verify_fast (or verify if verify_fast absent)
   b. Lightweight Blocking scan from failures + obvious diff issues
      — do NOT run full merge_readiness_skill yet
   c. If Blocking + code-fixable → fix → goto 3a
   d. If Blocking + human judgment → STOP (report; no PRs)
   e. If verify_fast clean → exit loop
4. Ship gate (once):
   a. Run full repo.verify
   b. If verify fails with code-fixable Blocking → fix → back to step 3
      (re-enter fast loop; do not repeat merge-readiness until verify is green)
   c. When verify passes → read merge_readiness_skill (if present)
   d. Review diff vs base (kit.default_base_branch)
   e. Classify: Blocking | Verify | Follow-up | Resolved
   f. If Blocking + code-fixable → fix → back to step 3
   g. If Blocking + human judgment → STOP
5. Report summary for this repo
```

### Auto-fix policy (no iteration limit)

No round cap. Speed comes from **`verify_fast` + deferred merge-readiness**, not from stopping early.

| Stop condition | Action |
|----------------|--------|
| **Pass** — full `verify` OK, no unresolved **Blocking**, merge-readiness not “Not ready” | Done for this repo |
| **Blocking + human judgment** | **Stop.** Report. Do not mark verify passed. Do not open PRs. |

| Finding | Action |
|---------|--------|
| **Blocking** + code-fixable | Fix → `verify_fast` loop → full `verify` again only when fast is green → merge-readiness once when ship-green |
| **Blocking** + human judgment | **Stop.** Report. Do not mark verify passed. |
| **Verify** / **Follow-up** | Report only; **do not** treat as ship blockers and **do not** keep the autofix loop alive for them |

**Why Verify / Follow-up do not block autofix or “Ready for PRs”:**  
They come from each repo’s `merge-readiness-check` severity model:

- **Blocking** — confirmed defect / failed verify / must fix before merge  
- **Verify** — code looks OK; needs a **manual** or staging check (cannot be closed by more code churn in this loop)  
- **Follow-up** — fine to merge; track **after** merge  

So the autofix loop only chases **Blocking**. Listing Verify/Follow-up is the handoff for humans (or post-merge), not a reason to keep rewriting code forever.

**Stuck code-fixable Blocking:** If the same Blocking item remains after a serious fix attempt, escalate once as **Blocking + human judgment** (what you tried, what still fails) instead of spinning forever on an impossible fix.

**Do not** commit, push, or open PRs from this skill alone.

When chained from `/opsx-apply` post-ship: if verify **passes**, continue to `openspec-pr`. When standalone `/opsx-verify`, end with next-step `/opsx-pr`.

## Output format

```markdown
## Verify: <change-name>

### <repo-id>
- Verify fast (iteration): pass | fail | n/a
- Verify (ship): pass | fail
- Merge-readiness: pass | blocked | skipped
- Blocking (needs you): …
- Verify (manual): …
- Follow-up: …
- Autofix rounds: <n> (informational; used verify_fast: yes/no)

### Verdict
- **Ready for PRs:** yes | no
- **Next:** /opsx-pr | fix blockers | /opsx-archive
```

## Passed when

- All in-scope code repos: full `verify` passes (not only `verify_fast`)
- No unresolved **Blocking** findings
- Merge-readiness is not “Not ready to merge” (🟢 Ready or 🟡 Ready with caveats is OK)
- **Verify** / **Follow-up** may remain — list them; they do not fail this skill
