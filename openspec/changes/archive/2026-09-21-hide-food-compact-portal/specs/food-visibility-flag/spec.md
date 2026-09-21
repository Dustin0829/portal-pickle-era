## ADDED Requirements

### Requirement: Single web flag controls Food visibility
The web app SHALL expose one build-time constant (`FOOD_ENABLED` in `app/src/lib/featureFlags.ts`) that gates every player-facing and admin-facing Food entry point. The flag SHALL default to `false`. No Food code, route component, API endpoint, or seeded menu data SHALL be deleted as part of hiding Food.

#### Scenario: Flag is the only switch needed to restore Food
- **WHEN** a developer sets `FOOD_ENABLED` to `true` and rebuilds the web app
- **THEN** the Food nav items, food routes, food activity rows, and food CTAs all return without any other source change

#### Scenario: Food implementation is retained
- **WHEN** the change is applied with `FOOD_ENABLED` set to `false`
- **THEN** `app/src/pages/app/food/FoodPage.tsx`, `app/src/pages/admin/food/AdminFoodOrdersPage.tsx`, the `app/src/api/features/food/` module, and the backend food endpoints still exist and are unmodified in behavior

### Requirement: Food nav item hidden in both portals
While Food is disabled, neither the player portal sidebar nor the admin portal sidebar SHALL render a Food navigation item, on desktop or in the mobile drawer.

#### Scenario: Player sidebar omits Food
- **WHEN** an authenticated player opens any `/app` route
- **THEN** the portal navigation contains no link to `/app/food`

#### Scenario: Admin sidebar omits Food
- **WHEN** an authenticated admin opens any `/admin` route
- **THEN** the portal navigation contains no link to `/admin/food`

#### Scenario: Remaining nav order is unchanged
- **WHEN** either sidebar renders with Food disabled
- **THEN** the other nav items keep their existing order and destinations, with no gap or placeholder where Food was

### Requirement: Food routes redirect while disabled
While Food is disabled, direct navigation to a food route SHALL redirect to that portal's home route instead of rendering the food page or a 404.

#### Scenario: Player food URL redirects
- **WHEN** an authenticated player navigates directly to `/app/food`
- **THEN** the app redirects to `/app` and replaces the history entry so Back does not return to the food URL

#### Scenario: Admin food URL redirects
- **WHEN** an authenticated admin navigates directly to `/admin/food`
- **THEN** the app redirects to `/admin` and replaces the history entry

#### Scenario: Route protection is unaffected
- **WHEN** an unauthenticated visitor navigates to `/app/food` or `/admin/food`
- **THEN** the existing auth guard behavior applies exactly as it does for other portal routes

### Requirement: Food activity and CTAs suppressed without extra requests
While Food is disabled, player Overview and admin Dashboard SHALL omit food orders from recent activity and SHALL omit every Food call-to-action, and SHALL NOT issue food API requests for those hidden surfaces. Loading, empty, and error states SHALL reflect bookings only.

#### Scenario: Player Overview shows bookings only
- **WHEN** an authenticated player opens `/app` and has past food orders
- **THEN** recent activity lists only bookings, no food order rows appear, and no request to the food orders endpoint is made

#### Scenario: Player Overview empty state omits food
- **WHEN** an authenticated player with no bookings opens `/app`
- **THEN** the empty state copy refers only to bookings and the "Order food" link to `/app/food` is not rendered

#### Scenario: Player Overview error state reflects bookings only
- **WHEN** the bookings request fails for an authenticated player on `/app`
- **THEN** the error message names bookings only and does not mention food orders

#### Scenario: Admin Dashboard activity omits food
- **WHEN** an authenticated admin opens `/admin` for a range containing food orders
- **THEN** recent activity lists only booking entries, no entry links to `/admin/food`, and no request to the admin food orders endpoint is made

#### Scenario: Dashboard stat values are unchanged
- **WHEN** an authenticated admin opens `/admin` with Food disabled
- **THEN** total sales, total bookings, and total players show the same values they would with Food enabled, because those stats derive from bookings and waitlist only

### Requirement: Admin Food menu settings remain available
Hiding Food ordering SHALL NOT hide or disable the Food menu section of admin Settings, because menu records are retained in the database and must stay editable.

#### Scenario: Food menu tab still reachable
- **WHEN** an authenticated admin opens `/admin/settings` with Food disabled
- **THEN** the Food menu tab is present and its menu items can still be created, edited, and removed
