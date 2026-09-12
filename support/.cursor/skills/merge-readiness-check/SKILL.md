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
| **Critical paths**  | Auth, payments, shared `src/api/client.ts`, high-traffic routes, TanStack Query cache                      |
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

List modules/routes/hooks touched. Note what was **not** touched (auth, API client, other features, etc.). Use counts for **Scope** and **Review summary**.

### 2. Incomplete work scan

Search the changed tree (and related call sites):

- `TODO`, `FIXME`, `HACK`, `XXX`
- `it.todo`, `test.skip`, `describe.skip`
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

Read the diff like a **code review focused on defects**. For each changed function, hook, or handler, look for:

- **Wrong or inverted logic** — `!` mistakes, swapped branches, `&&` vs `||`, early `return` skipping cleanup
- **Stale or wrong state** — missing deps in `useEffect` / `useMemo` / `useCallback`; state synced from props/query in effects; Zustand + Query fighting
- **Effect-heavy pages** — many `useEffect`s in one page component (see `data-ownership.mdc`); flag for refactor
- **Async mistakes** — missing `await`, fire-and-forget mutations without error handling, double-submit not guarded
- **Null / undefined** — optional chaining omitted where data can be missing; `array[0]` without length check
- **Types vs runtime** — unsafe casts (`as`), assuming API shape without parse when data is untrusted
- **Wrong identifiers** — copy-paste (wrong variable, wrong query key, wrong route param)
- **Off-by-one / boundaries** — pagination, date ranges, inclusive vs exclusive limits
- **UI logic bugs** — disabled button still clickable, form submits with invalid state, optimistic UI never rolled back on error

Cite **file + line or hunk** when reporting a likely bug. Confirmed defects → **Blocking**. Suspected issues needing repro → **Verify**.

### 5. Edge cases and error paths

For each changed flow, ask:

- Empty / null / loading / error states in UI
- Invalid API responses, network failure, session expiry (if auth exists)
- Pagination boundaries, duplicate submits, race on rapid clicks
- Zod validation: optional vs nullable vs cleared fields (see `zod-validation.mdc`)
- Query cache: stale data after mutation — are the right keys invalidated?
- Env misconfiguration (`VITE_*` missing in deploy)

Document in **Technical assessment → Edge cases**. New gaps → **Blocking** or **Verify**.

### 6. Regression / existing features

- What **existing routes or hooks** import or depend on changed modules?
- Did we change shared types/schemas without updating all consumers?
- Do changes assume a user role or route context that does not always apply?

Document in **Technical assessment → Regression risks**.

### 7. Critical paths

Pay extra attention when the diff touches areas **critical for this product**, for example:

| Area                            | Risk                                              |
| ------------------------------- | ------------------------------------------------- |
| Auth / session                  | Wrong gate, redirect loops, stale session UI      |
| Payments / checkout             | Money movement, method selection, error surfacing |
| `src/api/client.ts`             | Global behavior for all requests                  |
| High-traffic routes / wizards   | Multi-step state, validation, API contract        |
| Zustand drafts + TanStack Query | Stale UI after save or navigation                 |

Cite **N/A** when the diff does not touch relevant flows. Document in **Technical assessment → Critical paths**.

### 8. Cursor rules compliance (required)

**Read every rule file** under `.cursor/rules/` (including category subfolders) before judging merge readiness. Do not rely on memory — open each `.mdc` and check the diff against it. Rule index: [`.cursor/skills/SKILL.md`](../SKILL.md).

