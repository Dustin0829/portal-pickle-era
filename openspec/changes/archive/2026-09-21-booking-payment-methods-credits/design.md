## Context

Today: single `PaymentSettings` in `facilitySettingsStore` + hard-coded `PAYMENT` in BookingModal; fake SVG QR from account number. Wallet auto-applies for any authenticated booker. Product wants: many cash channels with real QR uploads + prev/next; portal-only explicit **Pay with credits** with partial apply.

**In scope:** `web`. Cite `app/.cursor/skills/SKILL.md` → `pages/`, `ui/`, `state/`, `api/` (uploads), `testing/vitest-testing.mdc`.

## Goals / Non-Goals

**Goals:**
- `paymentMethods[]` in facility settings (migrate from single `payment`)
- Admin CRUD + QR upload (data URL or upload key+preview)
- Booking pay carousel Previous/Next
- Portal `allowCreditsPay` + explicit credits toggle; partial wallet + cash

**Non-Goals:**
- API-persisted facility payment catalog (v1 stays local persist like prices)
- Changing debit-on-approve wallet rules
- Food counter/wallet redesign

## Decisions

1. **Storage** — Extend Zustand persist: `paymentMethods: Array<{ id, label, name, number, qrImageDataUrl: string | null }>`. On load, if only legacy `payment` exists, seed one method from it. Keep `payment` mirror of methods[0] for any old callers or remove after grep.

2. **QR** — Admin file input → `FileReader` readAsDataURL (JPEG/PNG/WebP, size-guard). Display `<img>` when set; else existing generated `PaymentQr` from `number`. Avoid requiring public receipt URLs for facility settings.

3. **Carousel** — Local index state on pay step; wrap prev/next. Hide arrows when `methods.length <= 1`.

4. **Credits** — `openBookingModal(plan, preset?, { allowCreditsPay: true })` from Overview/Bookings/Calendar only. State `payMethod: 'cash' | 'credits'` default `cash`. Apply `walletAppliedAndRemaining` only when `credits`. Marketing never passes the flag.

5. **Amount due** — Show remaining cash pesos on QR instruction and submit button (already dynamic).

6. **Wallet top-up page** — Reuse the same `paymentMethods` list + prev/next (or shared PaymentMethodPicker component) so top-up QR matches booking pay channels.

## Risks / Trade-offs

- [Large QR data URLs in localStorage] → Enforce max dimension/size; show error if too large
- [Empty methods list] → Fall back to `PAYMENT` constant
- [Auto-apply regression] → Marketing must send `walletAppliedCents: 0`
- [Wallet page still single payment] → Update to shared methods list in same change

## Migration Plan

1. Web-only; seed methods from existing payment on first read.
2. Rollback: revert PR; users may keep expanded localStorage key.

## Open Questions

- None blocking (QR as data URL; portal-only credits; partial allowed).
