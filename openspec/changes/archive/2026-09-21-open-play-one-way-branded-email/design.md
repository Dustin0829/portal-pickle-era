## Context

`portal-slots-wallet-food` shipped **mutual** cross-plan blocking: Open Play bookings block covered court hours facility-wide, and court/clinic hours block overlapping Open Play sessions. Product feedback: only the first direction is desired. Court rent UI currently greys/strikethroughs Open Play-held hours with a muted “Open play” caption; ops want yellow + black **“Reserved for Open play”**.

Transactional mail lives in `backend/src/lib/resend/client.ts` as three hand-built HTML strings (`sendBookingPaymentReceivedEmail`, `sendPlayerInviteEmail`, `sendPasswordResetEmail`) with no shared chrome. Logo asset is already at `app/public/logo.png` (served as `/logo.png` on the SPA). Brand yellow token: `--color-yellow: #f5ed5a` in `app/src/index.css`.

## Goals / Non-Goals

**Goals:**

- Enforce Open Play → court/clinic hour conflicts only (API + web)
- Court rent reserved styling for Open Play-held hours
- Shared branded HTML wrapper for all three Resend emails (logo + yellow CTA + footer)

**Non-Goals:**

- Changing Open Play capacity (30) or hour-expansion helper semantics
- React Email / MJML dependency unless a tiny inline helper proves insufficient
- New email product types (approvals-without-invite, food order receipts, etc.)
- `support` package
- Hosting logo on a CDN separate from `PUBLIC_APP_URL`

## Decisions

1. **One-way conflict in API** — Keep the `plan !== "open_play"` branch that rejects court/clinic when expanded Open Play hours overlap. Delete (or no-op) the `plan === "open_play"` branch that queries court/clinic blockers. Rationale: matches product; avoids silent double-booking of courts during Open Play while still allowing OP seats when someone already rented a court hour. Alternative considered: keep mutual block — rejected by ops.

2. **UI mirrors API** — Remove `sessionsBlockedByCourt` / “Court booked” from Open Play session buttons in `BookingModal`. Audit `WalkInBookingModal` / `CourtDayGrid` for the same patterns; change only if they implement cross-plan disable (today they may not). Keep `hoursBlockedByOpenPlay` for court hours; restyle `openPlayHold` to `bg-yellow text-black` + exact label `Reserved for Open play`. If both `openPlayHold` and a court `hold` apply, court hold UI wins. Cite: `app/.cursor/rules/state/async-ui.mdc`, `app/.cursor/rules/pages/page-composition.mdc`.

3. **Email layout helper** — Add a small pure `renderBrandedEmail({ bodyHtml, cta?: { href, label } })` (or equivalent) in `backend/src/lib/resend/` that wraps content in table-based, email-safe HTML (inline styles). Logo: `${resolvePublicAppUrl()}/logo.png`. Button: background `#f5ed5a`, color `#000`, labels **View site** / **Log in** / **Reset password**. Callers pass already-escaped `bodyHtml` (reuse `escapeHtml`). Do not add React Email unless inline HTML becomes unmaintainable. Cite: `backend/.cursor/rules/integrations/external-dependencies.mdc`.

4. **CTA targets** — Payment-received → `resolvePublicAppUrl()`; invite → `/login`; reset → existing reset URL with token. Body copy stays; branding is chrome + button, not a rewrite of policy text.

5. **Tests** — Backend: assert Open Play create succeeds when court hour occupied; court create still conflicts on OP; HTML snapshots/string asserts for logo URL + yellow button markers on all three send helpers. Web: Vitest for reserved class/label and that OP sessions are not disabled by court occupancy helpers. Cite: `backend/.cursor/rules/testing/`, `app/.cursor/rules/testing/vitest-testing.mdc`.

## Risks / Trade-offs

- [Court rented during Open Play] → Accepted: Open Play is shared-capacity seats; courts may already be rented — ops chose availability of OP over mutual exclusivity.
- [Logo broken in email clients if PUBLIC_APP_URL wrong] → Document `PUBLIC_APP_URL` in deploy notes; absolute URL required; text + CTA still work if image fails.
- [Email client CSS quirks] → Prefer table + inline styles; avoid flex/grid in email HTML.
- [PR #14 mutual-block still on branch] → This change supersedes that behavior; land after or amend overlap specs accordingly.

## Migration Plan

1. Ship API one-way conflict + branded email helpers together with web reserved UI.
2. No DB migration.
3. Confirm production `PUBLIC_APP_URL` points at the SPA that serves `/logo.png` (see `backend/docs/railway-deploy.md`).
4. Rollback: revert commit; mutual block and plain emails return.

## Open Questions

- None — CTA labels locked: **View site** / **Log in** / **Reset password**.
