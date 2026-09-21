## Why

Courts open **5 October 2026**, so the primary marketing funnel should be advance booking (“Book a court”), not waitlist/Join the club. Staff still need a lead roster — rename Waitlist to **Players** and keep collecting, tagged by whether the person came from **newsletter** or **booking**.

## What Changes

- Marketing `BookingButton` / Book CTAs show **Book a court** and open the **booking modal** (court), not Join the club / waitlist capture.
- Advance booking: bookable court dates MUST be **on or after 2026-10-05** (PHT calendar date); earlier dates disabled in the booking UI.
- FAQ / BookCta / related marketing copy: booking from Oct 5, not waitlist-first language.
- Admin nav and page: **Waitlist → Players** (route `/admin/players`; redirect from `/admin/waitlist` optional).
- Lead capture continues on the existing Postgres waitlist/players table:
  - **newsletter** — homepage newsletter form
  - **booking** — upsert after a successful public court booking (name + email)
- **BREAKING (API enum):** extend waitlist `source` with `booking`; stop using `join_club` as the primary marketing path (migrate or map existing `join_club` rows for display as legacy / Players).
- Demote or remove Join the club as the default marketing CTA; newsletter remains a soft signup into Players.
- Facility settings `preSignup` toggle: retire or flip default so marketing books, not waitlist.

## Capabilities

### New Capabilities

- `advance-booking`: Public “Book a court” flow with earliest bookable date 2026-10-05; successful booking registers/updates a Players lead with source `booking`

### Modified Capabilities

- `waitlist-api`: Product surface renamed to Players for admin UX; sources `newsletter` | `booking` (keep collecting); admin list shows source badges; Join the club no longer required for primary capture

## Impact

**kit.repos in scope:** `api` (`./backend`), `web` (`./app`), `plans` (this OpenSpec change).

**Non-goals / excluded:**
- `support` — unchanged
- Real booking persistence API (bookings may remain client stub this change; Players upsert on booking success still goes through product waitlist/players API when online)
- Unlocking full student `/app/*` portal (Coming soon may remain)
- Renaming Prisma table/API paths away from `waitlist_*` (optional later; UX label is Players first)
- Resend / email blasts to Players
- Changing facility admin walk-in calendar booking (separate surface)

**Must not break:** newsletter subscribe → API upsert; admin Basic Auth mount rules for `/admin/waitlist` (path may stay while UI says Players); existing GCash booking modal payment steps; dashboard links that pointed at Waitlist must land on Players; optional Join the club modal still POSTs when used (legacy `join_club`).
