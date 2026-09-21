## ADDED Requirements

### Requirement: Player can list their own food orders
The API SHALL expose `GET /me/food/orders` for the authenticated student that returns that user’s food orders (newest first), including status, lines, totals, pay mode, and timestamps. The endpoint SHALL NOT return other users’ orders.

#### Scenario: Authenticated player lists orders
- **WHEN** a student with prior food orders calls `GET /me/food/orders`
- **THEN** the response includes only their orders sorted newest-first with status and line items

#### Scenario: Empty history
- **WHEN** a student with no food orders calls `GET /me/food/orders`
- **THEN** the response is an empty list (not an error)

#### Scenario: Unauthenticated rejected
- **WHEN** an unauthenticated client calls `GET /me/food/orders`
- **THEN** the request is rejected with the same auth failure behavior as other `/me/*` food routes

### Requirement: Food tab shows active order status
The player Food page SHALL show placed orders that are `pending`, `preparing`, or `ready` with a clear status label (**Queued** for `pending`, **Preparing**, **Ready**). The Food-tab “active” list SHALL be limited to the most recent **20** orders for that user that are still in those statuses (API may return a wider list; UI filters). Status SHALL update when the player returns to the page or the orders query is refetched after place (polling or focus refetch is acceptable; websockets are not required).

#### Scenario: Preparing order visible
- **WHEN** the player has an order with status `preparing` within the active window
- **THEN** the Food page shows that order with a Preparing status indicator and item summary

#### Scenario: Ready order visible
- **WHEN** the player has an order with status `ready` within the active window
- **THEN** the Food page shows that order with a Ready status indicator

#### Scenario: Cart vs placed orders
- **WHEN** the player is building a new cart
- **THEN** the “Your order” cart remains for unplaced lines and active placed orders are shown separately (or in a clearly labeled section of the same rail) so status is not confused with the cart

#### Scenario: After place order
- **WHEN** the player successfully places an order
- **THEN** the cart clears (as today) and the new order appears in the active-orders UI as Queued without a full page reload

#### Scenario: Older ready orders drop from active rail
- **WHEN** the player has more than 20 historical ready/preparing/pending orders
- **THEN** only the newest 20 appear in the Food active section (full list remains available from the API for later use)

### Requirement: Existing food create and admin status flow unchanged
Placing an order (`POST /me/food/orders`) and admin status advances (`pending → preparing → ready`) SHALL keep today’s validation, wallet/counter pay modes, and forward-only status rules.

#### Scenario: Place order still works
- **WHEN** a player places a valid counter or wallet order
- **THEN** create succeeds as today and the new list endpoint can return that row

#### Scenario: Admin patch still forward-only
- **WHEN** an admin patches status out of order (e.g. ready → pending)
- **THEN** the API rejects as today (no change to adjacency rules)