## ADDED Requirements

### Requirement: Sidebar nav density matches Dashboard on both portals

The shared portal chrome sidebar (player and admin) MUST use one nav-item density for padding, gap, label size, and active yellow pill sizing that matches the Admin Dashboard sidebar appearance. Active and inactive items MUST share the same horizontal/vertical padding so the highlight does not change layout width when switching routes.

#### Scenario: Admin sidebar matches Dashboard density on non-dashboard routes
- **WHEN** an admin opens Players, Calendar, Settings, or any other admin route that uses portal chrome
- **THEN** sidebar nav item padding and active pill size match the Dashboard sidebar (not a looser or tighter local variant)

#### Scenario: Player sidebar uses the same density
- **WHEN** a player opens Overview, Bookings, Food, or other player portal routes that use portal chrome
- **THEN** sidebar nav items use the same padding, gap, type size, and active pill sizing as the admin Dashboard sidebar

#### Scenario: Active state does not change item footprint
- **WHEN** a user moves from an inactive nav item to the active yellow pill item
- **THEN** the item’s padding box stays consistent (only background/text color change), without a visibly larger/smaller hit target

#### Scenario: Mobile drawer uses the same nav density
- **WHEN** a player or admin opens the mobile portal drawer nav
- **THEN** nav items use the same padding, gap, type size, and active pill sizing as the desktop sidebar

### Requirement: In-page tablists use Dashboard-aligned density
In-page section tablists in the portals (including Admin Settings tabs such as Prices / Open play sessions / Payment methods / Food menu, and any other player or admin `role="tablist"` section bars that currently use looser padding) MUST use horizontal padding, vertical padding, and inter-tab gap aligned to Dashboard control density. Tab labels MAY keep an underline or pill active indicator, but MUST NOT use substantially larger padding than the Dashboard sidebar/control reference.

#### Scenario: Settings tabs padding aligned
- **WHEN** an admin views Settings section tabs
- **THEN** each tab’s padding and gap match the agreed Dashboard density tokens (not visibly roomier than Dashboard nav/controls)

#### Scenario: Switching Settings tabs preserves density
- **WHEN** an admin selects a different Settings tab
- **THEN** the active indicator updates without changing the padding scale of sibling tabs
- **AND** the selected tab remains `aria-selected` and its panel remains reachable

### Requirement: Marketing and non-portal surfaces unchanged
Marketing-site navigation and non-portal pages MUST NOT be restyled by this change.

#### Scenario: Marketing nav untouched
- **WHEN** a visitor opens the public marketing site
- **THEN** header/footer nav spacing is unchanged by this change
