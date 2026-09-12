# AI slop check — examples

See [SKILL.md](SKILL.md).

## Example invocation

> AI slop check on `HomePage.tsx` and `AppPageShell.tsx`

## Example finding row

| Pri | Rule ID                | Pattern         | Location                | Problem                                          | Recommended fix                                      |
| --- | ---------------------- | --------------- | ----------------------- | ------------------------------------------------ | ---------------------------------------------------- |
| P0  | `slop-side-tab-border` | Side-tab accent | `StatBlock.tsx:42`      | `border-l-4 border-primary` on `rounded-lg` card | Use `border border-border bg-card` per design system |
| P1  | `slop-em-dash-ui`      | Em dash in UI   | `SaveDialog.tsx:28`     | Button label `Save changes — confirm`            | `Save changes` or split into title + body            |
| P1  | `slop-vague-error`     | Vague error     | `api-error-toast.ts:12` | Toast: "Oops! Something went wrong"              | `Couldn’t save draft. Retry or copy error ID.`       |
| P2  | `slop-filler-cta`      | Generic CTA     | `EmptyProjects.tsx:9`   | Primary button "Get started" on empty list       | `Create project`                                     |

## Example todo list

```markdown
- [ ] **P0** — Remove side-tab `border-l-4` from stat cards; use uniform border (`src/components/StatBlock.tsx`)
- [ ] **P1** — Replace 3-column icon feature grid with a table or single summary row (`HomePage.tsx`)
- [ ] **P1** — Shorten hero-style `text-5xl` page title to `text-2xl` semibold (`ProjectsPage.tsx`)
- [ ] **P1** — Replace vague error toast with action + cause (`src/lib/api-error-toast.ts`)
- [ ] **P2** — Remove em dash from dialog primary button (`SaveDialog.tsx`)
- [ ] **P2** — Reduce em dashes in onboarding copy (`WelcomeStep.tsx`)
```

## Example clean report snippet

```markdown
# AI slop review — DataTable + list page

**Summary:** 0 P0 · 0 P1 · 1 P2 · 4 OK intentional

## Intentional (not slop)

- Single font family with clear `text-sm` / semibold heading steps (`exceptions.md`)
- Table-driven list — not identical card grid
- Bordered panels without glassmorphism

## Todo list

- [ ] **P2** — Tighten redundant helper under date field (same text as label)
```
