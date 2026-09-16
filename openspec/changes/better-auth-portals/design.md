## Context

Custom auth lives in `backend/src/modules/auth/` (`pe_session` HttpOnly cookie, bcrypt password hashes, Prisma `User` + `Session`). Web uses Axios `withCredentials: true` against `VITE_API_URL`. Product admin routes use `protectProductAdmin` (cookie `role=admin`, else Basic Auth / open-local).

Production hosts are live: web `https://pickleera.co`, API `https://api.pickleera.co`, with `API_CORS_ORIGIN` and `VITE_API_URL` already pointed. Cookie `SameSite=lax` without a shared apex `Domain` is insufficient for reliable cross-subdomain sessions; portals can look empty while DB rows exist.

**In-scope package rule indexes (cite, do not paste):**
- API: `backend/.cursor/skills/SKILL.md` → `core/module-boundaries.mdc`, `platform/platform-patterns.mdc`, `api/http-api.mdc`, `api/response-contracts.mdc`, `api/api-evolution.mdc`, `data/database.mdc`, `ops/security-secrets.mdc`, `ops/observability.mdc`, `testing/node-testing.mdc`
- Web: `app/.cursor/skills/SKILL.md` → `api/api-layer.mdc`, `api/zod-validation.mdc`, `state/data-ownership.mdc`, `security/` auth-related rules as applicable, `testing/`

## Goals / Non-Goals

**Goals:**
- Replace custom session/password stack with Better Auth (email/password) + Prisma adapter
- Preserve product behaviors: signup/login/logout, current user, patch name, `student`/`admin` roles, admin cookie gate
- Production cookies via `crossSubDomainCookies` on `.pickleera.co`
- SPA continues credentialed calls; portals restore session from API

**Non-Goals:**
- OAuth / passkeys / magic link / email verification delivery
- Real forgot-password email flow (UI stubs may remain)
- Changing booking/waitlist domain logic
- `support` package
- Multi-tenant org model

## Decisions

### 1. Better Auth as the auth engine (full replace)
- **Choice:** Adopt `better-auth` with Prisma adapter; delete custom `auth.crypto` session tokens and `pe_session` issuance path.
- **Why:** Maintained session/cookie stack; fits Express + Prisma; matches founder decision for full replace.
- **Alternatives:** Patch cookie Domain/`SameSite=None` on custom auth (faster but keeps bespoke crypto); Auth.js (heavier SPA coupling).

### 2. Mount path and SPA contract
- **Choice:** Keep product routes at `/auth/signup`, `/auth/login`, `/auth/logout`, `/auth/me`, `PATCH /auth/me` as **Express compatibility wrappers** that call Better Auth APIs (or Prisma for name patch) and return the existing **`sendSuccess` envelope** (`{ success, data, message }`). Signup remains **201**. Mount any Better Auth native handler only for paths the wrappers need, not as a raw drop-in that bypasses the envelope (Axios unwraps `success`/`data`).
- **Why:** SPA client already unwraps the product envelope; changing that is a wider regression.
- **Alternatives:** Switch SPA to Better Auth client default JSON shapes (more frontend rewrite).

### 3. Schema: Better Auth tables + keep `User.role`
- **Choice:** Migrate Prisma schema to Better Auth’s expected models (`user`/`session`/`account`/`verification` as required by the adapter version), map existing `User` fields, keep `role` as an additional field (`student` | `admin`). Drop or replace the custom `Session.tokenHash` model with Better Auth’s session model.
- **Why:** Adapter compatibility; product RBAC already depends on `role`.
- **Alternatives:** Parallel custom Session + BA (rejected — dual sources of truth).

### 4. Password / existing users migration
- **Choice:** Treat early prod as resettable: re-seed admin/demo users with Better Auth hashing after migrate. Do **not** attempt opaque bcrypt hash import unless Better Auth documents a compatible path during implement — if compatible, prefer import; otherwise document forced password reset via seed.
- **Why:** Few/no real end users yet; avoids brittle hash porting.
- **Alternatives:** Custom password hasher bridge (extra complexity).

