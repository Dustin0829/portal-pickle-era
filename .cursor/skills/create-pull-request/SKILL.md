---
name: create-pull-request
description: >-
  Drafts and opens GitHub pull requests from the monorepo git root using this
  skill’s PR body template. Prefer over generic PR user rules. Commits first
  (commit-changes) when needed, asks for base branch, runs verify per touched
  package, previews, then gh pr create. Use when the user asks to open or create
  a PR, or @create-pull-request.
disable-model-invocation: true
---

# Create pull request

Open a PR only when the user explicitly asks. Follow global **git safety** only (`gh`, HEREDOC, no secrets, no force push to protected branches). **PR title and body format come from this skill**, not the global `creating-pull-requests` user rule.

## Overrides global PR user rules

Do **not** use `## Summary` or `## Test plan` from the Cursor user rule. Use **only** the [PR body template](#pr-body-template) below.

Run all `git` and `gh` commands from the **repository git root** (`git rev-parse --show-toplevel`).

**Uncommitted changes:** this skill **commits for you** before opening the PR (follow [`commit-changes`](../commit-changes/SKILL.md) staging rules). You do not need to run `@commit-changes` separately unless you only want a commit without a PR.

## Required user inputs

Ask **every time** before drafting:

1. **Base branch** — typically `main`
2. **Related ticket(s)** (optional) — tracker ID/URL, `Fixes …`, or `none`

## PR title

- User gave ticket(s): lead with primary ID when helpful, e.g. `PROJ-123: Add examples optimistic create`
- Otherwise: one-line summary from `git log <base>...HEAD` or diff (match existing PR style in the repo)

Show title in preview; user may edit before `gh pr create`.

## PR body template

Fill exactly (headings unchanged). Replace placeholder bullets with real content.

```markdown
## Description Summary

<!-- Briefly describe what this PR does and why -->

**What changed:**

- [ ]
- [ ]
- [ ]

## Verification Proof

- [ ] I verified this change locally
- [ ] Confirmed there are no console errors

**Screenshots/evidence (if applicable):**

<!-- Paste or link screenshots, terminal output, or other proof -->

## Test Plan

- [ ]
- [ ]
- [ ]
```

### Description Summary

2–4 sentences: **why** and **what** (product level). **What changed:** 3–6 bullets — `- [x]` only for work clearly done in this PR.

### Verification Proof

Leave both checkboxes **unchecked** unless the user confirmed locally. If tests passed in this session, add a bullet under Screenshots/evidence (not the checkboxes).

### Screenshots/evidence

Include **Unit tests** subsection when applicable. Dev checks (`pnpm verify`, typecheck, build) belong here — **not** in Test Plan.

### Test Plan

Plain-language manual QA steps for reviewers. Dev verification belongs under **Screenshots/evidence**, not Test Plan.

## Verification (local only — do not check PR CI)

**Do not** check GitHub PR CI status after opening a PR. Do not run `gh pr checks`, poll GitHub Actions, or wait for deploy results.

**Before** `gh pr create`, run local verification for **each package** touched by the branch diff vs base. `commit-changes` should already have run verify; re-run if commits landed after the last verify.

| Package path | Command (from package dir) |
| ------------ | ------------------------ |
| `app/`       | `pnpm verify`            |
| `backend/`   | `pnpm verify`            |
| `support/`   | `pnpm verify`            |
| `openspec/` or `.cursor/` only | `openspec validate --specs` |

For docs-only under one package (no `src/`): at minimum `pnpm format:check` and `pnpm lint` in that package.

Paste results under **Screenshots/evidence**. Leave **Verification Proof** checkboxes unchecked unless the user confirmed locally.

### PR body format (copy into Screenshots/evidence)

```markdown
**Screenshots/evidence (if applicable):**

### Local verify

\`\`\`text
$ cd app && pnpm verify
format:check — pass
lint — pass
tsc -b --noEmit — pass
test:run — N passed
build — pass
(exit 0)

$ cd backend && pnpm verify
...
\`\`\`

New/changed test files:

- `app/src/test/.../file.test.ts` (N tests)
```

## Workflow

```
- [ ] 1. Ask base branch (+ optional tickets)
- [ ] 2. Inspect (status, branch, diff) from repository root
- [ ] 3. Auto-branch if current branch == base
- [ ] 4. Auto-commit if working tree dirty (commit-changes)
- [ ] 5. Re-inspect log + diff vs base
- [ ] 6. Run verify per touched package; capture evidence block
- [ ] 7. Draft PR title + body
- [ ] 8. Preview — wait for approval
- [ ] 9. Push if needed
- [ ] 10. gh pr create
- [ ] 11. Return PR URL
```

### Branch checks

- **Current branch == base:** auto-create a feature branch (`feat/<short-slug>`), then commit and open PR.
- **No commits ahead of base** after auto-commit: error — nothing to PR.

### Create PR

```bash
gh pr create --base <base> --title "..." --body "$(cat <<'EOF'
<filled template>
EOF
)"
```

**Stay on the feature branch** after creating the PR — do not check out `main` unless the user asks.

## Out of scope

- Auto labels/reviewers, draft PRs
- **PR CI status** — local `pnpm verify` is sufficient
- Splitting across PRs (user's split-to-prs skill)
