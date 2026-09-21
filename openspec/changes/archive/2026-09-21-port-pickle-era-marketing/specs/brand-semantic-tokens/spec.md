## Purpose

Follow-up after the marketing port: unify Pickle Era brand colors and typography with the product shadcn / semantic token system (`design-tokens.mdc`). **Not implemented by the `port-pickle-era-marketing` apply** — the port keeps parallel brand `@theme` classes for visual parity; a later change fulfills these requirements.

## ADDED Requirements

### Requirement: Brand colors as semantic tokens

Pickle Era brand colors (black, blue, green, yellow, maroon, and related surfaces/text) MUST be expressed as CSS variables in `src/index.css` (`:root` / `.dark` as needed) and wired through `@theme inline` / semantic Tailwind classes consistent with the shadcn token model. Marketing and auth UI MUST use those semantic classes instead of parallel one-off brand palette utilities where a semantic mapping exists.

#### Scenario: Primary brand accent via tokens
- **WHEN** a marketing CTA uses the brand yellow accent after token unification
- **THEN** it uses a semantic token-backed class (for example primary or a documented brand alias), not a disconnected hard-coded hex in component markup

#### Scenario: Theme coexistence
- **WHEN** brand tokens are unified
- **THEN** existing shadcn components in the app shell still resolve through the same token file without a second conflicting color system

### Requirement: Brand typography via theme

Display / wordmark / body font families used by Pickle Era MUST be registered on the theme (CSS variables + Tailwind font tokens) so marketing typography uses theme font classes rather than ad-hoc font stacks scattered outside the theme.

#### Scenario: Display heading uses theme font
- **WHEN** a marketing display heading renders after token unification
- **THEN** its font family comes from the theme token (for example `font-display`), not an undeclared inline font family