### 5. Production cookie + env
- **Choice:**
  - `BETTER_AUTH_URL` / `baseURL` = `https://api.pickleera.co` in prod; localhost API origin in dev
  - `trustedOrigins` = `https://pickleera.co` (+ localhost web origins from `API_CORS_ORIGIN` in dev); **no `www`** unless DNS adds it later
  - `API_CORS_ORIGIN` stays the source of allowed browser origins; keep web apex listed
  - `AUTH_COOKIE_DOMAIN=.pickleera.co` in production enables `crossSubDomainCookies`; unset in local/dev
  - `BETTER_AUTH_SECRET` **required** whenever auth runs (validate in `env.ts`; fail fast if missing in production)
- **Why:** Option A hosts already live; avoids second cookie pass.
- **Alternatives:** Proxy API under same host (not chosen); `SameSite=None` without shared Domain (Safari pain).

### 6. Session loading for Express routes
- **Choice:** Replace `loadSession` / `requireSession` to resolve the Better Auth session from the request cookie and populate `req.authUser` with the public DTO (including `role`). Keep `protectProductAdmin` structure (admin role → next; else Basic Auth fallback). Expired/invalid cookies → treat as logged out (`req.authUser` unset; `requireSession` → 401).
- **Why:** Bookings `/me/*` and admin gates already use `req.authUser`.

### 7. `PATCH /auth/me` stays Express + Prisma
- **Choice:** Thin authenticated Express route updates `name` only via Prisma; does not change email/role; sessions remain Better Auth–managed.
- **Why:** Small surface; matches current OpenAPI; avoids waiting on a BA profile plugin.
- **Alternatives:** Better Auth user-update plugin (more coupling).

### 8. Legacy `pe_session` cookie
- **Choice:** Stop issuing `pe_session`. On login/logout success responses, clear any leftover `pe_session` cookie (path `/`, and with `Domain=.pickleera.co` when that domain is configured) so browsers do not keep a dead cookie.
- **Why:** Avoid confusing dual cookies after cutover.

### 9. Web client
- **Choice:** Keep Axios feature module and envelope unwrap. AuthProvider continues `getMe` on boot. Production build uses `VITE_API_URL=https://api.pickleera.co`.
- **Why:** Matches `api-layer` / existing portal guards.

### 10. Deploy order
1. Set Railway secrets (`BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, `AUTH_COOKIE_DOMAIN=.pickleera.co`)
2. Deploy API with migrate
3. Re-seed admin
4. Deploy web if client changes
5. Smoke: login on `pickleera.co` → `/admin/bookings` shows DB rows

## Risks / Trade-offs

- **[Risk] Schema migration breaks existing sessions** → Mitigation: expected; users re-login; re-seed admin; short maintenance window.
- **[Risk] Better Auth default paths/DTO differ from SPA** → Mitigation: compatibility wrappers + `sendSuccess` envelope + contract tests; OpenAPI update.
- **[Risk] Cookie Domain misconfig logs users out of apex-only paths** → Mitigation: env-gated `AUTH_COOKIE_DOMAIN`; verify with browser Application tab on prod hosts.
- **[Risk] Password hash incompatibility** → Mitigation: re-seed strategy documented in tasks/railway-deploy.md.
- **[Risk] Dual auth during rollout** → Mitigation: single cutover PR; no long-lived dual stack; clear legacy `pe_session`.
- **[Risk] Bookings session attach regresses** → Mitigation: keep `req.authUser` contract; regression test `GET /me/bookings` with BA session.

## Migration Plan

1. Land schema migration + Better Auth wiring behind one PR.
2. Deploy API; run migrations; `pnpm db:seed` via Railway against prod DB.
3. Confirm `Set-Cookie` includes `Domain=.pickleera.co; Secure; HttpOnly`.
4. Login as seeded admin; hit `/admin/bookings` and `/admin/waitlist`.
5. **Rollback:** Redeploy previous API image and restore DB from backup if migration is irreversible without restore; keep migration reversible where Prisma allows (prefer additive then drop custom session in same change only if tested).

## Open Questions

- Exact Better Auth Prisma schema field names for the pinned package version (follow package docs at implement time — not a product decision).
