---
name: openspec-commit
description: >-
  Commit and push on the current git branch for this monorepo. Use when the
  user runs /opsx-commit. Default: all safe local changes. If they say
  “only …”, commit that slice only. Not /opsx-pr.
disable-model-invocation: true
---

# OpenSpec commit (`/opsx-commit`)

Manual shortcut: **commit + push** so the user does not have to type “commit and push this to the current branch.”

This repository is a **monorepo**. Run all git commands from the **repository root**. Read and follow [`.cursor/skills/commit-changes/SKILL.md`](../commit-changes/SKILL.md) for Conventional Commit types, pre-commit verify per touched package (`app/`, `backend/`, `support/`), and staging rules.

## When to use

| User | Do |
|------|----|
| `/opsx-commit` | All safe dirty files → commit → push current branch |
| `/opsx-commit` only changes related to *X* | Stage only files for *X*; leave the rest unstaged; commit; push |
| Names a package | Only paths under that package |
| Names a branch | Checkout/use that branch first; otherwise **stay on current branch** |

Not required on the feature workflow. `/opsx-pr` still commits (and opens a PR) when shipping a change.

## Never stage

- `.env`, `.env.*` (except tracked `.env.example`)
- `node_modules/`, `dist/`, `coverage/`, `src/generated/`
- `.cursor/mcp.json`
- Paths in `.gitignore`

## Scope (required)

1. `git status` + `git diff` (+ untracked) from the repository root.
2. **Default:** every safe file.
3. **“Only … / not related to …”:** include matching paths; **do not** stage the rest. List skipped files in the report.
4. Split into more than one commit if there are unrelated logical changes **and** the user did not ask for a single commit of everything.

## Branch and push

- Stay on **current** `HEAD` unless the user names a branch.
- After a successful commit: `git push -u origin HEAD` (creates upstream if needed).
- **Do not** `git push` **`main`** unless the user explicitly names that branch and asks to push it. If they ran `/opsx-commit` while on `main`, **stop** and say so — they probably wanted a feature branch.
- **Do not** force-push. **Do not** merge. **Do not** open a PR. **Do not** poll CI.

## Output

```markdown
## Commit

| Branch | Commit | Pushed | Skipped (unstaged) |
|--------|--------|--------|--------------------|
| feat/… | `abc1234` feat(…): … | origin | `app/src/unrelated.tsx` |
```
