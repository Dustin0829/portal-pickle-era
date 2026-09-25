## Why

Open Play today is booking + a static FIFO “opening wave” board. Staff and players still coordinate live play verbally: who is on which court, when a game ends, and who rotates next. Pickle Era needs a **live session source of truth** so players see their status in seconds and staff can run the floor from one dashboard.

## What Changes

- Introduce a **persisted live Open Play session** per facility Open Play time band (`date` + session `slotId`), with status `UPCOMING` | `LIVE` | `COMPLETED` | `CANCELLED`.
- **Booked seats stay bookings**; players enter the live rotation only after **check-in**. Staff can mark **NO SHOW** or **LEFT SESSION**.
- Replace the static FIFO-only player/admin board UX for live ops with a **live court board** (6 courts: Indoor 1–3, Outdoor 4–6), court states (`AVAILABLE` | `READY` | `PLAYING` | `GAME OVER` | `UNAVAILABLE`), active games with **informational timers**, and an **UP NEXT** queue.
- **End Game** (player on that court with confirmation, or staff) triggers **fair queue rotation** once (finishers to back of queue; longest waiters onto the freed court). Concurrent end-game requests MUST NOT double-rotate.
- **Player Open Play tab** prioritizes personalized status (waiting position / playing court + partners / next game) above the full board; mobile-first stacked courts.
- **Staff dashboard** on the same live model with operational controls (check-in, start/end game, mark courts unavailable, basic overrides). Advanced swap/reorder and score-optional history are phased (see design).
- Keep existing Open Play **capacity 30**, approve/reject, and private-court Indoor|Outdoor booking unchanged. The prior FIFO opening-wave endpoints may remain for pre-live seed/preview but are **not** the live source of truth once a session is `LIVE`.

## Capabilities

### New Capabilities
- `open-play-live-session`: Session lifecycle/status, participants from approved bookings, check-in / no-show / left-session, checked-in counts
- `open-play-live-rotation`: Court board, court states, games + timers, end-game confirmation, fair queue rotation, concurrency-safe completion, UP NEXT queue, player personalized status
- `open-play-live-staff`: Staff operational controls (check-in, no-show, start/end game, mark unavailable, assign/reassign within safe rules, manual override hooks)

### Modified Capabilities
- `booking-api`: Clarify that Open Play bookings reserve session seats (not courts); live participation is gated by check-in on the live session; capacity counting remains pending+approved as today

## Impact

- **In scope:** `api` (`./backend`), `web` (`./app`), `plans` (this OpenSpec change)
- **Out of scope:** `support`; private court booking UX; changing `OPEN_PLAY_CAPACITY` (30) or court count (6); skill matchmaking; auto-end by score or timer; WebSocket productization in v1 (polling acceptable); marketing site; score entry UI; full game-history browser; rich drag-reorder queue UI
- **Must not break:** Open Play create/approve/reject; occupancy and open-play-sessions counts; capacity 30 counting pending+approved; private-court Indoor|Outdoor toggle; existing FIFO board endpoints until live UI fully replaces them for `LIVE` sessions
- **Touches:** new Prisma models (session/participant/court/game/queue), bookings module or dedicated `open-play` module, OpenAPI, player `/app/open-play`, admin Open Play dashboard, TanStack Query polling, concurrency tests
- **Relation to FIFO change:** Static FIFO board (approved booking order → foursomes) may seed the first wave when a session goes `LIVE`; thereafter rotation state is persisted and authoritative
