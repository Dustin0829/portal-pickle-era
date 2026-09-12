# Styling & Customization

See [customization.md](../customization.md) for theming, CSS variables, and adding custom colors.

## Contents

- Semantic colors
- No arbitrary Tailwind values
- Built-in variants first
- className for layout only
- No space-x-_ / space-y-_
- Prefer size-_ over w-_ h-\* when equal
- Prefer truncate shorthand
- No manual dark: color overrides
- Use cn() for conditional classes
- No manual z-index on overlay components

Project rule: [design-tokens.mdc](../../../rules/ui/design-tokens.mdc) — full token table and checklist.

---

## Semantic colors

**Incorrect:**

```tsx
<div className="bg-blue-500 text-white">
  <p className="text-gray-600">Secondary text</p>
</div>
```

**Correct:**

```tsx
<div className="bg-primary text-primary-foreground">
  <p className="text-muted-foreground">Secondary text</p>
</div>
```

---

## No raw color values for status/state indicators

For positive, negative, or status indicators, use Badge variants, semantic tokens like `text-destructive`, or define custom CSS variables — don't reach for raw Tailwind colors.

**Incorrect:**

```tsx
<span className="text-emerald-600">+20.1%</span>
<span className="text-green-500">Active</span>
<span className="text-red-600">-3.2%</span>
```

**Correct:**

```tsx
<Badge variant="secondary">+20.1%</Badge>
<Badge>Active</Badge>
<span className="text-destructive">-3.2%</span>
```

If you need a success/positive color that doesn't exist as a semantic token, use `text-success` / `bg-success/10` after defining `--success` in `index.css` (`design-tokens.mdc`) — or a Badge variant. Never use `emerald-*` / `green-*` for status.

---

## No arbitrary Tailwind values

Use the **design scale** and **semantic tokens** — not one-off bracket classes. Required for dark mode and rebranding ([design-tokens.mdc](../../../rules/ui/design-tokens.mdc)).

**Incorrect:**

```tsx
<p className="text-[13px] text-[#6b7280]">Label</p>
<div className="rounded-[10px] bg-[#f4f4f5] p-[14px]">...</div>
<span className="text-gray-500">Muted</span>
```

**Correct:**

```tsx
<p className="text-sm text-muted-foreground">Label</p>
<div className="rounded-lg bg-muted p-4">...</div>
<span className="text-muted-foreground">Muted</span>
```

| Instead of                            | Use                                                 |
| ------------------------------------- | --------------------------------------------------- |
| `text-[13px]`, `text-[0.8125rem]`     | `text-xs` or `text-sm` (nearest step)               |
| `p-[18px]`, `gap-[11px]`              | `p-4`, `gap-3`, etc.                                |
| `rounded-[10px]`                      | `rounded-md`, `rounded-lg`                          |
| `bg-[#…]`, `text-gray-*`, `bg-zinc-*` | `bg-card`, `text-muted-foreground`, `border-border` |
| `bg-white dark:bg-gray-950`           | `bg-background`                                     |

**Never** use arbitrary values for **colors** or **font sizes**. Add a CSS variable in `src/index.css` when the theme needs a new role.

---

## Built-in variants first

**Incorrect:**

```tsx
<Button className="border border-input bg-transparent hover:bg-accent">
  Click me
</Button>
```

**Correct:**

```tsx
<Button variant="outline">Click me</Button>
```

---

## className for layout only

Use `className` for layout (e.g. `max-w-md`, `mx-auto`, `mt-4`), **not** for overriding component colors or typography. To change colors, use semantic tokens, built-in variants, or CSS variables.

**Incorrect:**

```tsx
<Card className="bg-blue-100 text-blue-900 font-bold">
  <CardContent>Dashboard</CardContent>
</Card>
```

**Correct:**

```tsx
<Card className="max-w-md mx-auto">
  <CardContent>Dashboard</CardContent>
</Card>
```

To customize a component's appearance, prefer these approaches in order:

1. **Built-in variants** — `variant="outline"`, `variant="destructive"`, etc.
2. **Semantic color tokens** — `bg-primary`, `text-muted-foreground`.
3. **CSS variables** — define custom colors in the global CSS file (see [customization.md](../customization.md)).

---

## No space-x-_ / space-y-_

Use `gap-*` instead. `space-y-4` → `flex flex-col gap-4`. `space-x-2` → `flex gap-2`.

```tsx
<div className="flex flex-col gap-4">
  <Input />
  <Input />
  <Button>Submit</Button>
</div>
```

---

## Prefer size-_ over w-_ h-\* when equal

`size-10` not `w-10 h-10`. Applies to icons, avatars, skeletons, etc.

---

## Prefer truncate shorthand

`truncate` not `overflow-hidden text-ellipsis whitespace-nowrap`.

---

## No manual dark: color overrides

Use semantic tokens — they handle light/dark via CSS variables. `bg-background text-foreground` not `bg-white dark:bg-gray-950`.

---

## Use cn() for conditional classes

Use the `cn()` utility from the project for conditional or merged class names. Don't write manual ternaries in className strings.

**Incorrect:**

```tsx
<div className={`flex items-center ${isActive ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
```

**Correct:**

```tsx
import { cn } from "@/lib/utils"

<div className={cn("flex items-center", isActive ? "bg-primary text-primary-foreground" : "bg-muted")}>
```

---

## No manual z-index on overlay components

`Dialog`, `Sheet`, `Drawer`, `AlertDialog`, `DropdownMenu`, `Popover`, `Tooltip`, `HoverCard` handle their own stacking. Never add `z-50` or `z-[999]`.
