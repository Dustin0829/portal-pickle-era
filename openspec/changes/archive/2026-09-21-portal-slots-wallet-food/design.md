## Context

Court rental uses hourly slots (`06:00`–`21:00`); Open Play uses 2-hour session windows (`07:00`, `16:00`, `18:00`) with shared capacity (30). API `createBookingRow` enforces open-play capacity vs court exclusivity but does **not** cross-block expanded hours. Wallet Phase 2 supports top-up + balance only—no spend on bookings. Food was drafted as `player-food-orders` (stub menu, no admin CMS) but never applied—student nav has no Food tab.

**Rule cites:** `backend/.cursor/rules/core/module-boundaries.mdc`, `data/database.mdc`, `data/concurrency.mdc`, `api/http-api.mdc`, `api/role-based-access.mdc`; `app/.cursor/skills/SKILL.md` → `api/api-layer.mdc`, `pages/page-layout.mdc`, `state/async-ui.mdc`, `security/route-protection.mdc`, `forms/forms-and-drafts.mdc`, `copy/ui-microcopy.mdc`.

## Goals / Non-Goals

**Goals:**
- Mutual block: Open Play session ↔ covered court hours (facility-wide)
- Portal booking: apply wallet (partial or full); show remaining GCash
- Food tab + admin menu CRUD (incl. **photos**) in Settings + admin order inbox

**Non-Goals:**
- Changing Open Play to hourly UI (sessions stay; expansion is internal)
- Clinic-specific product rules beyond shared hour helper
- Auto GCash for food; tips; kitchen printers
- Multi-photo galleries / AI image generation
- Wallet refund on booking/food cancel (manual ops)
- Implementing the old `player-food-orders` change as a separate PR

## Decisions

1. **Hour expansion helper** — Shared pure function: Open Play slot `{ hour, durationHours? }` → list of `HH:00` ids. Default duration 2. Used by API conflict checks and web UI disabled state. Keep session ids as today (`07:00` = session start).

2. **Facility-wide cross-plan block** — Any pending/approved Open Play for a session blocks those hours on **all** courts for that date. Any court/clinic booking on an hour blocks Open Play sessions covering that hour for that date. Open Play capacity (30) still applies among open-play rows.

3. **Wallet debit timing for bookings** — Marketing/`BookingModal` still uses `POST /bookings`. When the request has a session, accept optional `walletAppliedCents` (server clamps to `min(balance, total)`). **Do not debit on create** while status is `pending` (avoids refunds if rejected). Persist intended `walletAppliedCents` on the booking. **Debit in the same transaction as admin approve** (conditional balance update). Admin walk-in create (already `approved`) debits in the create transaction. Guest (no session) cannot send wallet apply.

4. **Amounts** — Store cents; UI pesos. Persist `walletAppliedCents` on Booking (new column). Remaining cash due = `totalCents - walletAppliedCents` (require GCash receipt fields when remaining > 0, same as today).

5. **Food data** — Prisma `FoodMenuItem` (name, priceCents, available, optional `imageKey` / mime) + `FoodOrder` + `FoodOrderLine` (snapshot name/price; photo not required on lines). Admin Settings: CRUD + upload via existing `POST /uploads/presign` (jpeg/png/webp) then store key. Student menu: available items + short-lived image URL from download helper (same pattern as booking receipts). Placeholder when no key. Status machine `pending` → `preparing` → `ready`.

6. **Supersede draft** — Do not apply `openspec/changes/player-food-orders`; this change owns Food. After archive of this change, delete or archive that draft.

7. **Ship** — Branch `feat/portal-slots-wallet-food`; one monorepo PR. Deploy API then web.

## Risks / Trade-offs

- [S3 unset in env] → Menu still works; photo upload soft-fails with clear admin message (same as receipts)
- [Balance spent between create and approve] → Approve fails cleanly; player can rebook or top up
- [Open Play duration misconfigured] → Default 2h; Settings UI shows covered hours preview
- [Double-spend wallet] → Conditional `updateMany` where balance ≥ apply amount
- [Partial pay without receipt] → If remaining > 0, require GCash receipt fields as today
- [Large umbrella PR] → Tasks ordered slots → wallet book → food; mid-apply verify_fast per package
- [Open-play capacity regression] → Capacity-30 checks remain; cross-block is additive

## Migration Plan

1. Migrate: Booking.walletAppliedCents; FoodMenuItem/Order/Line
2. Deploy API with overlap + debit + food routes
3. Deploy web modals, Food tab, Settings menu, admin inbox
4. Seed a few menu items if empty
5. Rollback: feature-flag UI off; leave tables

## Open Questions

- None blocking — clinic uses hourly ids and shares the cross-block helper
