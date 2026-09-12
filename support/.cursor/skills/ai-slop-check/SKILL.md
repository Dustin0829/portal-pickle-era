---
name: ai-slop-check
description: >-
  Audits UI and marketing pages for AI-generated design tells (gradients,
  side-tab cards, glassmorphism, hero eyebrows, nested cards) and AI slop in
  UI copy (em dashes, buzzwords, filler CTAs, vague errors, redundant labels).
  Use when the user says "AI slop check", "check for AI slop", "review pages
  for AI slop elements", or wants a todo list to de-genericize frontend UI.
disable-model-invocation: true
---

# AI slop check

Find **AI slop** (recognizable generated-UI tells) and **general quality** issues (contrast, spacing, a11y). Produce a **findings report** and a **prioritized todo list**. Do not auto-fix unless the user asks.

**Authoring vs audit:** When **writing** new strings, follow [`.cursor/rules/copy/ui-microcopy.mdc`](../../rules/copy/ui-microcopy.mdc) and [`.cursor/rules/copy/marketing-copy.mdc`](../../rules/copy/marketing-copy.mdc). This skill is for **review** — catalog IDs, severity, and todo output.

**Canonical home:** this folder in `app`. Copy `.cursor/skills/ai-slop-check/` into other frontend repos; add project-specific `exceptions.md` (or a named override like `burn-radar.md`). Do **not** install under `~/.cursor/skills/`.

## Triggers

Apply when the user says any of:

- `AI slop check`
- `Check my current UI for AI slop`
- `Review pages for AI slop`
- `De-slop this page / component`
- `Does this look like AI generated UI?`

## Scope

| User intent                     | What to review                                  |
| ------------------------------- | ----------------------------------------------- |
| Current file / selection        | That file + imported children                   |
| Named page or route             | Page component + layout + copy in that flow     |
| `src/pages/`, `src/components/` | App pages, shells, marketing if in repo         |
| Marketing site                  | Landing/marketing components (separate repo OK) |
| Whole project                   | Renderer/UI first; skip unrelated backend       |

Ask once if scope is ambiguous. Default: **files the user has open** or **most recently edited page**.

## Workflow

1. **Read project context** (if present):
   - [exceptions.md](exceptions.md) in this skill folder (edit per project after copying)
   - `docs/design.md`, `DESIGN.md`, design tokens, `tailwind.config`, brand guidelines
   - [`.cursor/rules/copy/`](../../rules/copy/) when reviewing in-app or marketing strings
2. **Read the rule catalog:** [catalog.md](catalog.md) — AI slop + quality rules
3. **Inspect UI** — TSX/CSS, class names, copy strings, motion, typography, layout
4. **Apply [exceptions.md](exceptions.md)** — do not flag intentional product choices
5. **Write the report** (template below)
6. **Emit todo list** — actionable, ordered P0 → P2, with file paths

Optional: after slop check, mention [merge-readiness-check](../merge-readiness-check/SKILL.md) for rules + Impeccable gate on touched UI.

## Severity

| Level  | Label               | Meaning                                           |
| ------ | ------------------- | ------------------------------------------------- |
| **P0** | Slop — ship blocker | Instant “AI generated” tell; undermines trust     |
| **P1** | Slop or quality     | Noticeable; fix before launch/marketing           |
| **P2** | Polish              | Quality rule or mild tell; fix when touching area |
| **OK** | Intentional         | Matches design system — document why              |

## Report template

Use this structure every time:

```markdown
# AI slop review — [scope]

**Summary:** [N] P0 · [N] P1 · [N] P2 · [N] OK intentional

## Top issues (fix first)

1. [One-line highest-impact finding]
2. …

## Findings

| Pri | Rule ID | Pattern | Location    | Problem | Recommended fix |
| --- | ------- | ------- | ----------- | ------- | --------------- |
| P0  | …       | …       | `path:line` | …       | …               |

## Todo list

- [ ] **P0** — [Specific fix] (`path`)
- [ ] **P1** — …

## Intentional (not slop)

- …

## Not reviewed

- …
```

## Quick specimen map

Eleven common “synthetic slop” page archetypes → catalog IDs:

