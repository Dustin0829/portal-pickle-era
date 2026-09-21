## Context

Today Admin Settings writes to `useFacilitySettingsStore` with Zustand `persist` (`pickle-era-facility-settings`): plan prices, Open Play slots, `paymentMethods[]` (QR as data URLs), and `preSignup`. BookingModal, Pricing, Wallet, and Open Play helpers read that store. Backend booking still uses `DEFAULT_PLAN_PRICE_PESOS` and `DEFAULT_OPEN_PLAY_SESSIONS` unless the client sends `unitPricePesos`. Food menu already uses S3 keys + admin CRUD — reuse that upload pattern for payment QRs.

**Rule cites:** `backend/.cursor/skills/SKILL.md` → `module-boundaries.mdc`, `data/database.mdc`, `api/http-api.mdc`, `api/role-based-access` / `platform-patterns.mdc`, `integrations/file-uploads.mdc`, `testing/node-testing.mdc`; `app/.cursor/skills/SKILL.md` → `api/api-layer.mdc`, `state/data-ownership.mdc`, `state/async-ui.mdc`, `pages/page-composition.mdc`, `testing/vitest-testing.mdc`.

## Goals / Non-Goals

**Goals:**
- Single DB-backed facility settings document (or normalized tables) for prices, Open Play sessions, payment methods, preSignup
- Public GET + admin PATCH (or PUT)
- Web: React Query as cache; remove persist middleware for facility settings
- Bookings service reads Open Play sessions + default unit prices from settings when computing capacity/totals

**Non-Goals:**
- Multi-facility / tenant settings
- Auto-import each browser’s localStorage into DB
- Reworking Food menu CMS
- Deleting unrelated legacy localStorage helpers (`pickle-era-bookings`, waitlist, demo auth) in this change
- Changing wallet debit or booking approve semantics beyond using shared prices/sessions

## Decisions

1. **Shape — singleton `FacilitySettings` row** (id fixed e.g. `default`) with JSON columns or related tables:
   - Prefer: `FacilitySettings` with `planPrices` JSON, `openPlaySessions` JSON, `preSignup` bool; `FacilityPaymentMethod` rows (`id`, `label`, `name`, `number`, `qrImageKey`, `sortOrder`) for queryable methods and smaller rows.
   - **Rejected:** Keep everything only in localStorage; multi-row “settings history” (YAGNI).

2. **QR storage** — `qrImageKey` via existing `/uploads/presign` + object storage; GET returns `qrImageUrl` (presigned download). Stop storing `qrImageDataUrl` in API/DB. Admin UI switches from FileReader data URL to upload flow (same as Food menu photos).

3. **API surface**
   - `GET /facility-settings` (or `/settings/facility`) — public read, no auth required (guests book).
   - `PATCH /admin/facility-settings` — admin only; partial update of prices / sessions / methods / preSignup.
   - **Payment methods replace semantics:** when `paymentMethods` is included in PATCH, the full list replaces the prior list (order = array order / `sortOrder`). Omitting the field leaves methods unchanged.
   - **Validation:** reject empty `paymentMethods` array; reject invalid Open Play hours/durations; reject non-positive plan prices.
   - **Concurrency:** last successful PATCH wins (no ETag required in v1).
   - OpenAPI + Zod; DTO mappers, no raw Prisma on wire.

4. **Seed** — On migrate or first GET, ensure defaults: court 300 / open-play 250 / clinic 500 (pesos), Open Play 07:00/16:00/18:00 × 2h, one GCash placeholder method (label/name/number from current `PAYMENT` constants). Admin replaces placeholder after deploy.

5. **Web cutover** — Replace store reads with `useFacilitySettings` query; Admin save → mutation → invalidate. Remove `persist` from the store or delete the store and use query cache only. Optional one-release: ignore localStorage key if present.

6. **Backend consumers** — `open-play-sessions` / booking create: load sessions from settings (fallback to `DEFAULT_OPEN_PLAY_SESSIONS` if missing). Prefer server unit price from settings when client omits `unitPricePesos` (keep client override optional for back-compat this release).

7. **preSignup** — Persist for parity with current Admin UI; marketing Book CTAs remain booking-modal driven (toggle may stay unused for CTAs — document).

## Risks / Trade-offs

- [Deploy race: web before API] → Deploy API+migrate first; web tolerates fetch error with last-known or hard-coded fallback briefly
- [Lost per-browser admin drafts] → Document: re-enter payment methods once in Admin after ship
- [Large QR in localStorage today] → Upload to S3; reject oversized files per uploads rules
- [Open Play session drift vs hard-coded expand helper] → Single read path from settings into expand/overlap logic
- [Public GET exposes account numbers] → Already public on booking pay today; accept for v1 (HTTPS only)

## Migration Plan

1. Prisma models + migrate + seed defaults  
2. Ship API GET/PATCH + OpenAPI + tests  
3. Point bookings Open Play / default prices at settings  
4. Ship web query/mutation; Admin upload QR via presign; remove persist  
5. Rollback: revert web to store (or previous build); API tables can remain unused  

## Open Questions

- None blocking. Assumption: single facility; no automatic localStorage import; QR via S3 keys.
