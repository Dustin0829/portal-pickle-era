---
name: frontend-template
description: >-
  Index and onboarding map for this template's .cursor/rules — points to the
  canonical rule files under categorized subfolders; does not duplicate them.
  Use when building or reviewing pages, components, layouts, forms, or async UI;
  when the user mentions "which rule", page shell, design tokens, or
  Impeccable-style UI review.
---

# Frontend template

**Source of truth:** [`.cursor/rules/`](../rules/) — glob-triggered `.mdc` files in category subfolders. This file is only a **map**: which rules apply, how they relate, and golden-path code. **Do not maintain parallel copies of rule content here.**

Rules layout — categorized subfolders only (no loose `.mdc` at the rules root):

```
core/     api/     state/     pages/     ui/     forms/     copy/     security/     testing/
```

Always-on in `core/`: `repo-agent-skills`, `naming-conventions`, `ponytail-rules`.

Golden paths in `src/`:

- Layout: `src/components/layout/`, `src/pages/home/HomePage.tsx`
- Async demo: `src/pages/home/ExamplesSection.tsx`
- API field errors: `src/api/lib/apply-field-errors-to-form.ts`

## When to use this index vs a rule

| Situation                               | Read                                                                                            |
| --------------------------------------- | ----------------------------------------------------------------------------------------------- |
| Editing a file that matches a rule glob | That `.mdc` loads automatically — follow it                                                     |
| New feature spanning API + page + forms | This index → open the linked rules below                                                        |
| "Which rule covers X?"                  | This index                                                                                      |
| UI / merge review                       | [`merge-readiness-check`](./merge-readiness-check/SKILL.md) § Cursor rules + Impeccable gate    |
| AI slop / generic UI tells              | [`ai-slop-check`](./ai-slop-check/SKILL.md) — audit; day-to-day authoring → `copy/` rules below |
| shadcn components / CLI                 | [`shadcn`](./shadcn/SKILL.md)                                                                   |
| Optimistic mutations                    | [`optimistic-ui`](./optimistic-ui/SKILL.md)                                                     |

## Rule map (canonical links)

### `core/` — always apply

| Rule                            | Link                                                             |
| ------------------------------- | ---------------------------------------------------------------- |
| Ponytail (YAGNI, minimal diff)  | [`ponytail-rules.mdc`](../rules/core/ponytail-rules.mdc)         |
| Naming                          | [`naming-conventions.mdc`](../rules/core/naming-conventions.mdc) |
| Repo skills (commit, PR, merge) | [`repo-agent-skills.mdc`](../rules/core/repo-agent-skills.mdc)   |

### `api/`

| Rule                         | Link                                                                                                                    |
| ---------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| Feature modules, Query hooks | [`api-layer.mdc`](../rules/api/api-layer.mdc)                                                                           |
| Zod at boundaries            | [`zod-validation.mdc`](../rules/api/zod-validation.mdc)                                                                 |
| Response mapping             | [`response-mapping.mdc`](../rules/api/response-mapping.mdc)                                                             |
| Form vs toast errors         | [`api-error-routing.mdc`](../rules/api/api-error-routing.mdc)                                                           |
| Feature boundaries           | [`frontend-feature-boundaries.mdc`](../rules/api/frontend-feature-boundaries.mdc) — loads on `src/api/**`, `src/lib/**` |

### `state/`

| Rule                                | Link                                                            |
| ----------------------------------- | --------------------------------------------------------------- |
| Status unions + loading/empty/error | [`error-handling.mdc`](../rules/state/error-handling.mdc)       |
| Query vs RHF vs Zustand + effects   | [`data-ownership.mdc`](../rules/state/data-ownership.mdc)       |
| Pending vs fetching, races          | [`async-ui.mdc`](../rules/state/async-ui.mdc)                   |
| Offline & reconnect                 | [`offline-reconnect.mdc`](../rules/state/offline-reconnect.mdc) |

### `pages/`

| Rule                                     | Link                                                          |
| ---------------------------------------- | ------------------------------------------------------------- |
| Split large routes                       | [`page-composition.mdc`](../rules/pages/page-composition.mdc) |
| AppPageShell, rhythm, responsive, mobile | [`page-layout.mdc`](../rules/pages/page-layout.mdc)           |

### `ui/`

| Rule                                     | Link                                                           |
| ---------------------------------------- | -------------------------------------------------------------- |
| Tokens, shadcn, ThemeProvider, dark mode | [`design-tokens.mdc`](../rules/ui/design-tokens.mdc)           |
| Icons & assets                           | [`icons-and-assets.mdc`](../rules/ui/icons-and-assets.mdc)     |
| Motion, feedback                         | [`interaction-polish.mdc`](../rules/ui/interaction-polish.mdc) |
| Layout skeletons (Boneyard)              | [`boneyard-skeletons.mdc`](../rules/ui/boneyard-skeletons.mdc) |
| Delight (optional)                       | [`delight-ux.mdc`](../rules/ui/delight-ux.mdc)                 |
| Route lazy loading                       | [`performance.mdc`](../rules/ui/performance.mdc)               |

