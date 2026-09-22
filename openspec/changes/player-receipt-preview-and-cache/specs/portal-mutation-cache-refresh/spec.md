## ADDED Requirements

### Requirement: Marketing booking create refreshes portal lists
After a successful public/marketing booking create from the SPA, the client SHALL invalidate (or otherwise refresh) TanStack Query caches for My bookings, booking occupancy, and admin bookings lists so open portal tabs show the new row without a full page reload.

#### Scenario: Logged-in book updates My bookings
- **WHEN** an authenticated player completes marketing Submit Proof successfully while My bookings is already mounted (or was previously fetched)
- **THEN** a subsequent view of My bookings shows the new pending booking without requiring a hard browser refresh

#### Scenario: Occupancy updates after book
- **WHEN** a public booking create succeeds for a date
- **THEN** occupancy queries for that date are invalidated so calendars reflecting occupancy can refetch

### Requirement: Prefer mutation hooks for booking writes
SPA booking create/patch paths that already have React Query mutation hooks (`useCreatePublicBooking`, `useCreateAdminBooking`, `usePatchAdminBooking`, and equivalents) SHALL use those hooks (or call the same invalidation on success) instead of calling the raw API service alone when invoked from UI that leaves portal lists open.

#### Scenario: BookingModal uses invalidating path
- **WHEN** `BookingModal` submits a successful public booking
- **THEN** it goes through `useCreatePublicBooking` (or equivalent success invalidation of `myBookings`, occupancy, and admin bookings query keys)

### Requirement: Player wallet top-up create already refreshes wallet queries
Player wallet top-up submit paths that use `useCreateMeWalletTopUp` SHALL continue to invalidate `me-wallet` (and related transaction queries) on success so the Wallet page shows the new pending top-up without a hard refresh. This change MUST NOT regress that behavior.

#### Scenario: Top-up submit refreshes wallet
- **WHEN** an authenticated player successfully submits a wallet top-up via the hooked mutation
- **THEN** me-wallet queries are invalidated so the new pending top-up appears without a full page reload
