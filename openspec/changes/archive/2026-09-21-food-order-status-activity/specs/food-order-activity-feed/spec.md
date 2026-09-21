## ADDED Requirements

### Requirement: Player Overview includes food order activity
Player Overview “recent” activity SHALL include the player’s recent food orders alongside bookings (merged by `createdAt` descending, capped similarly to today’s recent list, ~5). Each food activity item SHALL identify it as a food order and show status using the same labels as the Food tab (**Queued** / **Preparing** / **Ready**).

#### Scenario: Order appears after place
- **WHEN** the player places a food order and opens Overview
- **THEN** a recent activity row for that food order is visible with Queued (or current status)

#### Scenario: Mixed with bookings
- **WHEN** the player has both recent bookings and food orders
- **THEN** Overview shows a merged recent list (not bookings-only)

#### Scenario: Food-only history
- **WHEN** the player has food orders but no bookings
- **THEN** Overview shows food order activity and MUST NOT use the bookings-only empty CTA as the sole content

#### Scenario: Overview load failure partial
- **WHEN** bookings load succeeds but food orders fail (or the reverse)
- **THEN** Overview still shows the successful feed and surfaces a non-blocking error for the failed source (does not blank the whole recent section)

### Requirement: Admin Dashboard includes food order activity
Admin Dashboard recent activity SHALL include facility food orders (player name, status label Queued/Preparing/Ready, time) merged with existing booking (and waitlist if already present) activity, newest first by `createdAt` (or `updatedAt` when displaying latest status for an existing order row). Items SHALL link to `/admin/food` when clickable.

#### Scenario: New order surfaces for admin
- **WHEN** any player places a food order
- **THEN** the admin Dashboard recent activity includes an entry for that order on next load/refetch

#### Scenario: Status shown on load
- **WHEN** an order was advanced to preparing or ready
- **THEN** the activity row for that order shows the current status (one row per order; no separate event log table)

#### Scenario: Bookings still appear
- **WHEN** food orders are merged into the feed
- **THEN** existing booking (and waitlist) activity rows continue to appear under the same merge/cap rules