### `forms/`

| Rule                            | Link                                                          |
| ------------------------------- | ------------------------------------------------------------- |
| Drafts, blockers, autosave      | [`forms-and-drafts.mdc`](../rules/forms/forms-and-drafts.mdc) |
| Labels, skip link, live regions | [`accessibility.mdc`](../rules/forms/accessibility.mdc)       |

### `copy/`

| Rule                        | Link                                                     |
| --------------------------- | -------------------------------------------------------- |
| In-app labels, errors, CTAs | [`ui-microcopy.mdc`](../rules/copy/ui-microcopy.mdc)     |
| Landing, hero, marketing    | [`marketing-copy.mdc`](../rules/copy/marketing-copy.mdc) |

### `security/`

| Rule            | Link                                                                                                                       |
| --------------- | -------------------------------------------------------------------------------------------------------------------------- |
| Auth gates (UX) | [`route-protection.mdc`](../rules/security/route-protection.mdc)                                                           |
| Permissions UX  | [`frontend-security.mdc`](../rules/security/frontend-security.mdc) — loads on guards, providers, stores, `api/features/**` |

### `testing/`

| Rule                | Link                                                        |
| ------------------- | ----------------------------------------------------------- |
| Vitest file mapping | [`vitest-testing.mdc`](../rules/testing/vitest-testing.mdc) |

## Docs (examples, not rules)

| Doc                                                        | Contents                                                      |
| ---------------------------------------------------------- | ------------------------------------------------------------- |
| [API response samples](../../docs/api-response-samples.md) | Wire vs interceptor, `ApiRequestError`, form vs toast routing |
| [Incident log](../../docs/incident-log.md)                 | Track repeated AI mistakes; promote to rules after 3×         |

## Workflows (pointers only)

**New page or feature** — read in order:

1. [`api/api-layer.mdc`](../rules/api/api-layer.mdc) + [`api/zod-validation.mdc`](../rules/api/zod-validation.mdc)
2. [`state/error-handling.mdc`](../rules/state/error-handling.mdc) + [`state/data-ownership.mdc`](../rules/state/data-ownership.mdc)
3. [`pages/page-composition.mdc`](../rules/pages/page-composition.mdc) + [`pages/page-layout.mdc`](../rules/pages/page-layout.mdc)
4. Forms → [`forms/forms-and-drafts.mdc`](../rules/forms/forms-and-drafts.mdc) + [`api/api-error-routing.mdc`](../rules/api/api-error-routing.mdc) + [`copy/ui-microcopy.mdc`](../rules/copy/ui-microcopy.mdc)
5. [`testing/vitest-testing.mdc`](../rules/testing/vitest-testing.mdc) → `pnpm verify`

Error envelope examples → [`docs/api-response-samples.md`](../../docs/api-response-samples.md).

**UI / merge review** → [`merge-readiness-check`](./merge-readiness-check/SKILL.md) (§8 rules table + Impeccable gate).

## OpenSpec planning ladder (multi-repo / plans root)

This **code** repo owns merge-readiness per package; **commit** and **PR** skills live at the repository root (`.cursor/skills/`).

Cross-repo planning lives in the **plans** OpenSpec root (sibling `*-plans` or monorepo root with `openspec/`):

```text
/opsx-explore → /opsx-propose → /opsx-review-proposal → /opsx-apply → /opsx-verify → /opsx-pr → /opsx-archive
```

- After apply, prefer **`/opsx-verify`** from the plans root (orchestrates this repo’s `pnpm verify` + `@merge-readiness-check`).
- Standalone here: `@merge-readiness-check` / `@commit-changes` / `@create-pull-request`.
- Kit install/sync: `Templates/openspec-kit/sync.sh` or `install.sh`.

## Related skills

| Task          | Skill                                                                            |
| ------------- | -------------------------------------------------------------------------------- |
| Commit        | [`commit-changes`](../../../../.cursor/skills/commit-changes/SKILL.md)           |
| PR            | [`create-pull-request`](../../../../.cursor/skills/create-pull-request/SKILL.md) |
| Merge ready?  | [`merge-readiness-check`](./merge-readiness-check/SKILL.md)                      |
| AI slop check | [`ai-slop-check`](./ai-slop-check/SKILL.md)                                      |
| shadcn UI     | [`shadcn`](./shadcn/SKILL.md)                                                    |
| Optimistic UI | [`optimistic-ui`](./optimistic-ui/SKILL.md)                                      |
