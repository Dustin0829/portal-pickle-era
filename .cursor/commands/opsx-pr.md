---
name: /opsx-pr
id: opsx-pr
category: Workflow
description: Commit, push, and open one GitHub PR for an OpenSpec change
---

Open a GitHub PR for an OpenSpec change — **one PR** from this monorepo (feature branch → `main`).

Also runnable after `/opsx-verify`, or as post-apply ship when apply includes the kit patch.

Read and follow: `.cursor/skills/openspec-pr/SKILL.md`

**Store selection:** Use the local `openspec/` root. Pass `--store <id>` only if `kit.store` in `openspec/config.yaml` is set (it is `null` in this template).

**Input:** Optional change name, base branch (default from `kit.default_base_branch` or `main`), optional ticket IDs.

**Prerequisite:** Prefer `/opsx-verify` passed for code changes; warn if skipped.

**Summary:** In-scope packages from `kit.repos` → full `verify` in each package path → Conventional Commit at repo root → push → `gh pr create` → report the PR URL. Stay on the feature branch.
