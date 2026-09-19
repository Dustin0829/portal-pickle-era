## ADDED Requirements

### Requirement: Single-container list rows without inter-row gaps

The product app MUST present the following list surfaces as **one** shared bordered container whose child rows sit flush (no vertical margin or gap between rows). Rows MAY use horizontal dividers. Each row MUST NOT be styled as its own floating card with independent outer border + vertical spacing from siblings.

In-scope surfaces:

- Player Overview **Recent requests / activity** (booking and food rows when present)
- Facility admin **Dashboard** recent activity list
- Player **My Bookings** list
- Facility admin **Bookings** inbox list
- Facility admin **Top-ups Inbox** list
- Facility admin **Food Orders** list

Empty, error, and initial-loading placeholders for these surfaces MUST remain a single container (or existing skeleton), not a stack of empty cards.

#### Scenario: Overview recent activity is one container
- **WHEN** the player Overview has two or more recent activity items
- **THEN** those items render inside one shared container without vertical gap/margin between sibling rows

#### Scenario: Admin dashboard activity matches container pattern
- **WHEN** the facility admin Dashboard shows two or more recent activity items
- **THEN** those items render inside one shared container without per-item card gaps

#### Scenario: My Bookings list is one container
- **WHEN** the player My Bookings tab shows two or more bookings in the current filter/page
- **THEN** booking rows sit in one shared container without inter-row card gaps

#### Scenario: Admin Bookings list is one container
- **WHEN** the admin Bookings inbox shows two or more bookings
- **THEN** booking rows sit in one shared container without inter-row card gaps

#### Scenario: Top-ups Inbox list is one container
- **WHEN** the Top-ups Inbox shows two or more top-up rows
- **THEN** those rows sit in one shared container without inter-row card gaps

#### Scenario: Food Orders list is one container
- **WHEN** the admin Food Orders tab shows two or more orders
- **THEN** those rows sit in one shared container without inter-row card gaps

#### Scenario: Empty state stays a single shell
- **WHEN** any in-scope list has zero visible items
- **THEN** the UI shows at most one empty-state container (not a multi-card stack)

### Requirement: Out-of-scope grids stay unchanged

Menu grids, stat card grids, Settings food CMS item rows, and player wallet ledger rows outside Top-ups Inbox MUST NOT be forced into this list-container pattern by this change.

#### Scenario: Food menu grid unchanged
- **WHEN** a player opens the Food tab menu grid
- **THEN** menu item cards retain their existing grid spacing (not rewritten as a single-column divided list solely for this change)
