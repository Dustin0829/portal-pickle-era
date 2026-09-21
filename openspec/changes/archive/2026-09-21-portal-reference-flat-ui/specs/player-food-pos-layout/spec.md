## ADDED Requirements

### Requirement: Two-column Food layout
The player portal Food page SHALL use a two-column layout on wide viewports: left = scrollable menu; right = sticky order summary. On narrow viewports the order summary SHALL remain reachable (stack below menu or equivalent) without losing place-order capability.

#### Scenario: Desktop shows menu and order side by side
- **WHEN** a player opens Food at desktop width with menu items loaded
- **THEN** menu cards appear on the left and an order panel appears on the right

### Requirement: Menu cards with add and quantity
Each available menu item SHALL show name, price, optional image and description, and either **+ Add** (qty 0) or a quantity stepper (− / qty / +) when qty > 0. Adding and adjusting qty SHALL update the order sidebar without a full page reload.

#### Scenario: Add item appears in sidebar
- **WHEN** the player taps + Add on a menu item
- **THEN** the order sidebar lists that line with quantity and line total

#### Scenario: Missing menu image
- **WHEN** a menu item has no `imageUrl`
- **THEN** the card still shows name, price, and add controls with a simple placeholder (no broken image)

### Requirement: Order sidebar checkout
The order sidebar SHALL list selected lines (name, qty, line price), show order total, allow wallet vs counter pay mode (existing pay modes), optional notes, and a Place order action. Successful place-order SHALL clear the cart and keep existing API behavior. The UI SHALL NOT require Print Bill or multi-order session tabs.

#### Scenario: Place order with lines
- **WHEN** the player has at least one line and confirms Place order
- **THEN** the existing create-food-order API path runs and the cart clears on success

#### Scenario: Empty cart cannot place
- **WHEN** the cart has no lines
- **THEN** Place order is disabled or no-ops with no API call
