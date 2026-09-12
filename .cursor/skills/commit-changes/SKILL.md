---
name: commit-changes
description: >-
  Stages safe changes and creates Conventional Commits for this monorepo (git
  root). Prefer over generic commit user rules. Use when the user asks to
  commit, @commit-changes, /opsx-commit, or when create-pull-request
  auto-commits before a PR.
disable-model-invocation: true
---

# Commit changes

Commit when the user explicitly asks, or when [`create-pull-request`](../create-pull-request/SKILL.md) runs the auto-commit step before a PR. Follow global git safety rules (no force push, no `--no-verify`, HEREDOC messages, never commit secrets).

Run all `git` commands from the **repository git root** (`git rev-parse --show-toplevel`).

## Message format ([Conventional Commits v1.0.0](https://www.conventionalcommits.org/en/v1.0.0/))

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

### Types

| Type       | Use for                                              |
| ---------- | ---------------------------------------------------- |
| `feat`     | New user-facing capability                           |
| `fix`      | Bug fix                                              |
| `docs`     | Documentation only (incl. OpenSpec specs)            |
| `style`    | Formatting, no logic change                          |
| `refactor` | Code change, not feat/fix                            |
| `perf`     | Performance improvement                              |
| `test`     | Tests only                                           |
| `build`    | Build tooling or deps                                |
| `ci`       | CI config                                            |
| `chore`    | Maintenance (Cursor skills, gitignore, etc.)         |
| `revert`   | Revert prior commit (add `Refs:` footer when helpful)|

### Rules

- **Subject:** imperative, lowercase type, `:` + space, short description — **no trailing period**
- **Scope:** optional — e.g. `feat(web):`, `feat(api):`, `feat(support):`, `chore(openspec):`
- **Breaking:** `feat(api)!:` and/or footer `BREAKING CHANGE: <description>`
- **One logical change per commit** — split unrelated work
- Inspect `git log -10` for habits; stay consistent

### Examples

```
feat(web): add examples list optimistic create
feat(api): add paginated examples endpoint
feat(support): surface activity log filters
chore: consolidate commit and PR skills at repo root
docs(openspec): sync activity-logs spec
```

## Never stage

- `.env`, `.env.*` (except tracked `.env.example`)
- `node_modules/`, `dist/`, `dist-ssr/`, `coverage/`, `src/generated/`
- `.cursor/mcp.json`
- Paths in `.gitignore`
- Files with `DO NOT COMMIT` in content (grep before add)

Warn on likely credentials not gitignored.

## Pre-commit verify (required)

Run **before** `git commit` for **each package** touched by staged paths. **Do not commit** if verify fails.

### `app/` staged

```bash
cd app
pnpm format:check || pnpm format
git add -- <paths>   # re-stage after format, from repository root
pnpm verify
```

### `backend/` staged

```bash
cd backend
pnpm format:check || pnpm format
git add -- <paths>
pnpm verify
```

- **OpenAPI drift:** run `pnpm openapi:generate` and commit `backend/contracts/openapi.json` when routes/schemas changed.

### `support/` staged

```bash
cd support
pnpm format:check || pnpm format
git add -- <paths>
pnpm verify
```

### `openspec/` or `.cursor/` only (no package `src/`)

```bash
openspec validate --specs
# or: openspec validate <change> when a change is active
```

Docs-only under a package still need `format:check` in that folder.

If verify cannot run (missing `node_modules`), run `pnpm install` in that package first.

## Workflow

```
- [ ] 1. Inspect (status, diff, log, branch) from repository root
- [ ] 2. Draft Conventional Commit message
- [ ] 3. Stage safe files (git add -- <paths>)
- [ ] 4. Pre-commit verify per touched package
- [ ] 5. Show staged list + message + verify result
- [ ] 6. git commit (HEREDOC)
- [ ] 7. git status
```

Do not push unless the user asks **or** the invoke is `/opsx-commit` (always pushes after a successful commit — see `openspec-commit`).
