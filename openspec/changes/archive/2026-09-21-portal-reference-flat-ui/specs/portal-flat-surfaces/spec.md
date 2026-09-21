## ADDED Requirements

### Requirement: No content-card shadows on portals
Player and admin portal content surfaces (stat cards, list cards, section panels, empty states) SHALL NOT use elevated box shadows (`shadow-sm`, `shadow-md`, `shadow-lg`, or equivalent). Surfaces SHALL use a thin border and flat fill on the portal light content background. Pickle Era brand colors (yellow, green, black/zinc) SHALL remain the accent system.

#### Scenario: Dashboard card is flat
- **WHEN** an admin opens the dashboard
- **THEN** primary content cards have no drop shadow and use a border for separation

#### Scenario: Player booking list cards are flat
- **WHEN** a player opens Bookings
- **THEN** booking list/section cards have no drop shadow

### Requirement: Modal stacking exception
Dialog/modal shells MAY retain a single stacking elevation (e.g. one shadow or overlay) so they separate from the page; inner cards inside modals SHALL still be flat (border-only).

#### Scenario: Modal shell vs inner cards
- **WHEN** the booking modal is open
- **THEN** the modal may use overlay/elevation for stacking, but grid cells and inner panels inside it do not use heavy card shadows
