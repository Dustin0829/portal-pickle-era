## ADDED Requirements

### Requirement: Your order lines expose a remove control

Each line in the player Food **Your order** cart MUST show a remove control (icon button) that removes that menu item from the cart in one action (quantity becomes zero / line disappears). The control MUST be keyboard-accessible and have an accessible name that includes the item name (e.g. “Remove Shakes”).

#### Scenario: Remove clears a cart line
- **WHEN** the cart has a line (e.g. 1× Shakes) and the player activates Remove on that line
- **THEN** that line is removed from Your order and no longer counts toward item count or total

#### Scenario: Remove one of multiple lines
- **WHEN** the cart has two or more lines and the player removes one
- **THEN** only that line is removed; other lines, notes, pay mode, and active-orders section remain

#### Scenario: Qty stepper still works
- **WHEN** a player uses + / − on the menu card for an item already in the cart
- **THEN** quantity updates as today; Remove remains available on the matching Your order line while qty &gt; 0

### Requirement: Menu and cart food images share one fixed box size

On the player Food tab, every **menu card** image area MUST use the same fixed aspect (or fixed size) box with `object-cover` (or equivalent) so differently cropped source photos render at equal visible size. Every **Your order** cart thumbnail MUST use one shared fixed square (or shared size) with the same cover behavior, including placeholders when `imageUrl` is missing.

#### Scenario: Menu grid images align
- **WHEN** the menu shows multiple items with differently shaped source photos
- **THEN** each card’s image box is the same size and photos cover the box without uneven card heights from the media

#### Scenario: Cart thumbnails align
- **WHEN** Your order lists two or more lines with photos
- **THEN** each thumbnail box is the same size

#### Scenario: Missing image placeholder matches box
- **WHEN** a menu item or cart line has no image
- **THEN** the placeholder occupies the same box as items with photos
