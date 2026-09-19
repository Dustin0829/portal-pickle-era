## ADDED Requirements

### Requirement: Your order rail is full height on desktop
On the player Food tab at the `lg` breakpoint, the “Your order” aside SHALL stretch to match the available content column height (not hug content only). The cart/active-order body SHALL scroll when needed; payment mode and place-order controls SHALL remain reachable at the bottom of the rail.

#### Scenario: Empty cart still full height
- **WHEN** the cart has no lines and the menu column is tall
- **THEN** the Your order card still fills the rail height on large screens

#### Scenario: Long cart scrolls inside rail
- **WHEN** many line items are added
- **THEN** the line list scrolls within the rail and Place order remains usable

#### Scenario: Mobile unchanged composition
- **WHEN** the Food page is shown below the `lg` breakpoint
- **THEN** the order block stacks under the menu without requiring a fixed viewport-height rail

### Requirement: Menu images share one aspect ratio
Each menu item card’s image area SHALL use the same fixed aspect ratio and `object-cover` (or equivalent) so cards with different source photos (or placeholders) align at equal image heights.

#### Scenario: Three items with different photos
- **WHEN** the menu shows items with differently cropped photos
- **THEN** each image box is the same size and photos cover the box without stretching unevenly

#### Scenario: Missing image placeholder
- **WHEN** a menu item has no image
- **THEN** the placeholder occupies the same aspect box as items with photos
