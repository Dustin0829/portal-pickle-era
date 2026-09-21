## Why

Open Play ↔ court overlap shipped as mutual blocking, but ops want **one-way** only: Open Play blocks court rent hours, while court bookings must not disable Open Play sessions. Court rent UI also shows blocked Open Play hours as grey strikethrough instead of a clear “Reserved for Open play” treatment. Separately, all Resend transactional emails are plain HTML with no Pickle Era branding (logo, yellow CTA).

## What Changes

- **One-way overlap:** Keep Open Play → facility-wide court/clinic hour blocks. **Remove** court/clinic → Open Play session blocks (API create path + Open Play booking UI “Court booked” state).
- **Court rent reserved UI:** Hours covered by a pending/approved Open Play booking show **yellow background, black text**, label **“Reserved for Open play”** (not grey line-through alone).
- **Branded emails:** Shared HTML email layout for every Resend send (payment-received, player invite, password reset): logo from `PUBLIC_APP_URL/logo.png` (`app/public/logo.png`), brand yellow CTA button (`#f5ed5a` / `--color-yellow`), consistent header/footer; plain-text fallbacks unchanged in intent.

## Capabilities

### New Capabilities

- `transactional-email-branding`: Shared Pickle Era HTML shell (logo, yellow button, footer) applied to all Resend transactional emails

### Modified Capabilities

- `booking-slot-overlap`: Change mutual cross-plan block to **Open Play blocks court only**; update occupancy/UI requirements for reserved court-hour presentation and remove Open Play “blocked by court” behavior

## Impact

- **Repos in scope:** `api` (`backend` — `assertNoCrossPlanSlotConflict`, Resend helpers/tests), `web` (`app` — `BookingModal` court/Open Play slot states; portal calendar if it mirrors overlap), `plans` (this change)
- **Out of scope:** `support`; new email types beyond the three existing sends; React Email package unless needed; hosting logo outside SPA public URL; changing Open Play capacity rules
- **Depends on:** `PUBLIC_APP_URL` (or CORS fallback) so logo/CTA links resolve in production
- **Related shipped change:** `portal-slots-wallet-food` (mutual overlap + food/wallet) — this change narrows overlap and adds branding
- **Must not break:** Open Play capacity-30; wallet apply/debit on booking; food orders; invite-only-on-new-user and password-reset flows; hour-expansion helper (`durationHours` default 2); Open Play → court facility-wide hour blocks
