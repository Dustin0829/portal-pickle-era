## Context

Marketing `BookingButton` currently hardcodes **Join the club** and opens the waitlist modal, ignoring call-site children like **Book a court**. Courts open **2026-10-05**; staff want advance booking as the primary funnel while still collecting leads under admin **Players**, tagged **newsletter** vs **booking**.

Postgres already has `WaitlistEntry` + enum `WaitlistSource` (`join_club` | `newsletter`) via `waitlist-api-player-coming-soon`. Booking remains a client stub (`saveBooking` / localStorage) with GCash modal; admin walk-in calendar is separate.

**Rule / skill indexes (in scope):**
- api: `backend/.cursor/skills/SKILL.md` — module-boundaries, http-api, response-contracts, api-evolution, database, zod/OpenAPI regen
- web: `app/.cursor/skills/SKILL.md` — api-layer, zod-validation, forms, marketing-copy / ui-microcopy, page-layout, vitest-testing, ponytail

## Goals / Non-Goals

**Goals:**
- Book a court CTA → booking modal; respect children label
- Floor bookable dates at 2026-10-05 in `BookingModal` (+ shared constant)
- Upsert Players lead with `source: booking` after successful public booking (soft-fail)
- Newsletter keeps `source: newsletter`
- Admin Waitlist → Players (nav, route, copy, source badges)
- Extend API enum with `booking`; keep reading legacy `join_club`

**Non-Goals:**
- Full booking domain API / Postgres bookings
- Renaming DB table or `/waitlist` HTTP paths (UI-first rename)
- Unlocking student portal Coming soon
- Removing newsletter section
- `support/` package

## Decisions

### 1. UI-first Players rename; keep waitlist API paths

- **Choice:** Admin label/route `/admin/players`; optional redirect from `/admin/waitlist`. Keep `POST /waitlist` and `GET /admin/waitlist`.
- **Why:** Ponytail — no forced OpenAPI/path migration this change; staff see Players immediately.
- **Alternatives:** Full rename module → deferred.

### 2. Opening-day constant in shared booking lib

- **Choice:** `OPENING_DATE = "2026-10-05"` in `app/src/lib/booking/booking.ts`; bookable floor = `max(todayKey, OPENING_DATE)` as `YYYY-MM-DD` strings. After open, past days of today remain disabled. Month pager earliest month = `startOfMonth(parseDateKey(OPENING_DATE))` when opening is still in the future (today’s month alone must not trap the user).
- **Why:** Single source for modal + tests; BookingModal today already disables past days and previous months relative to “now” — that logic must be updated for pre-open advance booking.
- **Alternatives:** Facility settings store — overkill for a fixed open day.

### 3. BookingButton restores modal + children

- **Choice:** `openBookingModal(plan ?? "court")`; render `children ?? "Book a court"`. Stop forcing Join the club.
- **Why:** Matches Hero/Pillars/Pricing intent already in the tree.
- **Alternatives:** Settings `preSignup` gate — flip default off / remove waitlist branch from CTA.

### 4. Source enum: add `booking`, keep `join_club` readable

- **Choice:** Prisma `WaitlistSource` += `booking`. Create body accepts `newsletter` | `booking` | `join_club` (JoinClubModal may remain on Coming soon). Players UI badges: Newsletter / Booking / legacy Join club. Upsert **latest source wins** (already updates `source` on upsert). Skip client upsert when booking email empty.
- **Why:** User asked to indicate booking vs newsletter; existing rows must not break list parse.
- **Alternatives:** Separate `sources[]` multi-value — YAGNI.

### 5. Soft-fail Players upsert after booking

- **Choice:** After `saveBooking` success in BookingModal (done step), fire `createWaitlistEntry({ email, name, source: "booking" })` without failing the done UI on API error.
- **Why:** Booking confirmation is primary; lead sync is secondary while bookings are stubbed.
- **Alternatives:** Block success until upsert — worse UX if API down.

### 6. Join the club demotion

- **Choice:** Not the default Book CTA. Provider/modal may remain for PlayerComingSoon or explicit links; primary homepage CTAs use Book a court.
- **Why:** User replaced waitlist funnel with advance booking.

### 7. Deploy order

1. API: migrate enum + OpenAPI + deploy backend.
2. Web: Book a court + Oct 5 floor + Players UI + booking upsert (needs API `booking` source live first, or web temporarily no-ops upsert until deploy).

## Risks / Trade-offs

- **[Risk] Stub bookings + API lead** → two stores until booking API exists → Mitigation: document; admin Bookings vs Players stay distinct.
- **[Risk] Enum deploy order** → old API rejects `booking` → Mitigation: ship API migration before web upsert; or feature-detect.
- **[Risk] Latest-source-wins overwrites newsletter** → Mitigation: accepted; badge shows last touch; optional future: keep first source (out of scope).
- **[Risk] FAQ still says waitlist** → Mitigation: tasks update FAQ/BookCta copy.

## Migration Plan

1. Prisma: add `booking` to `WaitlistSource`; migrate; regenerate client; OpenAPI.
2. Web schemas mirror enum; BookingButton + BookingModal date floor + soft upsert.
3. Admin Players route/nav/copy/source badges; redirect waitlist → players.
4. Update FAQ/BookCta; retire preSignup default for Book CTAs.
5. Rollback: redeploy previous web; enum value `booking` is additive (safe).

## Open Questions

None blocking (defaults recorded above).
