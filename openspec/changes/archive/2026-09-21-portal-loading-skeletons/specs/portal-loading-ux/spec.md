## ADDED Requirements

### Requirement: Initial load shows layout-matched skeletons

When a portal or marketing async view has no cached data and a query is pending, the UI MUST show a skeleton that approximates the final layout (stats, list rows, calendar grid, or table). The UI MUST NOT replace the portal chrome (sidebar/header) with a full-viewport loading shell for these content queries.

#### Scenario: Admin bookings inbox first load

- **WHEN** an admin opens `/admin/bookings` with no cached bookings data and the list query is pending
- **THEN** the page shows inbox-row skeletons inside the main content area while the portal sidebar remains visible

#### Scenario: Player overview first load

- **WHEN** a signed-in player opens `/app` with no cached bookings data and the bookings query is pending
- **THEN** the overview shows skeleton placeholders for summary stats and upcoming items without blank white/black empty main content

#### Scenario: Refetch keeps existing content

- **WHEN** a list or dashboard already has data and a background refetch is in progress
- **THEN** the UI MUST keep showing the existing content and MUST NOT swap the entire view for a full skeleton

### Requirement: Calendar and booking schedule loading

Court calendar surfaces and the public booking schedule step MUST show loading feedback while occupancy or bookings data is loading.

#### Scenario: Admin calendar month pending

- **WHEN** an admin opens `/admin/calendar` and bookings data for the grid is pending with no cache
- **THEN** the month grid area shows skeleton day cells (or an equivalent grid placeholder)

#### Scenario: Booking modal occupancy pending

- **WHEN** a user opens the Book a Court schedule step for a selected date and occupancy has not yet resolved
- **THEN** court and time-slot controls show a loading/disabled skeleton state until occupancy is available

### Requirement: Receipt preview loading

When an admin opens booking details and a receipt download URL is being fetched, the receipt panel MUST show a visual loading placeholder instead of only plain text.

#### Scenario: Receipt URL fetch in progress

- **WHEN** booking details are open, `receiptKey` is present, and the signed URL has not loaded yet
- **THEN** the payment receipt panel shows a skeleton (or pulsing placeholder) in the preview area

### Requirement: Mutation busy states on primary actions

Destructive or commit actions MUST disable relevant controls and show busy labeling (or an equivalent spinner) while the mutation is in flight.

#### Scenario: Approve booking

- **WHEN** an admin clicks Approve on a pending booking
- **THEN** Approve and Reject controls for that action are disabled until the patch completes or fails

#### Scenario: Reject booking

- **WHEN** an admin clicks Reject on a pending booking
- **THEN** Approve and Reject controls for that action are disabled until the patch completes or fails

#### Scenario: Players export

- **WHEN** an admin clicks Export on the players page and export work is running
- **THEN** the Export button shows a busy state and is not clickable until export finishes

#### Scenario: Logout

- **WHEN** a portal user clicks Log out
- **THEN** the logout control shows a busy/disabled state until logout finishes

#### Scenario: Existing submit actions remain busy-aware

- **WHEN** a user submits booking payment proof, creates a walk-in booking, or joins the waitlist
- **THEN** the primary submit control continues to show an in-progress label and remains disabled while the request runs

#### Scenario: Save plan prices

- **WHEN** an admin clicks Save on Plan prices
- **THEN** the Save control shows a busy/disabled state until persistence completes and then confirms success (or re-enables on failure)

### Requirement: Players list skeleton

The admin players page MUST use table/list skeletons on initial pending load instead of a text-only “Loading…” line as the sole placeholder.

#### Scenario: Players table first load

- **WHEN** `/admin/players` loads with a pending waitlist query and no cached rows
- **THEN** the table region shows skeleton rows matching the column layout

### Requirement: Loading does not mask errors or empty results

After a query settles, the UI MUST show the error or empty state — not remain on skeletons indefinitely.

#### Scenario: Query fails

- **WHEN** a bookings, waitlist, or occupancy query fails and there is no usable cached data
- **THEN** the UI shows an error (or existing error pattern for that page), not a perpetual skeleton

#### Scenario: Query succeeds with zero rows

- **WHEN** a list query succeeds with an empty collection
- **THEN** the UI shows the page empty state, not skeletons

### Requirement: Mutation failure restores controls

When a busy mutation fails, primary action controls MUST become interactive again so the user can retry.

#### Scenario: Approve fails

- **WHEN** an approve (or reject) patch fails
- **THEN** Approve/Reject controls are enabled again and the booking remains pending until a successful patch

### Requirement: Session and chrome loading stay intact

This change MUST NOT replace `ProtectedRoute` session checking (`AuthLoadingShell`) or reintroduce a top-level Suspense fallback that unmounts portal chrome on tab switches.

#### Scenario: Session still resolving

- **WHEN** auth status is `loading`
- **THEN** the existing session loading shell remains the gate before portal content

#### Scenario: Sidebar navigation between admin pages

- **WHEN** an admin navigates between admin routes after pages are loaded
- **THEN** the portal sidebar remains visible (no full-viewport dark skeleton shell)
