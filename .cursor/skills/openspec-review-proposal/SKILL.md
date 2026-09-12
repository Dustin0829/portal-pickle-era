---
name: openspec-review-proposal
description: >-
  Pre-apply proposal review for OpenSpec changes. Run after /opsx-propose
  (also chained from propose when patched) or manually via /opsx-review-proposal.
  Strengthens specs/design/tasks for underspecified bugs, edge cases, failure
  modes, regressions, and critical paths before code exists. Auto-applies
  recommended artifact patches; pauses only for Blocking + human judgment;
  loops until solid (clean re-review: zero Blocker + zero Should-fix), then
  hands off for final human read before /opsx-apply. Solid means the stated
  idea is aligned — not overengineered or scope-stretched.
disable-model-invocation: true
---

# OpenSpec review-proposal (pre-/opsx-apply)

Run **after** `/opsx-propose` completes artifacts and **before** `/opsx-apply`.
Does not implement application code. Goal: harden the change so apply does not
discover missing decisions mid-implementation — and so specs already cover the
same concern classes that `merge-readiness-check` hunts in code later.

Standalone `/opsx-review-proposal` remains available anytime (re-review after
your edits, skip propose chaining, etc.).

## Stance

- **Critical, not obstructive** — Flag real gaps; do not invent busywork.
- **Aligned, not stretched** — “Solid” means the **stated idea** is clear,
  consistent, and implementable. Close holes that would cause rework; do **not**
  expand scope, invent adjacent features, or over-specify speculative futures.
- **Grounded** — Prefer evidence from artifacts + codebase over speculation.
- **Actionable** — Every finding needs a clear resolve path.
- **Shift-left merge concerns** — Ask “is this decided and written into
  specs/tasks?” for bugs, edges, regressions, and critical paths — not “does
  the diff have a null bug?” (that is `/opsx-verify` + merge-readiness).
- **Auto-improve recommended fixes** — Apply clear **Should-fix** / recommended
  patches to proposal/design/specs/tasks **without** waiting for the user.
- **Pause only for human judgment** — Ask the user solely for **Blocker** items
  that need a product/tech decision (or when an auto-patch is stuck).

## Config

Read `openspec/config.yaml` → `kit.repos` for in-scope paths. Use `kit.store` with `--store` when set.

For each in-scope code repo, skim that repo’s `.cursor/skills/merge-readiness-check/SKILL.md`
**Critical paths** / category tables when present — reuse those product-specific
hotspots as planning prompts (do not copy code-review procedure into this skill).

## Inputs

- **Change name** — from `/opsx-review-proposal <name>`, conversation, or `openspec list --json`
- Optional focus: "edge cases only", "API contract", "auth paths", etc.

```bash
openspec status --change "<name>" --json
# Add --store <id> when kit.store is set
```

Use `changeRoot` / `artifactPaths` from status. Read all existing artifacts:

| Artifact | Why |
|----------|-----|
| `proposal.md` | Scope, why, repos, non-goals |
| `design.md` | Decisions, tradeoffs, data model, flows |
| `specs/**/spec.md` | Normative requirements / scenarios |
| `tasks.md` | Implementation coverage vs design |

If `applyRequires` artifacts are incomplete, stop and tell the user to finish `/opsx-propose` first.

## What this review covers (planning-time)

Same concern classes as merge-readiness, aimed at **artifacts**:

| Category | Planning question | Where it should land |
|----------|-------------------|----------------------|
| **Potential bugs** | Which wrong-branch / null / async / auth / status-code mistakes would an implementer invent if unspecified? | Normative scenarios + design decisions |
| **Edge cases** | Empty, invalid, boundary, partial, concurrent, timeout, retry? | Spec scenarios (Given/When/Then or equivalent) |
| **Failure modes** | Upstream errors, validation rejects, permission denials, idempotent replay? | Specs + design error handling |
| **Regressions** | What existing APIs, schemas, jobs, or UI flows must keep working? | Explicit must-not-break + tasks |
| **Critical paths** | Happy path + product hotspots for touched repos | Specs + tasks that name the path |
| **Incomplete plan** | Design decisions without tasks; tasks without acceptance criteria | `tasks.md` gaps |

**Not in scope here:** reading a git diff, running `pnpm verify`, Cursor rules on code, TODOs in source. Those belong to apply → `/opsx-verify` / merge-readiness.

**Not solid-by-overbuild:** Extra scenarios, abstractions, or tasks that are only “nice for a future epic” are **Nice-to-have** (or out of scope) — not Should-fix. Prefer explicit non-goals over inventing work.

## Workflow

### 1. Select change

