## ADDED Requirements

### Requirement: Compact portal sidebar
The shared portal chrome SHALL render a narrower sidebar with a tighter brand block and denser navigation rows than the current layout, following the reference console's proportions. Navigation rows SHALL remain single-line, keyboard reachable, and visibly distinct when active. The existing black sidebar surface and yellow active accent SHALL be retained.

#### Scenario: Sidebar is narrower
- **WHEN** a player or admin opens a portal route on a desktop viewport
- **THEN** the sidebar occupies less horizontal space than before the change, and the main content column gains that space

#### Scenario: Nav rows are denser
- **WHEN** the portal navigation renders
- **THEN** vertical spacing between rows and the padding inside each row is reduced relative to the current layout, while each label stays on one line without truncation at the new width

#### Scenario: Active state stays legible
- **WHEN** a nav item matches the current route
- **THEN** it renders as a filled yellow pill with dark text, and non-active items keep their muted-to-white hover treatment

#### Scenario: Mobile drawer matches
- **WHEN** the mobile menu is opened on a small viewport
- **THEN** the drawer uses the same compact nav density as the desktop sidebar

#### Scenario: Touch targets stay thumb-sized
- **WHEN** portal navigation renders on a touch viewport
- **THEN** every nav row and the Log out control keep a hit area of at least 44×44 CSS px, even though the desktop sidebar renders at the tighter compact height

### Requirement: Sidebar identity block
The portal sidebar footer SHALL show the signed-in user's identity as an avatar with initials plus name and email, and SHALL keep a reachable Log out control.

#### Scenario: Identity shown
- **WHEN** an authenticated user views any portal route
- **THEN** the sidebar footer shows an initials avatar, the user's name, and the user's email address

#### Scenario: Long values do not break layout
- **WHEN** the signed-in user has a long name or email
- **THEN** the values truncate within the sidebar width rather than wrapping or overflowing

#### Scenario: Log out still works
- **WHEN** the user activates the Log out control in the sidebar footer
- **THEN** logout runs as before, with a disabled/pending state while in flight

### Requirement: Compact page shell rhythm
The shared page shell SHALL use reduced vertical padding and a smaller gap between sections, applied uniformly to every player and admin portal page. The shared horizontal padding token SHALL be unchanged so existing alignment guarantees hold.

#### Scenario: Pages start higher
- **WHEN** any portal page renders through the shared page shell
- **THEN** its top padding and inter-section gap are smaller than before the change

#### Scenario: Horizontal padding token unchanged
- **WHEN** the shared layout constants are read
- **THEN** `appContentPaddingClass` is still `px-4 sm:px-6` and `appContentWidthClass.wide` is still `max-w-5xl`

#### Scenario: Every shell consumer still renders correctly
- **WHEN** each page that uses the shared page shell renders — player Bookings, Calendar, Wallet, Profile; admin Bookings, Top-ups, Calendar, Players, Settings; and the not-found page
- **THEN** its sections keep readable separation, no content collides, and there is no horizontal scrolling at a 320px viewport

#### Scenario: Spacing rule matches the code
- **WHEN** `app/.cursor/rules/pages/page-layout.mdc` is read after the change
- **THEN** its spacing rhythm, shell padding, and checklist state the new compact values rather than the previous `gap-8` and `py-8 sm:py-10`

### Requirement: Compact page headers
Player Overview and admin Dashboard headers SHALL present the page title and its primary action on a single row on desktop, with a smaller heading than the current oversized display type, stacking to title-then-action on small viewports.

#### Scenario: Header is one row on desktop
- **WHEN** an authenticated user opens `/app` or `/admin` on a desktop viewport
- **THEN** the page title sits on the left and the primary action (booking button or range selector) sits on the right of the same row

#### Scenario: Heading is smaller
- **WHEN** either page header renders
- **THEN** the heading font size is reduced relative to the current display size while keeping the existing display font and yellow accent word

#### Scenario: Header stacks on mobile
- **WHEN** either page renders on a small viewport
- **THEN** the title and action stack vertically without overlap or horizontal scrolling

### Requirement: Compact stats and activity rows
Portal stat cards and recent-activity rows SHALL be tightened so that, on a standard laptop viewport, player Overview and admin Dashboard show the stat row plus the full recent-activity list without scrolling.

#### Scenario: Stats and activity fit above the fold
- **WHEN** an authenticated admin opens `/admin` on a 1024×640 content area with a full recent-activity list
- **THEN** the stat cards and all activity rows are visible without vertical scrolling

#### Scenario: Activity rows are denser
- **WHEN** recent activity renders on `/app` or `/admin`
- **THEN** each row uses reduced vertical padding with a divider between rows, a small leading icon, and its timestamp aligned to the right

#### Scenario: Loading skeletons match new density
- **WHEN** stats or activity are still loading
- **THEN** the skeleton placeholders occupy the same compact heights as the loaded content, so no layout shift occurs on resolve

### Requirement: Existing portal theme retained
The compact redesign SHALL change density, hierarchy, and the sidebar identity block only. Brand colors, fonts, and the light `portal-shell` content surface SHALL be unchanged.

#### Scenario: Theme tokens untouched
- **WHEN** the compact layout renders
- **THEN** the sidebar is still black, the accent is still `#F5C518` yellow, the content surface is still the light `portal-shell` background, and the display/marketing fonts are unchanged
