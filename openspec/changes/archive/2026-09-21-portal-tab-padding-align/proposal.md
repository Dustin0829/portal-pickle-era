## Why

Portal chrome feels inconsistent: sidebar/tab density doesn’t match Admin Dashboard, and main content left/right gutters also differ by page because shells use mixed `max-w-*` overrides. On the player Food tab, cart lines lack a clear remove control, and menu/cart food photos still look uneven. On booking (and wallet) pay, the modal jumps straight into a **carousel** of QR/account details — players should **pick a payment method first** (GCash, Maya, BDO, or whatever Admin Settings configured) before seeing that method’s QR and bank details.

## What Changes

- Align **sidebar nav item** padding, gap, type size, and active yellow pill sizing to the Admin Dashboard reference (via shared `PortalChrome`) for **player and admin**
- Align **in-page tablists** (Admin Settings section tabs; any equivalent player/admin underline or pill tab bars that diverge) to the same density tokens
- Unify **portal main content** left/right spacing to the Dashboard shell: shared horizontal padding token + Dashboard content max-width (`max-w-5xl`)
- Player Food **Your order** cart: add a **remove** control per line
- Player Food **menu + cart thumbnails**: enforce one fixed image box size (`object-cover`)
- Booking pay (and wallet top-up using the same methods UI): **select payment method first**, then show QR + account details for the chosen method (replace prev/next carousel as the primary way to discover methods)
- No route/API schema changes beyond existing facility payment methods data

## Capabilities

### New Capabilities

- `portal-tab-density`: Shared visual density rules for portal sidebar nav items and in-page tablists on player + admin shells
- `portal-content-gutter`: Uniform left/right content gutter and max-width matching Admin Dashboard across player + admin portal pages
- `food-cart-remove-equal-images`: Your order remove control + equal-sized menu/cart food images on the player Food tab
- `booking-pay-method-select`: Pick facility payment method before QR/details in booking pay (and matching wallet top-up UI)

### Modified Capabilities

- (none — main `openspec/specs/` empty; behavior supersedes carousel-first UX from shipped `booking-payment-methods-credits` change)

## Impact

- **In scope:** `web`, `plans`
- **Out of scope:** `api`, `support`; marketing site nav; changing yellow brand color; redesigning Settings content cards; list-container/avatar prior change; admin payment-methods CMS fields beyond what’s needed to list labels for selection; new payment processors
- **Must not break:** Sidebar navigation; Settings tabs/ARIA; Food place-order / qty steppers / active orders; booking submit proof; existing payment method CRUD in Admin Settings
- Branch: `feat/portal-tab-padding-align`
- **Assumption:** Dashboard shell = `max-w-5xl` + `px-4 sm:px-6`; Settings underline tabs kept; Profile MAY stay narrower; cart remove = qty 0; pay flow shows a method list (or chips) then details for the selection — optional “Change method” returns to the list (no prev/next carousel required)