Argument → conversation → single active change → ask if ambiguous.
Announce: `Reviewing change: <name>`.

### 2. Review loop (until solid)

Mirror `/opsx-verify`: keep reviewing and patching until a **clean pass**, or stop
for human judgment. Unlike verify → PR, a clean pass ends in **handoff** (do not
auto-apply).

Repeat until stop condition:

```
A. Read artifacts end-to-end
B. Ground in codebase (targeted — do not re-run full explore)
C. Apply review lenses → classify findings
D. Auto-patch Should-fix / clear recommendations into artifacts
E. If Blockers need human judgment → ask user, apply their answers, continue loop
F. If a Should-fix remains after a serious auto-patch → escalate once as human judgment
G. After patches (or answers), run a full re-review (A–C again)
H. Stop only when: clean pass OR Blocking + human judgment pending
```

**Pass criterion (solid):**  
A complete pass through all applicable lenses finds **zero Blocker** and **zero
Should-fix**. Nice-to-have / Assumed OK may remain — list them; they do not keep
the loop alive. Solid = the change’s idea is aligned and implementable without
guessing — not maximal coverage of every imaginable adjacent case.

**Stop conditions (not an infinite spin):**

| Condition | Action |
|-----------|--------|
| **Solid** — clean re-review: no Blocker, no Should-fix | Exit loop → **Final handoff** (below) |
| **Blocker** + human judgment | Ask only those questions; wait; patch with answers; re-review |
| Same Should-fix still present after an auto-patch meant to fix it | Escalate that item once to the user (do not keep rewriting blindly) |

**Stuck / thrash guard:** If the same Should-fix theme returns after a serious
patch (or patches keep expanding scope instead of closing gaps), escalate once
and/or reclassify as Nice-to-have / non-goal rather than inventing more surface.

This is the same **loop shape** as apply → verify (keep going until pass or human
judgment). The **end action** differs: handoff for your read → you choose
`/opsx-apply` or feedback — never silent apply.

### 3. Review lenses

Skip lenses that do not apply. For each applicable lens, **hunt gaps** and either auto-patch specs/design/tasks or ask Blockers.

#### A. Open questions & clarifications

Scan artifacts for unresolved “TBD”, “?”, “decide later”, or mutually exclusive options left open.

- Would guessing wrong force schema, API, or UX rework? → **Blocker** (or Should-fix if a safe default is obvious — write the default into design/specs).
- Soft preferences that won’t cause rework → Nice-to-have.

#### B. Scope & non-goals

- Is in-scope vs out-of-scope explicit enough that apply won’t balloon?
- Are repos in `kit.repos` / proposal aligned with where work actually lands?
- Any implied work (migrations, contract regen, worker changes, UI empty states) missing from proposal/tasks?
- Prefer tightening non-goals over adding speculative scope.

#### C. Potential underspec bugs (logic & correctness)

For each flow in design/specs, ask what an implementer would get **wrong** if the artifact is silent. Require a normative answer in specs (or a design decision) for anything likely:

- **Branching** — success vs failure vs partial; inverted conditions that matter to the product
- **Absence** — missing rows, optional relations, unset feature flags / env-dependent behavior
- **Async / jobs** — when work is enqueued vs committed; retry / idempotency / duplicate submit
- **Authz** — who may act; what happens on deny (status/body), not only the happy allow path
- **Contracts** — status codes, error shapes, pagination defaults, null vs omit vs empty list
- **Identifiers** — which id is authoritative across API / DB / queue / UI
- **Ordering / races** — concurrent updates, double-click, out-of-order webhook/job

If the happy path is specified but the failure branch is “handle errors somehow” → **Should-fix** (add scenarios) or **Blocker** if product-meaningful.

#### D. Edge cases & failure modes

For each changed or new flow, ensure specs cover (or explicitly non-goal) at least the relevant set:

| Prompt | Example gaps to close in specs |
|--------|--------------------------------|
| Empty / zero | No rows, empty list, first-time user |
| Invalid input | Bad body/query/params; validation failure behavior |
| Boundaries | Pagination page/limit, date ranges, max sizes |
| Partial failure | One step of a multi-step flow fails |
| Dependency down | DB / Redis / external API unavailable |
| Time | Timeouts, slow upstream, clock skew if relevant |
| Replay | Retries, duplicate webhooks, idempotent POSTs |

Prefer **concrete scenarios** in `specs/**/spec.md` over vague design prose. Auto-add scenarios when the correct behavior is clear from existing patterns in the codebase; ask when product choice is unclear. Skip prompts that do not apply to this change — do not pad specs for completeness theater.

#### E. Regressions & must-not-break

Ground in the codebase (call sites, shared schemas, consumers):

