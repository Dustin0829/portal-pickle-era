## ADDED Requirements

### Requirement: Portal pages share Dashboard content max-width and padding

Player and admin portal pages that use `AppPageShell` (or an equivalent calendar full-height shell) MUST use the same horizontal padding token as Admin Dashboard (`appContentPaddingClass`) and MUST use the Dashboard content max-width (`max-w-5xl`) so left/right gutters match when viewing on the same viewport. Pages MUST NOT override with a different `max-w-3xl` / `max-w-4xl` / `max-w-6xl` for general list/inbox/settings/dashboard content.

#### Scenario: Admin list pages match Dashboard gutters
- **WHEN** an admin opens Bookings, Top-ups, Food Orders, Settings, or Players at a desktop viewport
- **THEN** the main content column’s left/right inset and max width match Admin Dashboard (not wider or narrower)

#### Scenario: Player portal pages match Dashboard gutters
- **WHEN** a player opens Overview, My Bookings, Food, or Wallet at a desktop viewport
- **THEN** the main content column’s left/right inset and max width match Admin Dashboard (same padding token + `max-w-5xl`)

#### Scenario: Calendar shells use the same horizontal token
- **WHEN** a player or admin opens Court Calendar
- **THEN** horizontal padding matches `appContentPaddingClass` and content max-width matches Dashboard (`max-w-5xl`)

### Requirement: Shared padding token remains single source

Horizontal page padding MUST continue to come from the shared layout constant (`appContentPaddingClass`). Portal pages MUST NOT invent a one-off `px-*` that diverges from that token for the page shell.

#### Scenario: Padding token unchanged as single source
- **WHEN** portal pages render through `AppPageShell` or calendar shell
- **THEN** they apply `appContentPaddingClass` (currently `px-4 sm:px-6`) rather than a conflicting shell-level `px-*`

### Requirement: Narrow-form exception only with same padding

Profile or other intentionally narrow form layouts MAY use a narrower max-width than Dashboard **only** if they still apply the same horizontal padding token. List/inbox/settings pages MUST NOT use this exception.

#### Scenario: Profile may stay narrower but same padding
- **WHEN** a player opens Profile
- **THEN** horizontal padding matches the shared token; max-width MAY be narrower than `max-w-5xl` for the form column
