## ADDED Requirements

### Requirement: Stub food menu for students

The student Food tab MUST present a stub/static menu of items (id, name, priceCents, optional category). Menu MAY live in code or a seed table; admin menu CMS is out of scope.

#### Scenario: Student sees menu

- **WHEN** a logged-in student opens the Food tab
- **THEN** they see the stub menu with names and prices

### Requirement: Place food order

Authenticated students MUST be able to place an order with one or more line items (menu item id + quantity), optional notes, and a chosen pay mode. Orders start as `pending`.

#### Scenario: Place order pay at counter

- **WHEN** a student places a valid order with pay mode `counter`
- **THEN** a FoodOrder is created as `pending` with line items and notes; wallet is not debited

#### Scenario: Empty order rejected

- **WHEN** a student submits an order with no line items
- **THEN** validation fails and no order is created

### Requirement: Wallet pay when balance sufficient

When pay mode is `wallet`, the system MUST debit the student's wallet by the order total in the same transaction as creating the order **only if** `balanceCents >= totalCents`. Insufficient funds MUST reject the order without debit.

#### Scenario: Wallet pays successfully

- **WHEN** a student places an order with pay mode `wallet` and balance ≥ total
- **THEN** balance decreases by total, order is `pending`, and pay mode is recorded as `wallet`

#### Scenario: Insufficient wallet balance

- **WHEN** a student chooses `wallet` but balance < total
- **THEN** the request fails with a clear error and no order/debit occurs

### Requirement: Admin food order inbox

Admins MUST list food orders and advance status along `pending` → `preparing` → `ready`. Invalid transitions MUST be rejected.

#### Scenario: Invalid status transition rejected

- **WHEN** an admin tries to move an order backward (e.g. `ready` → `preparing`) or skip from `pending` → `ready`
- **THEN** the API rejects the update and status is unchanged

#### Scenario: Advance pending to preparing

- **WHEN** an admin sets a pending order to `preparing`
- **THEN** the order status becomes `preparing`

#### Scenario: Advance preparing to ready

- **WHEN** an admin sets a preparing order to `ready`
- **THEN** the order status becomes `ready`

### Requirement: Student Food tab and admin nav

Student portal MUST include a Food nav item and page. Admin portal MUST include a Food orders inbox page.

#### Scenario: Student navigates to Food

- **WHEN** a student uses the Food nav item
- **THEN** the Food page loads with menu and order form

#### Scenario: Admin reviews orders

- **WHEN** an admin opens Food orders
- **THEN** they see orders and can advance status
