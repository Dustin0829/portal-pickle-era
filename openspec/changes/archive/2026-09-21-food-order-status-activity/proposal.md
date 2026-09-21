## Why

Players can place café orders but cannot see whether food is preparing or ready, the “Your order” rail feels stubby next to the menu, menu images look uneven, and neither Overview nor the admin dashboard surfaces food orders in recent activity. Ops and players need the same fulfillment visibility they already have for bookings.

## What Changes

- Full-height **Your order** rail on the player Food tab (stretches with the menu column; cart list scrolls; pay controls stay pinned)
- Player visibility of **placed** orders with status **Preparing** / **Ready** (and pending as queued), via `GET /me/food/orders`
- Food orders appear in **recent activities** on player Overview and admin Dashboard when someone orders (and when status advances, where the feed already shows updates)
- Uniform **menu image** sizing (fixed aspect + `object-cover`) so cards align
- Admin status pipeline stays as today (`pending → preparing → ready`); no new statuses

## Capabilities

### New Capabilities

- `food-order-player-status`: Player list of own food orders + Food-tab active-order UI (preparing/ready)
- `food-order-activity-feed`: Merge food orders into player Overview and admin Dashboard recent activity
- `food-tab-order-rail-images`: Full-height order rail + equal menu card image aspect

### Modified Capabilities

- (none — food create/admin patch already exist under shipped portal food; this change adds list-self + UX surfaces)

## Impact

- **In scope:** `api`, `web`, `plans`
- **Out of scope:** `support`; redesign Food menu CMS; POS; new order statuses (`completed`/`cancelled`); real-time websockets (polling/refetch is enough); changing Food padding (already Food baseline)
- Branch: `feat/food-order-status-activity`
- **Deploy order:** API `GET /me/food/orders` first, then web Food / Overview / Admin dashboard
