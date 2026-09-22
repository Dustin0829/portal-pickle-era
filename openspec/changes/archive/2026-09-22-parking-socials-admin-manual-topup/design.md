## Context

- Space carousel uses `src: "/parking.jpg"` but the file on disk is `app/public/Parking.jpg` — breaks on case-sensitive deploys (observed broken image / alt “Parking space at Pickle Era”).
- `Footer.tsx` links Instagram/Facebook to generic `instagram.com` / `facebook.com`.
- Wallet: players create pending `WalletTopUp`; admin approve uses `applyWalletDelta` + ledger `top_up`. No admin “desk credit” path. `GET /admin/users` exists but has no email search / booking summary for this flow.
- Admin calendar day click opens Day Schedule with open-hours walk-in picker, duplicating Admin Bookings `WalkInBookingModal`.
- Walk-in modal hard-codes cash-ish labels; no facility payment-method picker or explicit **Paid via cash** desk control (walk-ins are guests: no account/credits).

Applicable rules (cite): `app/.cursor/rules/pages/page-composition.mdc`, `state/async-ui.mdc`, `api/api-layer.mdc`, `forms/`; `backend/.cursor/rules/api/http-api.mdc`, `response-contracts.mdc`, `data/database.mdc`, `concurrency.mdc`, `core/module-boundaries.mdc`, `testing/node-testing.mdc`. Context also: `ProtectedRoute` + `AuthLoadingShell` tear down portal chrome on every refresh while `getMe` runs.

## Goals / Non-Goals

**Goals:**

- Reliable parking photo + correct social URLs on marketing
- Admin can credit a player from Top-ups Inbox via email search → profile → Add credits (immediate)
- Admin calendar is overview + per-day bookings list only (no open-hours picker / walk-in from calendar; walk-in stays on Bookings)
- Walk-in desk pay: facility payment methods + **Paid via cash**; no credits (guest / no account)
- Portal refresh does not flash login skeleton then remount the same page

**Non-Goals:**

- Changing player GCash upload UX
- Debit / clawback UI
- Walk-in create on the calendar (Bookings page CTA owns that)
- Wallet credits on walk-in
- Replacing the pending GCash wallet top-up inbox
- Redefining Open Play session hours/capacity business rules
- Activity-log enrichment beyond ledger reference (nice-to-have later)
- New social networks beyond FB/IG
- Persisting full user profile offline as a product feature (optional minimal cache only to avoid flash)

## Decisions

### Parking path

Prefer renaming/referencing a single canonical public path (e.g. keep file as `parking.jpg` lowercase and point `Space.tsx` at `/parking.jpg`, or update `src` to `/Parking.jpg`). Pick one that matches git + Linux; avoid duplicate assets.

### Social URLs

Replace footer hrefs (all Instagram/Facebook instances in `Footer.tsx`) with the provided profile URLs; keep `target="_blank"` + `rel="noopener noreferrer"`.

### Manual credit = immediate ledger top_up

`POST /admin/wallet/manual-credits` body: `{ userId, amountCents }`. Admin session required. Target user MUST be `role: student`. Transaction: `applyWalletDelta` with `type: "top_up"`, `referenceType: "admin_manual"`, `referenceId: <new cuid>`. Do **not** create a `WalletTopUp` pending row. Player Transactions tab shows `top_up` as today.

### Player search + profile

Extend or add admin endpoint e.g. `GET /admin/users?search=` (email/name contains, role student) and `GET /admin/users/:id/wallet-profile` returning `{ user, balanceCents, bookingsCount, recentBookings[] }` — or one search-by-email that returns profile when exact match. Prefer search list then detail fetch to keep payloads small.

### UI flow (Top-ups Inbox)

Primary button “Top up” / “Manual top-up” opens modal: search → results → select → show name, email, joined (`createdAt`), bookings count (+ short recent list if cheap) → amount field → Add credits → toast/success → invalidate wallet/admin queries.

### Admin calendar = day bookings only (no booking builder)

Today admin `CourtDayGrid` opens `DayScheduleModal` with **Open hours** (selectable chips) + **Booked** list, then `onBookSlot` opens `WalkInBookingModal`—duplicating Admin Bookings walk-in.

**Approach:**

1. Admin calendar keeps month grid + per-day booking counts.
2. Day click still opens a day sheet, but **bookings list only** (reuse the existing booked column / list UX; drop open-hours column, selection state, and walk-in footer).
3. Remove `onBookSlot` / `bookIntent="walk-in"` / `WalkInBookingModal` wiring from `AdminCalendarPage`.
4. Walk-in create remains on Admin Bookings (“Walk-in booking” → `WalkInBookingModal` with `UnifiedBookingSchedule`).
5. Player portal calendar can stay as-is unless it shares the same modal path—prefer admin-specific props (`readOnly` / `bookingsOnly`) so student pay flow is not accidentally stripped if still needed.

### Walk-in desk pay (no account / no credits)

Walk-in is for guests at the desk: **no portal account**, **no wallet credits**. Today `WalkInBookingModal` hard-codes `referenceId: "WALK-IN"` and `receiptName: "Walk-in / cash"` with no payment-method UI.

**Approach:**

1. Keep walk-in entry on Admin Bookings only (after calendar day-bookings-only).
2. On the walk-in details/pay step, load facility payment methods (same source as marketing/portal: Settings / facility-settings API).
3. Present methods for digital settle (show label / QR / account details as needed for desk confirmation) **or** primary/secondary **Paid via cash** that creates the approved walk-in without receipt upload or credits.
4. Do **not** show Pay with credits / wallet apply on walk-in.
5. Persist enough on the booking to distinguish cash vs chosen method if the create API already supports payment-method fields; otherwise store via existing reference/receiptName conventions with minimal API change—prefer explicit fields only if already in schema.

### Portal refresh session flash

Observed: `AuthProvider` starts `status: "loading"`; `ProtectedRoute` returns only `AuthLoadingShell` (bare skeleton, no `PortalChrome`), which feels like a login flash; then `getMe` succeeds and the portal remounts on the same URL.

**Approach (minimal):**

1. Keep portal chrome mounted during `loading` — e.g. render `PortalChrome` + in-content skeleton / “Checking session”, **or** make `AuthLoadingShell` match portal shell (sidebar placeholders) instead of a marketing-empty skeleton.
2. Only `<Navigate to="/login" />` when status is confirmed `unauthenticated` (never during `loading`).
3. Do not remount layouts unnecessarily once authenticated (same route key).
4. Optional Nice-to-have: remember last-known user snapshot in memory/sessionStorage for optimistic chrome; still revalidate with `getMe` (do not skip redirect if me fails).

## Risks / Trade-offs

- **Staff look for walk-in on calendar** → Copy on calendar points to Bookings page walk-in CTA; day sheet empty state does not imply “book here”
- **Walk-in confused with portal credits pay** → No credits UI on walk-in; copy assumes guest / cash or facility method
- **Case-only rename may not show on case-insensitive macOS git** → Use `git mv` two-step or change `src` string only to match existing `Parking.jpg`
- **Admin credit abuse** → Admin-only auth; audit via ledger reference; Follow-up: activity log
- **Search enumeration** → Admin-only; min query length ≥ 2

## Migration Plan

Deploy web (asset + footer) anytime. Deploy API before relying on manual credit UI. No Prisma enum change if reusing `top_up`.

## Open Questions

- None blocking — immediate credit + no pending row locked as default.
