## Why

Open Play sessions fill up to 30 seats, but staff and players have no shared view of **who plays first** or **who faces whom**. Booking order already exists (`createdAt`); we need a FIFO paddle-style board so the first approved bookings form the first court groups without a separate mixer.

## What Changes

- Add an **Open Play FIFO queue** derived from **approved** Open Play bookings for a given `date` + session `slotId`, ordered by `createdAt` ascending (ties broken by booking `id`).
- Chunk the ordered list into **groups of 4**; within each group, positions **1–2 vs 3–4** define sides (partners/opponents by booking order — not random).
- Assign groups in order to facility courts (Court 1 → Court 6) for an **initial “now playing / next up” board** (up to available courts). Remainder sit out until a later wave (rotation automation is out of scope for v1).
- Expose API(s) for admin (and player peek of own position) plus admin UI board; optional player-facing queue position on portal.
- Keep existing Open Play capacity (30), Indoor|Outdoor court toggle for private court booking, and booking create/approve flows unchanged.

## Capabilities

### New Capabilities
- `open-play-fifo-queue`: FIFO ordering, foursome grouping, side pairing, court assignment for an Open Play session board; admin view and player own-position visibility

### Modified Capabilities
- `booking-api`: Add authenticated endpoints to read the computed Open Play FIFO board for a session (admin list; player own position or session peek as specified in design)

## Impact

- **In scope:** `api` (`./backend`), `web` (`./app`), `plans` (this OpenSpec change)
- **Out of scope:** `support`; skill-based matchmaking; random mixer; live 4-on/4-off advance/rotation state machine; changing `OPEN_PLAY_CAPACITY` or Indoor|Outdoor private-court grid; pending bookings in the play queue (must be approved first)
- **Touches:** bookings module (query + pure queue builder), OpenAPI, admin portal page (or calendar/session panel), optional player bookings/detail UI, Vitest/node tests
