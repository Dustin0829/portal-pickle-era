## ADDED Requirements

### Requirement: Admin-configurable food menu

Admins MUST create, update, and deactivate food/drink menu items (name, price in cents, optional category, availability flag, and optional **photo**) from Admin Settings (or equivalent admin UI). Students MUST only see available items. Photos MUST use the existing object-storage upload flow (presign + store object key); list/detail responses MUST provide a usable image URL (short-lived download URL or equivalent) when a photo key is set.

#### Scenario: Admin adds menu item with photo

- **WHEN** an admin creates a menu item with name, price, and an uploaded photo
- **THEN** the item appears on the student Food menu with name, price, and that photo while marked available

#### Scenario: Admin adds menu item without photo

- **WHEN** an admin creates a menu item with name and price but no photo
- **THEN** the item still appears on the student menu with a clear placeholder (no broken image)

#### Scenario: Unavailable item hidden from students

- **WHEN** an admin marks an item unavailable
- **THEN** students no longer see it on the Food menu; existing order line snapshots remain unchanged

### Requirement: Student Food tab

The student portal MUST include a Food nav item and page showing the available menu (photo when present, name, price), allowing quantity selection, optional notes, and place order.

#### Scenario: Student opens Food tab

- **WHEN** a logged-in student opens Food
- **THEN** they see available menu items with names, prices, and photos (or placeholders)

#### Scenario: Empty cart rejected

- **WHEN** a student submits an order with no line items
- **THEN** validation fails and no order is created

### Requirement: Place food order with pay mode

Authenticated students MUST place orders with one or more lines (menu item id + quantity). Orders start as `pending`. Pay mode MUST be `wallet` or `counter`. Line name and unit price MUST be snapshotted at order time.

#### Scenario: Pay at counter

- **WHEN** a student places a valid order with pay mode `counter`
- **THEN** a FoodOrder is created as `pending` with snapshotted lines; wallet is not debited

### Requirement: Wallet pay when balance sufficient

When pay mode is `wallet`, the system MUST debit the student's wallet by the order total in the same transaction as creating the order only if `balanceCents >= totalCents`. Insufficient funds MUST reject without creating an order or debiting.

#### Scenario: Wallet pays successfully

- **WHEN** a student places an order with pay mode `wallet` and balance ≥ total
- **THEN** balance decreases by total, order is `pending`, and pay mode is `wallet`

#### Scenario: Insufficient wallet balance

- **WHEN** a student chooses `wallet` but balance < total
- **THEN** the request fails with a clear error and no order/debit occurs

### Requirement: Admin food order inbox

Admins MUST list food orders and advance status along `pending` → `preparing` → `ready`. Invalid transitions MUST be rejected.

#### Scenario: Invalid status transition rejected

- **WHEN** an admin tries to move an order backward or skip (e.g. `pending` → `ready`)
- **THEN** the API rejects the update and status is unchanged

#### Scenario: Advance pending to preparing

- **WHEN** an admin sets a pending order to `preparing`
- **THEN** the order status becomes `preparing`

#### Scenario: Advance preparing to ready

- **WHEN** an admin sets a preparing order to `ready`
- **THEN** the order status becomes `ready`
