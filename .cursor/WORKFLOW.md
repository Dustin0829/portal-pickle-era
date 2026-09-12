# Solo-founder-starter development workflow

How we plan, build, review, and ship to `main` in this monorepo.

## 1. Repo setup

**Purpose:** One clone, one Cursor window, shared `/opsx-*` commands.

```text
solo-founder-starter/
├── .cursor/                 ← /opsx-* commands + workflow skills
├── app/                     ← product web (Vite + React)
├── support/                 ← operator web (Vite + React)
├── backend/                 ← product API (Express + Prisma)
└── openspec/                ← the only OpenSpec store
```

| What | Where | Why |
|------|--------|-----|
| `/opsx-*` commands, overlay skills | `.cursor/` at repo root | One git repo, one Cursor window |
| Workspace MCP (optional) | `.cursor/mcp.json` (gitignored) | Load board cards from **solo-founder-workspace** |
| Specs and changes | `openspec/` | Planning lives with the product |
| Architecture rules | Each package’s `.cursor/rules/` | Only load rules for that codebase |

No overlay sync script. Pull this repo; reload the Cursor window if slash commands look stale.

## 2. External workspace hub (optional)

**Purpose:** Boards, cards, and MCP live in **[solo-founder-workspace](https://github.com/franzegos/solo-founder-workspace)** — a separate template. This product starter does not include that code.

If you have a live hub, point Cursor MCP at **that** instance:

```json
{
  "mcpServers": {
    "workspace": {
      "url": "https://YOUR-WORKSPACE-API/mcp",
      "headers": {
        "Authorization": "Bearer ws_YOUR_SECRET"
      }
    }
  }
}
```

Keep `mcp.json` local and gitignored. `/opsx-explore` can load a board card when MCP is configured; otherwise treat the prompt as the idea.

## 3. Feature workflow (`/opsx-*`)

**Purpose:** Take one idea from plan → code → PR into `main`, without skipping review.

Specs live in `openspec/` (`openspec list` from the repo root).

| Step | Command | Purpose | Auto-chains? | You |
|------|---------|---------|--------------|-----|
| **Explore** | `/opsx-explore` | Think through a Workspace card (or an idea) before proposing. No code. | — | Before `/opsx-propose` when a card exists |
| **Propose** | `/opsx-propose` | Create `proposal.md`, `design.md`, specs, `tasks.md`. Cite per-package rules by path. | → review-proposal | Run when starting a feature |
| **Review proposal** | `/opsx-review-proposal` | Harden plan: edge cases, gaps, regressions — **before** coding. | Loops until solid | Read artifacts; say when to apply |
| **Apply** | `/opsx-apply` | Implement `tasks.md` in app / support / backend. | → verify → PR | Review code as it lands |
| **Verify** | `/opsx-verify` | Local ship gate: lint/typecheck/tests + merge-readiness per package. | — | Fix blockers or re-run |
| **PR** | `/opsx-pr` | Commit, push, open **one** PR (**feature branch → `main`**). | — | **Merge the PR on GitHub** |
| **Sync specs** | `/opsx-sync` | Merge delta specs into main specs (optional before archive). | — | When needed |
| **Archive** | `/opsx-archive` | Move change to archive; lock planning history. | — | After the feature is merged and done |

**Manual anytime:** `/opsx-review-proposal` · `/opsx-verify` · `/opsx-pr` · `/opsx-sync` · `/opsx-commit`

## 4. Per-package rules and skills

**Purpose:** API and UI follow different conventions. Those live **in the package**, not in the root overlay.

Open `{package}/.cursor/skills/SKILL.md` first — it indexes which `.cursor/rules/` and skills apply.

| Package | Path | Typical rules |
|---------|------|----------------|
| Product API | `backend/` | core, api, data, async, testing |
| Product web | `app/` | core, api, state, pages, ui, forms, security, testing |
| Support web | `support/` | same as product web |

When planning or applying: **cite** those file paths in `design.md` / `tasks.md`. Do not paste the rule text.

## 5. Git and commits

**Purpose:** Conventional Commits from the **repository root**. This is one git repo — do not `git` inside `app/` or `backend/` as if they were remotes.

**Manual anytime:** `/opsx-commit` — commit and **push** on the **current** branch (does not open a PR).

| You run | What happens |
|---------|--------------|
| `/opsx-commit` | All safe local changes → Conventional Commit → `git push -u origin HEAD` |
| `/opsx-commit` only changes related to _X_ | Only that slice is committed and pushed; unrelated files stay unstaged |

Message format: follow [`.cursor/skills/commit-changes/SKILL.md`](skills/commit-changes/SKILL.md) for types/scopes and per-package verify, then commit **once** at the repo root (or split logical commits). `/opsx-pr` also commits, then opens one PR.

```
<type>[optional scope]: <description>
```

- Imperative subject, lowercase type, no trailing period
- One logical change per commit
- Breaking: `type(scope)!:` and/or `BREAKING CHANGE:` in the footer

Do not commit `.env`, secrets, `node_modules/`, or `dist/`. Do not push `main` unless you explicitly ask.

## 6. Verify (local quality gate)

**Purpose:** Fail on your machine before GitHub. `/opsx-verify` = cheap loop, then one full suite, then a product-risk read.

```
format → verify_fast (until green) → verify (tests + build, once) → merge-readiness (once)
```

Commands come from `openspec/config.yaml` `kit.repos`. Agents must not invent gates.

| Layer | What | Typical |
|-------|------|---------|
| **Fast** | Prettier + ESLint + `tsc` | `verify_fast` — every fix round |
| **Full** | Fast + **all tests** + **production build** | `verify` — ship gate |
| **Merge-readiness** | Bugs, edge cases, breaking, Cursor rules | After full is green |

Runners do not `--bail`. If a **test** fails: fix → re-run **that file** → **full `verify` once**. `/opsx-pr` also needs full `verify` for in-scope packages.

## 7. Activity-logs agents (optional)

**Purpose:** Scheduled Cursor Automations that hunt anomalies in the Timescale activity store and fix Ready cards — without manual log scrolling.

| Agent | Canonical skill | Overlay run loop |
|-------|-----------------|------------------|
| Hunter | `backend/.cursor/skills/activity-logs-hunter/SKILL.md` | `.cursor/skills/activity-logs-hunter` |
| Fixer | `backend/.cursor/skills/activity-logs-fixer/SKILL.md` | `.cursor/skills/activity-logs-fixer` (pointer) |

**Day-1 policy:** CRITICAL → Workspace Backlog; HIGH/IMPROVE → Discord digest only. Human triage moves real findings **Backlog → Ready**; Fixer never picks Backlog.

**Setup (human, after merge):** read `backend/docs/activity-logs-anomaly-agents.md` — read-only Timescale role, Discord webhook, Workspace labels, Cursor Automations.

Requires optional [solo-founder-workspace](https://github.com/franzegos/solo-founder-workspace) MCP for card filing.

## Quick reference

| I want to… | Use |
|------------|-----|
| Explore a card or idea (before propose) | `/opsx-explore` |
| Start a feature | `/opsx-propose` |
| Stress-test the plan | `/opsx-review-proposal` |
| Implement tasks | `/opsx-apply` |
| Re-run local checks | `/opsx-verify` |
| Commit and push on current branch | `/opsx-commit` |
| Open a feature PR into `main` | `/opsx-pr` |
| Fold delta specs into main specs | `/opsx-sync` |
| Lock the change | `/opsx-archive` |
