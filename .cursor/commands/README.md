# OpenSpec commands (canonical)

**Git source of truth:** this folder (repo-root `.cursor/commands/`).

Specs live in `openspec/` at the repository root. There is no `--store` flag.

After **any** command/skill change: reload the Cursor window so `/opsx-*` refreshes.

Do **not** run `openspec update --force` in this overlay (it can wipe `/opsx-verify` and chaining). If you run `openspec update`, restore this overlay’s commands and the propose/apply chain fragments.

**Ladder:** `/opsx-explore` → `/opsx-propose` (+ review when chained) → `/opsx-apply` (+ verify → PR when chained) → `/opsx-archive`

**Manual anytime:** `/opsx-review-proposal` · `/opsx-verify` · `/opsx-pr` · `/opsx-commit` · `/opsx-sync`

Full human guide: [WORKFLOW.md](../WORKFLOW.md).

Config: `openspec/config.yaml` (`kit.repos`, `kit.default_base_branch`).

**Skills at this level:**

| Task | Skill |
|------|--------|
| Commit + push | `openspec-commit` → `commit-changes` |
| Open PR | `create-pull-request` |
| Open PR (OpenSpec ship) | `openspec-pr` |

Per-package merge-readiness skills remain in `app/.cursor/skills/`, `backend/.cursor/skills/`, and `support/.cursor/skills/`.

**MCP:** copy [`.cursor/mcp.json.example`](../mcp.json.example) → `.cursor/mcp.json` (gitignored). Use a `ws_` API key from your [solo-founder-workspace](https://github.com/franzegos/solo-founder-workspace) hub.
