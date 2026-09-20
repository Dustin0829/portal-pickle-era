## Context

Screenshots show portal sidebar yellow pills and Admin Settings underline tabs feeling mis-padded vs Admin Dashboard. Separately, main content left/right gutters differ because pages override `AppPageShell width="full"` with mixed `max-w-*`. Player Food lacks cart remove and still shows uneven images in practice. Booking pay (`PaymentMethodCarousel` in `BookingModal`) and Wallet top-up cycle methods with Previous/Next while already showing QR — product wants **pick method first** (labels from Admin Settings payment methods), then QR/details.

**In scope:** `web`. Cite `app/.cursor/skills/SKILL.md` → `pages/page-layout.mdc`, `pages/page-composition.mdc`, `ui/icons-and-assets.mdc`, `forms/`, `testing/vitest-testing.mdc`.

## Goals / Non-Goals

**Goals:**
- One sidebar nav density for player + admin matching Dashboard reference
- Settings (and sibling in-page tablists) padding/gap/type aligned to that density
- One Dashboard content gutter: `max-w-5xl` + `appContentPaddingClass`
- Your order remove-per-line; equal menu + cart food image boxes
- Booking pay + wallet top-up: select payment method → then QR/account details
- Size tweaks only as needed for visual balance

**Non-Goals:**
- API / OpenAPI / new food or payment endpoints
- Marketing nav
- Changing Settings tab IA or payment-method CRUD fields
- Replacing Settings underline with pills
- List-container / avatar prior change
- Forcing Profile into `max-w-5xl` (padding token still required)
- Admin Food menu CMS redesign
- Keeping prev/next carousel as primary discovery (may remove or demote)

## Decisions

1. **Single source — `PortalChrome` SidebarNav** (`app/src/components/portal/PortalChrome.tsx`)  
   Adjust desktop + mobile drawer NavLink classes once.

2. **Density tokens** — compact uppercase `text-[11px]`, `px-3`–`px-3.5`, `py-2`–`py-2.5`, `rounded-xl` yellow active pill; min `py-2`.

3. **Settings / in-page tabs** — keep underline; align px/py/gap/type; preserve ARIA.

4. **Content gutter = Dashboard shell** — add `wide: "max-w-5xl"`; sweep Settings/Bookings/Top-ups/Food/Wallet off divergent max-widths; Profile MAY stay `max-w-3xl`.

5. **Food cart remove** — trash/X → `setQty(id, 0)`; no confirm.

6. **Equal food images** — menu `aspect-[4/3]` + overflow + cover; cart fixed square + cover; placeholders same box.

7. **Pay method select-then-details** (`PaymentMethodCarousel` → picker + detail, or replace component)  
   - **Chooser:** list/buttons of `FacilityPaymentMethod.label` from `usePaymentMethods()` / store.  
   - **Details:** existing QR / name / number / copy / amount hint for `selectedId`.  
   - **Change method:** control returns to chooser; clear selection (keep booking modal step = pay).  
   - **Single method:** MAY auto-select and show details.  
   - **BookingModal** + **WalletPage** both use the shared component so UX matches.  
   - Remove or hide Previous/Next carousel chrome as primary UX.  
   **Rejected:** Keep carousel-only (doesn’t match “pili muna” request).

8. **Tests** — Settings tabs; gutter token; Food remove + image boxes; booking/wallet: with ≥2 methods, chooser before QR; select shows that method’s label (`testing/vitest-testing.mdc`).

## Risks / Trade-offs

- [Extra click vs carousel] → Intentional clarity for multi-method facilities  
- [Wallet + booking drift] → Shared component required  
- [Food cramped at 5xl] → Accept Dashboard parity  
- [Accidental cart remove] → One-click OK for draft cart  

## Migration Plan

1. Width token + page sweep; PortalChrome; Settings tabs.  
2. Food remove + equal images.  
3. Replace carousel-primary pay UI with select → details (booking + wallet).  
4. Vitest + `pnpm verify`.  
5. One PR; rollback = revert.

## Open Questions

- None blocking. Assumptions: single method may skip chooser; wallet matches booking; Profile stays optional-narrow.