| Rule file                             | What to verify on this diff                                                                                                                                                                  |
| ------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `api/api-layer.mdc`                   | Feature modules in `src/api/features/<domain>/`; shared primitives in `src/api/schema/`; shared wrappers in `src/api/types/`; pages/components do not call `useQueryClient` for domain cache |
| `api/zod-validation.mdc`              | `safeParse`/`parse` at boundaries; primitives reuse; optional vs nullable correct for PATCH                                                                                                  |
| `testing/vitest-testing.mdc`          | New/changed `src/lib/` or `src/api/` has matching `src/test/…` tests when logic is non-trivial; no `it.todo` in touched tests                                                                |
| `core/naming-conventions.mdc`         | Lowercase `pages/` folders; PascalCase page files; `use-*.ts` hooks; kebab-case asset filenames                                                                                              |
| `pages/page-composition.mdc`          | Complex routes in folders; no `src/pages/**` file > 750 lines; thin `*Page.tsx` shell; colocate steps/dialogs/hooks                                                                          |
| `pages/page-layout.mdc`               | `AppPageShell` when used; width matches route; aligned chrome; `gap-8` zones; mobile CTAs; 320px reflow; touch targets ≥ 44×44; flat lists                                                   |
| `ui/design-tokens.mdc`                | Semantic tokens; shadcn primitives first; ThemeProvider + dark toggle when `.dark` exists; no arbitrary hex/palette; light/dark smoke                                                        |
| `forms/accessibility.mdc`             | Skip link + `#main`; labeled inputs (heading ≠ label); `aria-describedby` errors; `aria-live` on generating; named `TabsList`                                                                |
| `ui/icons-and-assets.mdc`             | UI icons via `iconLibrary`; brands via thesvg — no hand-rolled inline SVGs                                                                                                                   |
| `state/data-ownership.mdc`            | Query vs RHF vs useState vs Zustand; no server data in Zustand; minimal `useEffect` in pages; derived state at render                                                                        |
| `state/error-handling.mdc`            | One `status` union per surface; loading, empty, error, success — no `if (!data) return null`; generating states use live regions                                                             |
| `forms/forms-and-drafts.mdc`          | Long forms: dirty state, navigation blockers, autosave status, draft recovery; form errors wired for a11y                                                                                    |
| `copy/ui-microcopy.mdc`               | Sentence case; verb+object buttons; no em dashes in chrome; concrete errors/empty states; no label/placeholder echo; no vague "Oops" toasts                                                  |
| `copy/marketing-copy.mdc`             | Landing/hero: specific CTAs; ≤2 em dashes per screen; no buzzword clusters; real metrics; kickers/aphorisms only if intentional                                                              |
| `api/frontend-feature-boundaries.mdc` | One folder per feature in `api/features/`; no cross-feature page/lib imports; shared code in `components/ui/` or explicit shared modules                                                     |
| `security/frontend-security.mdc`      | Client role/permission checks are UX only; API enforces `401`/`403`; no secrets in `src/`; mutations handle auth errors — when diff touches guards, stores, or privileged API/UI             |
| `state/offline-reconnect.mdc`         | Cached reads offline, reconnect refetch, no `location.reload` on `online`, global online banner                                                                                              |
| `ui/interaction-polish.mdc`           | Acknowledge actions; `prefers-reduced-motion` respected; loading feedback on controls                                                                                                        |
| `ui/boneyard-skeletons.mdc`           | Primary surfaces use `LayoutSkeleton` + fixture when Boneyard is set up; route/nested fallbacks may use shadcn `Skeleton`                                                                    |
| ai-slop-check (`catalog.md`)          | Visual slop on changed UI: gradients, eyebrows (`slop-section-kicker`), nested cards, glassmorphism, filler CTAs in marketing                                                                |
| `ui/performance.mdc`                  | `React.lazy` + `Suspense` per route when 3+ page modules                                                                                                                                     |

**UI gate (when diff touches `src/pages`, `src/components`, `src/layouts`):**

| Dimension     | Block if                                                                                                                                 |
| ------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| Accessibility | Unlabeled inputs, missing skip link, no `aria-live` on generating-only UI, errors without `aria-describedby`                             |
| Responsive    | App nav overflows at 320px; touch targets &lt; 44px; primary CTAs not `w-full sm:w-auto` on mobile                                       |
| Layout        | Ad-hoc page padding/width; chrome wider than content; flat stacks without zone hierarchy; landing forced into `max-w-3xl` without intent |
| Theming       | `slate-*` / `bg-white` / `emerald-*` in components; dark mode broken on changed surfaces                                                 |
| Anti-patterns | Repeated section kickers, gradient text, nested cards — see ai-slop-check `catalog.md`                                                   |

In the report: summarize **Pass** or **Fail** first with highlights; violations → **Blocking** unless the user explicitly defers. Put the detailed checklist under **Technical assessment → Cursor rules**.

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

Failed `pnpm verify` → **Blocking**. Per `vitest-testing.mdc`: flag missing tests for non-trivial logic.

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

Example: _Confidence: High — `pnpm verify` passed with 8 new tests in `SearchOpportunitiesPanel.test.tsx`; change scoped to brands feature; no manual 320px check yet._

Do **not** assign High or Very high without citing at least two evidence factors.

#### Recommendation (conditional)

Include **## Recommendation** only when a **specific action** is required that is not already clear from Verdict + Reason + Overall (e.g. "fix `brands.service.ts` line 42 before merge"). **Omit entirely** when Verdict/Reason/Overall already state the merge stance — avoid repeating "merge after verifying X."

```markdown
# Merge readiness

## Scope

**Area:** Backend only | Frontend only | Full stack | Docs/skills only

**Touched:** N modules — (list key paths)

**Not touched:** (e.g. no auth changes, no `src/api/client.ts` changes, no shared schema drift, no other feature routes)

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
<!-- Examples: pnpm verify passed; 8 tests added in SearchOpportunitiesPanel.test.tsx; no a11y violations on changed inputs; query keys invalidated after mutation -->

- …

### ❤️ Things I loved

<!-- OPTIONAL — engineering craftsmanship ONLY. Omit entire subsection when nothing noteworthy. -->
<!-- Never repeat What's great bullets. No outcomes here (no "tests added", "verify passed"). -->
<!-- Examples: colocated hook extracted from page shell; mutation invalidation centralized in feature API module -->

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
