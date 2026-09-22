## Why

Players opening booking details see “only saved the filename” even when a private `receiptKey` exists—the player UI never fetches a presigned download URL (admin-only today). The same gap exists for **wallet top-up** receipts on the player Wallet page. Separately, marketing `BookingModal` (and similar direct service calls) bypass React Query mutation hooks, so My bookings / admin inboxes stay stale until a hard refresh.

## What Changes

- Add an **owner-scoped** booking receipt URL API for the logged-in player (mirror admin `GET /admin/bookings/:id/receipt-url`).
- Add an **owner-scoped** wallet top-up receipt URL API (mirror admin `GET /admin/wallet/top-ups/:id/receipt-url`).
- Player booking detail modal: when `receiptKey` is present, fetch that URL and show image/PDF preview (same UX pattern as admin inbox).
- Player Wallet: when a top-up has `receiptKey`, allow preview via the player top-up receipt URL (list/detail interaction as designed—inline expand or sheet).
- Ensure public/marketing booking create (and other portal-critical writes that currently call services directly) **invalidate** the relevant TanStack Query keys so lists update without a full page refresh.
- Clarify empty-state copy: filename-only vs missing receipt vs load failure (bookings and top-ups).

## Capabilities

### New Capabilities

- `player-booking-receipt-preview`: Authenticated player can obtain a short-lived receipt URL for their own booking and preview it in My bookings.
- `player-wallet-topup-receipt-preview`: Authenticated player can obtain a short-lived receipt URL for their own wallet top-up and preview it on Wallet.
- `portal-mutation-cache-refresh`: Portal/marketing mutations that create or change bookings (and related lists) invalidate shared query caches so UI refreshes without a manual reload.

### Modified Capabilities

- `object-storage`: Extend authorized receipt GET access to include the booking owner and the wallet top-up owner (not only admin), still via short-lived presigned URLs.

## Impact

- **In scope:** `api` (`backend/`), `web` (`app/`), `plans`
- **Out of scope / non-goals:** `support`; re-uploading receipts for legacy rows that never got a `receiptKey` (CORS-era failures); public unauthenticated receipt access; changing bucket CORS (already fixed for `www`); lowering global `staleTime` as the primary fix
- **Assumptions:** Booking ownership = same rules as `listMyBookings` (`userId` and/or email match); top-up ownership = `userId` of the top-up row equals the session user; admin receipt-url routes stay; marketing book while logged-in must refresh My bookings
- **Must not break:** Admin booking + wallet top-up receipt-url and inbox previews; `GET /me/bookings` / `GET /me/wallet`; public `POST /bookings` body shape
- **Code (likely):** bookings + wallet routes/services/OpenAPI; `BookingsPage` detail; `WalletPage` top-up receipt UI; `BookingModal` → `useCreatePublicBooking` (or explicit invalidate)
