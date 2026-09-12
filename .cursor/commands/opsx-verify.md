---
name: /opsx-verify
id: opsx-verify
category: Workflow
description: Post-apply verify — verify_fast in autofix loops, full verify + merge-readiness as ship gate
---

Run ship-readiness verification after `/opsx-apply` completes (or manually).

May also run as part of `/opsx-apply` post-apply ship when the apply command includes the chain patch.

Read and follow: `.cursor/skills/openspec-verify/SKILL.md`

**Store selection:** If the change lives in a registered store, pass `--store <id>` (see `kit.store` in `openspec/config.yaml`).

**Input:** Optional change name. If omitted, infer from conversation or `openspec list --json`.

**Summary:** Per touched repo from `kit.repos` → **`verify_fast`** during Blocking autofix (**no round cap**) → **full `verify` once** when fast is green → **merge-readiness once** on ship-green → report Verify/Follow-up without blocking → verdict before **`/opsx-pr`** or **`/opsx-archive`**. Agents pick commands from config (`verify_fast` / `verify`); do not ask which gate to run.

**Manual:** Always available even when chained from apply.
