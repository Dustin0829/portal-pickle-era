---
name: /opsx-commit
id: opsx-commit
category: Workflow
description: Commit and push on the current branch — all local changes, or only files related to a named topic
---

Manual anytime. **Not** part of the feature workflow auto-chain. Does **not** open a PR (`/opsx-pr`).

Read and follow: `.cursor/skills/openspec-commit/SKILL.md`

**Default (`/opsx-commit`):** Conventional Commit at the **repository root**, then `git push -u origin HEAD` on the **current** branch.

**Scoped:** `/opsx-commit` only changes related to … — stage/commit/push that slice only; leave unrelated files unstaged.

**Input:** Optional scope (“only …”). Optional branch name — otherwise stay on the current branch.
