---
name: openspec-pr
description: >-
  OpenSpec monorepo PR workflow. Invoked after /opsx-verify passes, from
  /opsx-apply post-ship, or manually via /opsx-pr. Commits, pushes, and opens
  one GitHub PR from the repository root.
disable-model-invocation: true
---

# OpenSpec PR (shipping)

Run when:

1. **`/opsx-apply`** post-ship reached this step after verify, or
2. User invokes **`/opsx-pr`** / explicitly asks to commit, push, and open a PR

This repository is a **monorepo**. Git and `gh` run from the **repository root**. Verify runs inside each in-scope `kit.repos[].path`. Open **one** PR.

Package `create-pull-request` skills were removed — use [`.cursor/skills/create-pull-request/SKILL.md`](../create-pull-request/SKILL.md) at the repository root for PR body style and evidence. Do not run git inside a package as if it were its own remote.

## Config

Read `openspec/config.yaml`:

- `kit.repos[]` — `path`, `verify`, optional `verify_fast`, `commit_skill`, `pr_skill`
- `kit.store` — omit `--store` when `null`
- `kit.default_base_branch` — default `main`

**Ship gate:** Always run full `repo.verify` (in that package directory) before push/`gh pr create`. Never substitute `verify_fast` here.

## Prerequisites

- User **explicitly** requested PRs **or** apply post-ship reached this step.
- Prefer **`/opsx-verify` passed** for code changes. Warn and confirm if skipped/failed.

## Inputs

Ask once (unless provided):

1. OpenSpec change name
2. Base branch — default `kit.default_base_branch` or `main`
3. Related ticket(s) — optional
4. Packages to ship — default from `proposal.md` / `tasks.md`; skip packages with no changes

```bash
openspec status --change "<name>" --json
```

## Workflow

From the **repository root**:

```
1. git status && git log <base>...HEAD
2. If dirty: Conventional Commit (HEREDOC) using [commit-changes](../commit-changes/SKILL.md) at the repository root
3. Branch: stay on feature branch; if on base, checkout -b feat/<change-slug>
4. For each in-scope package with code changes: cd path && full repo.verify
5. git push -u origin HEAD
6. gh pr create — one PR; include OpenSpec change name and verify evidence
7. Record PR URL
```

**Do not** force-push or amend pushed commits unless the user asks.
**Do not** merge PRs.
**Stay on the feature branch** after the PR.

## PR body — link OpenSpec

Include:

- OpenSpec change: `<change-name>`
- Packages touched (`kit.repos` ids)
- Deploy order from `design.md` when relevant

## Skip a package when

- No diff vs base under that path and clean tree for those files
- Out of scope in `proposal.md`
- User excludes it

Plans-only: still open one PR if `openspec/` changed.

## Output format

```markdown
## PR: <change-name>

| Branch | PR | Packages | Status |
|--------|-----|----------|--------|
| feat/... | https://github.com/... | api, web | opened |

### Notes
- Verify before PR: yes / no / partial
- Deploy order: …
```

## Out of scope

- `/opsx-archive` — separate, after merge
