## Context

Player My bookings detail only renders `receiptDataUrl` (always unset from API map). Player Wallet lists top-ups with filename text only—no signed preview. Admin booking/top-up inboxes already fetch admin receipt-url when `receiptKey` is set. Marketing `BookingModal` calls `createPublicBooking` directly, skipping `useCreatePublicBooking` invalidation (`myBookings`, occupancy, admin bookings). Player wallet top-up create already uses `useCreateMeWalletTopUp` (invalidate me-wallet). Bucket CORS for `www.pickleera.co` was fixed separately and is out of scope.

**kit.repos:** `api`, `web`, `plans` (not `support`).

Cite (do not paste): `backend/.cursor/skills/SKILL.md` → `api/http-api.mdc`, `api/response-contracts.mdc`, `integrations/file-uploads.mdc`, `testing/node-testing.mdc`, `merge-readiness-check`; `app/.cursor/skills/SKILL.md` → `api/api-layer.mdc`, `state/async-ui.mdc`, `pages/page-composition.mdc`, `copy/ui-microcopy.mdc`, `testing/vitest-testing.mdc`, `core/ponytail-rules.mdc`, `merge-readiness-check`.

## Goals / Non-Goals

**Goals:**

- Owner-scoped player booking receipt-url + My bookings preview when `receiptKey` exists.
- Owner-scoped player wallet top-up receipt-url + Wallet preview when `receiptKey` exists.
- Marketing/public booking create invalidates portal list caches without hard refresh.
- Clear UI states: no key / load fail / success preview (bookings + top-ups).

**Non-Goals:**

- Re-upload tooling for legacy filename-only rows.
- Changing global `staleTime` as primary fix; bucket CORS; public receipts.
- Expanding top-up ownership beyond `userId` (no email-claim for wallet rows).

## Decisions

1. **Booking API** — `GET /me/bookings/:id/receipt-url`; ownership = `listMyBookings` OR; reuse `createPresignedDownload`; 404 for missing/non-owner/no key.

2. **Wallet API** — `GET /me/wallet/top-ups/:id/receipt-url`; ownership = `walletTopUp.userId === authUser.id`; reuse same download helper; admin top-up receipt-url unchanged. Prefer extending `getTopUpReceiptUrl` with an auth check overload rather than duplicating S3 logic.

3. **Web preview** — Mirror admin signed-URL fetch in player booking detail and Wallet top-up UI (inline expand or sheet—match existing Wallet density; ponytail). Distinct load-fail vs filename-only copy.

4. **Cache refresh** — Switch `BookingModal` to `useCreatePublicBooking()` (or invalidate those query-key prefixes). Wallet top-up create already invalidates; optionally also invalidate `adminWalletTopUpsQueryKey` on player create if admin inbox is commonly left open (nice if one-liner). Spot-check other booking writes; fix clear offenders only.

5. **Deploy** — Ship API before or with web. No migration.

## Risks / Trade-offs

- **[Risk] Email-claim on bookings** already exists for listMyBookings → Mitigation: same rule; do not widen.  
- **[Risk] Missed direct service call** → Mitigation: grep `createPublicBooking(` outside hooks.  
- **[Trade-off] 404 for non-owner** may hide forbidden vs missing → Acceptable.

## Migration Plan

1. Deploy API (booking + wallet player receipt-url).  
2. Deploy web previews + BookingModal invalidation.  
3. Rollback: revert; admin receipt paths unaffected.

## Open Questions

- None material.