- Which **existing** endpoints, modules, jobs, or screens share types/services this change touches?
- Will schema / OpenAPI / event shape changes break callers (other repo, worker, UI)?
- List **must-not-break** behaviors in proposal or specs; add tasks that preserve or update consumers.

Silent breakage risk with no artifact mention → **Should-fix** (document) or **Blocker** if migration/compat strategy is ambiguous.

#### F. Critical paths (happy path + must-not-break)

1. Name the **primary happy path** end-to-end (who does what → observable result).
2. From each in-scope repo’s merge-readiness **Critical paths** table (when present), flag any hotspot this change is likely to touch — e.g. auth/session, env validation, error mapping, migrations, API contracts, queues/workers, shared API clients, high-traffic UI routes, cache keys.
3. Ensure those paths have:
   - Spec scenarios (or explicit N/A / non-goal), and
   - Tasks that implement and (where appropriate) test them.

Missing happy-path or hotspot coverage → **Should-fix**; ambiguous product behavior on a hotspot → **Blocker**.

#### G. Spec & task coverage

Cross-check design → specs → tasks:

| Check | Gap means |
|-------|-----------|
| Design decision with no matching spec scenario | Underspecified acceptance |
| Spec scenario with no task | Will be skipped at apply |
| Task with no verifiable outcome | Vague implementation |
| Code repos in scope but no verify / merge-readiness reminder in tasks or ship notes | Easy to skip `/opsx-verify` |

When code repos are in `kit.repos`, prefer a short task or note that apply is followed by verify + merge-readiness (do not invent a parallel process).

#### H. Consistency

Across proposal / design / specs / tasks:

- Naming (resources, statuses, fields) consistent
- API shape and status machine match UI copy / state diagram if both exist
- Error vocabulary aligned (same names the code repos already use, when grounded)

### 4. Classify findings

| Severity | Meaning | Action in this skill |
|----------|---------|----------------------|
| **Blocker** | Ambiguity that would force rework if guessed wrong | If a safe default is obvious → treat as Should-fix and auto-patch. If it needs **your** call → ask and wait. |
| **Should-fix** | Important gap **for this change’s idea**; safe default / clear recommendation exists | **Auto-edit** artifacts; re-review until clean |
| **Nice-to-have** | Low rework risk, polish, or adjacent idea | List; auto-edit only if trivial and clearly better; else leave optional — **does not** block solid |
| **Assumed OK** | Solid (brief) | — |

Each finding (in the report): **Where** · **Issue** · **Why it matters** · **Resolve** (what you patched, or question for the user)

**Auto-patch preference:** add or tighten **spec scenarios** and **tasks** first; update design only when a decision or tradeoff must be recorded; touch proposal for scope/non-goals/must-not-break lists. Prefer a short non-goal over a speculative scenario.

### 5. Final handoff (after solid)

When a clean pass is reached (or after your Blocker answers are applied and re-review is solid):

1. Summarize what was auto-updated (files + bullets) and **Autofix rounds** (informational).
2. Present the polished verdict: **Ready for your review** (not silent apply).
3. **Do not** start `/opsx-apply` automatically.
4. Ask the user to either:
   - Read the artifacts and run **`/opsx-apply`**, or
   - Give feedback → you update specs/artifacts (then they can re-run `/opsx-review-proposal` or ask you to continue).

### 6. When chained from `/opsx-propose`

After propose finishes creating artifacts, run this skill immediately on that change (see `patches/opsx-propose-post-review.md`). Same loop-until-solid + handoff. Manual `/opsx-review-proposal` still works independently.

## Output format

```markdown
# Proposal review: <change-name>

**Verdict:** Solid — ready for your review | Needs decisions | Solid after your answers applied

## Asked you (Blocking + human judgment)
## Auto-updated (Should-fix / recommended)
## Nice-to-have (optional — did not block solid)
## Coverage strengthened
- Potential underspec bugs: …
- Edge cases / failure modes: …
- Regressions / must-not-break: …
- Critical paths checked: …
## Autofix rounds: <n> (informational)
## Suggested next step
- Read artifacts, then /opsx-apply
- Or reply with feedback to adjust specs
- Or /opsx-review-proposal again after your edits
```

## Guardrails

- Do not implement application code
- Do not start `/opsx-apply` unless the user asks after the handoff
- Do not expand scope into a new epic — record follow-up in the proposal Non-goals or a later change
- Do not overengineer: solid ≠ exhaustive; close rework risks for **this** idea only
- Prefer editing OpenSpec artifacts over inventing new process docs
- Do not duplicate merge-readiness code review; only require that **plans** would survive it