| Specimen                    | Catalog focus                                                                                |
| --------------------------- | -------------------------------------------------------------------------------------------- |
| Purple Gradients Everywhere | `slop-ai-palette`, `slop-gradient-text`, `slop-dark-glow`                                    |
| Lazy "Cool"                 | `slop-glassmorphism`, `slop-dark-glow`, `slop-hairline-wide-shadow`                          |
| Lazy "Impact"               | `slop-bounce-easing`, `slop-gradient-text`, `slop-image-hover-transform`                     |
| Side-Tab Cards              | `slop-side-tab-border`, `slop-border-accent-rounded`                                         |
| Cardocalypse                | `slop-nested-cards`                                                                          |
| Copy-Paste Layouts          | `slop-identical-card-grid`, `slop-hero-metrics`, `slop-section-kicker`                       |
| Inter Everywhere            | `slop-overused-font`, `slop-single-font`, `slop-flat-type-hierarchy`                         |
| Massive Icons               | `slop-icon-tile-above-heading`                                                               |
| Bad Contrast Choices        | `quality-gray-on-color`, `quality-low-contrast`                                              |
| Redundant UX Writing        | `quality-redundant-ux-copy`, `slop-label-echo`                                               |
| AI UI copy (microcopy)      | `slop-em-dash-ui`, `slop-filler-cta`, `slop-vague-error`, … — see [UI copy](#ui-copy-checks) |
| Modal Abuse                 | Flag in review — complex multi-column settings in `Dialog`                                   |

Full rules: [catalog.md](catalog.md). Sample output: [examples.md](examples.md).

## Review heuristics (code)

When scanning TSX/Tailwind/CSS, grep and inspect for:

- `gradient`, `from-violet`, `from-purple`, `to-blue`, `bg-clip-text`, `text-transparent`
- `backdrop-blur`, `glass`, heavy `shadow-*` + `border` together
- `border-l-4`, `border-l-primary`, thick one-side borders on `rounded-*` cards
- `rounded-3xl` / `rounded-[2rem]` on small cards
- `animate-bounce`, `spring`, elastic easing, gratuitous `transition-all`
- Repeated `Card` > `Card` nesting
- `uppercase tracking-widest` eyebrows above every `h1`/`h2`
- `text-5xl`/`text-6xl` on long hero sentences
- Icon in `rounded-lg` box stacked above feature title (grid of 3–6 identical cards)
- `Inter`, `Geist`, `Space Grotesk`, `Instrument Serif` without design-system justification
- Marketing strings: _streamline_, _empower_, _supercharge_, _world-class_, _enterprise-grade_
- UI microcopy: em dashes (`—`), ellipses on static buttons, _Oops_, _Something went wrong_, _Get started_, _Learn more_, _Simply_, _Seamlessly_
- Settings / multi-step flows crammed into `Dialog` with scroll

## UI copy checks

Scan **strings in TSX** (labels, placeholders, toasts, empty states, errors, button text) — not just marketing pages. Full catalog IDs in [catalog.md](catalog.md) § UI copy.

| Pattern                  | Rule ID                                        | Flag when                                                                                              |
| ------------------------ | ---------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| Em dash in UI            | `slop-em-dash-ui`                              | Any em dash (`—`) in button, label, toast, or short helper (marketing: >2 per screen → `slop-em-dash`) |
| Buzzword / hype verb     | `slop-buzzword`, `slop-hype-verb`              | streamline, empower, seamless, leverage, unlock, dive into, supercharge                                |
| Filler CTA               | `slop-filler-cta`                              | "Get started", "Explore", "Discover", "Learn more" with no specific object                             |
| Click-here phrasing      | `slop-click-here`                              | "Click here to…", "Tap below to…"                                                                      |
| Vague error              | `slop-vague-error`                             | "Oops!", "Something went wrong" with no next step or error code                                        |
| Cheerleading empty state | `slop-empty-poetry`                            | Metaphor or pep talk instead of what to do next                                                        |
| Apologetic tone          | `slop-sorry-wall`                              | "We're sorry", "Unfortunately" on routine validation                                                   |
| Ellipsis abuse           | `slop-ellipsis-ui`                             | "Save…" / "Loading…" on buttons that are not pending                                                   |
| Exclamation spam         | `slop-exclamation-ui`                          | Multiple `!` in labels, toasts, or empty states                                                        |
| Title Case Everything    | `slop-title-case-ui`                           | Sentence case violated on body helpers and descriptions                                                |
| Anthropomorphism         | `slop-anthropomorphic`                         | "Your data is happy", "We couldn't find your friend"                                                   |
| Redundant label echo     | `slop-label-echo`, `quality-redundant-ux-copy` | Label + description + placeholder repeat the same words                                                |
| Aphorism / theater       | `slop-aphorism`, `slop-theater`                | "Not X. Y." cadence; dismissive "theater" framing                                                      |

**Prefer:** sentence case, verb-first buttons (`Save draft`, `Upload file`), concrete errors (`Couldn't save. Check your connection.`), one idea per control.

Day-to-day authoring rules: [`.cursor/rules/copy/ui-microcopy.mdc`](../../rules/copy/ui-microcopy.mdc), [`.cursor/rules/copy/marketing-copy.mdc`](../../rules/copy/marketing-copy.mdc).

Flag **marketing slop** on landing pages per `slop-buzzword`, `slop-em-dash`, `slop-aphorism`, `slop-theater` in [catalog.md](catalog.md).

Prefer **specific, operational copy** over generic SaaS marketing.

## Output rules

- Cite **file paths** (and line numbers when useful)
- Todos must be **specific** (“Remove `border-l-4` from `StatCard`; use `border border-border`”) not vague (“improve cards”)
- Separate **AI slop** from **quality** (contrast, line length, heading skip)
- If clean: say so — list what you checked and **residual risks**

## Project overrides

After copying this folder into a product repo, edit [exceptions.md](exceptions.md) or add a named file (e.g. `burn-radar.md`) and reference it from that repo’s copy of this skill.

| Repo               | Also read                                                             |
| ------------------ | --------------------------------------------------------------------- |
| burn-radar-desktop | `burn-radar.md`, `docs/design.md`, `design-review` skill in that repo |
