## Why

Production portals sit on `https://pickleera.co` with the API on `https://api.pickleera.co`, but auth still uses a custom `pe_session` cookie (`SameSite=lax`, no shared apex domain). Admin/student sessions often fail to attach across hosts, so portals show empty lists even when Postgres has rows. Replacing the custom auth stack with Better Auth (email/password + Prisma) and apex cookie config fixes sessions and gives a maintainable auth core.

## What Changes

- **BREAKING:** Remove custom session crypto/cookie (`pe_session`) and the hand-rolled Prisma `Session` token-hash flow; sessions become Better Auth–managed.
- **BREAKING:** Auth HTTP surface moves onto Better Auth handlers (mounted under `/auth`), with thin compatibility so the SPA keeps signup / login / logout / me / patch-me behaviors and the same public user DTO (`id`, `name`, `email`, `role`).
- Add Better Auth + Prisma adapter; migrate schema for Better Auth tables/fields while preserving `User.role` (`student` | `admin`) and booking relations.
- Production cookies: `crossSubDomainCookies` with `domain=.pickleera.co`, `Secure`; `trustedOrigins` / CORS include `https://pickleera.co`.
- Wire `protectProductAdmin` / `loadSession` to Better Auth session resolution (keep Basic Auth fallback for ops tools).
- Update web auth client + provider to Better Auth cookie sessions against `VITE_API_URL` (`https://api.pickleera.co` in prod).
- Update seed so demo admin/students work with Better Auth password hashing; document Railway env (`BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`).
- Refresh backend auth docs / OpenAPI for the new auth behavior.

## Capabilities

### New Capabilities

- `auth-api`: Email/password auth, session cookies (including production cross-subdomain), current-user + profile name update, role-aware session for product admin gates. (Main `openspec/specs/` has no archived auth capability yet; this is the canonical auth-api contract going forward.)

### Modified Capabilities

- (none in `openspec/specs/` — store has no archived main specs yet)

## Impact

- **In scope:** `api` (`./backend`), `web` (`./app`), `plans` (this change)
- **Out of scope / non-goals:** `support` package; OAuth/social login; email verification / magic link / password-reset delivery (forgot-password UI may remain stub); workspace hub; changing booking/waitlist business rules beyond auth dependency; `www.pickleera.co` (apex-only unless DNS adds www later)
- **Packages:** `backend` auth module, Prisma schema/migrations, middleware, OpenAPI, seed, env docs; `app` auth API feature, AuthProvider, portal guards
- **Runtime:** Railway prod already on `pickleera.co` + `api.pickleera.co`; deploy API (migrate) before relying on new cookies; redeploy web if client auth paths change
- **Data:** Existing custom `sessions` rows and password hashes need an explicit migration or re-seed strategy (design)
- **Must not break:** `sendSuccess` response envelope for SPA auth calls; `GET /me/bookings` and public `POST /bookings` session attachment via `req.authUser`; Basic Auth / open-local fallback on `protectProductAdmin`; public user DTO fields (`id`, `name`, `email`, `role`)
