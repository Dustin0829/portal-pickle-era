## Why

Facility settings (plan prices, Open Play sessions, payment methods + QR, preSignup) live in Zustand `persist` (`pickle-era-facility-settings`). That makes Admin Settings **per browser**: desktop can show three payment methods while a phone falls back to default GCash-only. Shared facility config must be server-owned so every device and guest booker sees the same prices, sessions, and pay channels.

## What Changes

- Persist facility settings in **Postgres** (Prisma) as the source of truth
- **API:** public (or session-optional) read of settings used by booking/pricing/wallet; **admin** update for prices, Open Play slots, payment methods, and preSignup
- Store payment QR images via existing **presigned uploads** (`imageKey` + signed URL), not bloated data URLs in the DB
- **Web:** Admin Settings + Pricing + BookingModal + Wallet + Open Play consumers load/save via API (React Query); **remove** Zustand persist for facility settings (no localStorage as source of truth)
- Backend booking/Open Play paths **read** configured prices and sessions from DB instead of only hard-coded defaults
- One-time seed of defaults matching current `PLAN_META` / default Open Play hours / default GCash
- **Out of scope:** multi-facility tenancy; migrating each user’s localStorage automatically; deleting legacy `pickle-era-bookings` / waitlist / auth local helpers (separate cleanup)

## Capabilities

### New Capabilities

- `facility-settings`: Server-backed facility config — plan prices, Open Play sessions, payment methods (with QR), preSignup; admin write + shared read; web stops using Zustand persist as source of truth

### Modified Capabilities

- (none in `openspec/specs/` — main specs are empty; payment/Open Play behavior today lives only in archived change deltas)

## Impact

- **In scope:** `api` (`backend`), `web` (`app`), `plans`
- **Out of scope:** `support`
- **Touches:** `facilitySettingsStore`, Admin Settings, `planPrices` / `openPlaySlots` / `paymentSettings` hooks, BookingModal, Pricing, Wallet; new `backend/src/modules/facility-settings/` (or equivalent); Prisma migrate; OpenAPI; bookings service defaults for price/sessions
- Branch prefix: `feat/facility-settings-api`
- **Deploy:** API migrate + seed → deploy API → deploy web (brief window: web still local until cutover)
