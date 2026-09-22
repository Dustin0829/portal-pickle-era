# portal-page-title-align Specification

## Purpose
TBD - created by archiving change portal-page-title-align. Update Purpose after archive.
## Requirements
### Requirement: Portal page titles use dashboard size
Every top-level page title (`h1`) inside the admin portal (`/admin/*` shell pages) and player portal (`/app/*` shell pages) SHALL use the same display size as Admin Dashboard: Tailwind classes `display text-[28px] text-zinc-900 sm:text-[32px]` on the `h1` itself (no new shared `PageTitle` component required). Titles MUST NOT use larger display scales such as `text-[32px] sm:text-[40px]`, `text-[36px] sm:text-[44px]`, `text-[42px] sm:text-[52px]`, or `sm:text-[56px]` on those page `h1`s. Pages whose `h1` has no colored accent span MAY keep a single zinc-colored title (do not invent new yellow accents).

#### Scenario: Admin bookings title matches dashboard
- **WHEN** an admin opens Admin Bookings
- **THEN** the page `h1` uses `text-[28px]` (base) and `sm:text-[32px]` (sm+)

#### Scenario: Player wallet title matches dashboard
- **WHEN** a player opens Wallet
- **THEN** the page `h1` uses `text-[28px]` (base) and `sm:text-[32px]` (sm+)

#### Scenario: Calendar titles match dashboard
- **WHEN** an admin or player opens their Court calendar page
- **THEN** the page `h1` uses the same dashboard size tokens (not the previous larger calendar scale)

### Requirement: Page title accents use brand yellow only
When a portal page `h1` accents a secondary word with a color class, that accent SHALL use brand `text-yellow`. Portal page `h1` accents MUST NOT use `text-amber-600` (or other orange/amber title accents). Non-title amber (status chips, icons, secondary links) is out of scope for this requirement.

#### Scenario: Top-ups inbox accent is yellow
- **WHEN** an admin opens Top-ups Inbox
- **THEN** the accented word in the page `h1` uses `text-yellow` and does not use `text-amber-600`

#### Scenario: Bookings inbox accent is yellow
- **WHEN** an admin opens Bookings Inbox
- **THEN** the accented word in the page `h1` uses `text-yellow`

#### Scenario: Food orders accent is yellow
- **WHEN** an admin opens Food orders
- **THEN** the accented word in the page `h1` uses `text-yellow`

### Requirement: Marketing and auth titles unchanged
Marketing home, login, signup, forgot-password, and reset-password page titles SHALL remain outside this alignment (they keep their existing sizes and treatments).

#### Scenario: Login hero size unchanged by this change
- **WHEN** a visitor opens `/login`
- **THEN** the login `h1` size is not required to match the portal dashboard page-title scale

### Requirement: Non-page-title chrome unchanged
Modal/dialog headers, section `h2`/`h3` labels, sheet detail `display` amounts, status chips, and non-`h1` amber/yellow treatments SHALL NOT be resized or recolored by this change. Only the shell page’s primary `h1` is in scope.

#### Scenario: Booking detail sheet amount stays as-is
- **WHEN** a player opens a booking detail sheet that shows a `display` amount
- **THEN** that amount’s classes are not required to change as part of page-title alignment

#### Scenario: Pending status chip amber retained
- **WHEN** an admin views a pending booking or top-up status chip styled with amber
- **THEN** that chip’s amber classes remain (only `h1` accents move amber → yellow)

