---
name: /opsx-review-proposal
id: opsx-review-proposal
category: Workflow
description: >-
  Strengthen proposal specs before apply — underspec bugs, edge cases, failure
  modes, regressions, critical paths; ask only for Blocking human judgment
---

Review an OpenSpec proposal after `/opsx-propose` and before `/opsx-apply`.

May also run as part of `/opsx-propose` when the propose command includes the chain patch.

Hardens **artifacts** (not code) so specs/design/tasks already cover potential
underspec bugs, edge cases, failure modes, regressions, and critical paths —
the same concern classes merge-readiness checks later in the diff. Auto-updates
recommended / Should-fix gaps; asks you only for **Blocking + human judgment**.
**Loops until solid** (clean re-review: zero Blocker + zero Should-fix) — aligned
to the stated idea, not overbuilt — then hands off for your final read (you choose
feedback or `/opsx-apply`).

Read and follow: `.cursor/skills/openspec-review-proposal/SKILL.md`

**Store selection:** If the change lives in a registered store, pass `--store <id>` on `openspec status`, `openspec list`, and related commands (same as `/opsx-apply`). Prefer `kit.store` from `openspec/config.yaml` when set.

**Input:** Optional change name (e.g. `/opsx-review-proposal add-auth`). If omitted, infer from conversation or `openspec list --json`.

**Summary:** Read proposal/design/specs/tasks → ground in codebase → apply shift-left lenses (bugs/edges/regressions/critical paths as *spec gaps*) → auto-patch Should-fix → ask Blockers that need you → **loop until solid** (full re-review clean) → handoff (no auto-apply).

**Manual:** Always available even when chained from propose.

**Ladder:** `/opsx-propose` → **`/opsx-review-proposal`** → `/opsx-apply` → `/opsx-verify` → `/opsx-pr` → `/opsx-archive`
