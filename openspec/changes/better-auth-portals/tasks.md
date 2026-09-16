## 1. api

- [x] 1.1 Add `better-auth` (+ Prisma adapter deps as required); extend `env.ts` for `BETTER_AUTH_SECRET` (required in production), `BETTER_AUTH_URL`, `AUTH_COOKIE_DOMAIN`; document in `.env.example` / `docs/environment.md` / `docs/railway-deploy.md` (`ops/security-secrets.mdc`)
- [x] 1.2 Migrate Prisma schema to Better Auth models; keep `User.role` (`student` | `admin`) and booking relations; replace custom `Session.tokenHash` model (`data/database.mdc`)
- [x] 1.3 Configure Better Auth (baseURL, secret, trustedOrigins from CORS/web origins, email/password, `crossSubDomainCookies` when `AUTH_COOKIE_DOMAIN` set) (`platform/platform-patterns.mdc`, `api/http-api.mdc`)
- [x] 1.4 Express compatibility wrappers for `/auth/signup|login|logout|me` + `PATCH /auth/me` using `sendSuccess` envelope (signup `201`); patch name via Prisma only; clear legacy `pe_session` on login/logout (`api/response-contracts.mdc`, `api/api-evolution.mdc`)
- [x] 1.5 Replace `loadSession` / `requireSession` to populate `req.authUser` from Better Auth session (expired → logged out); keep `protectProductAdmin` admin-role + Basic Auth fallback (`core/module-boundaries.mdc`)
- [x] 1.6 Remove obsolete custom session crypto/`pe_session` issuance; update OpenAPI + regenerate `contracts/openapi.json`
- [x] 1.7 Update seed to create admin/students via Better Auth–compatible password hashing; document re-seed after migrate
- [x] 1.8 Tests: signup/login/me/logout (+ logout without session), invalid login 401, envelope shape, admin gate with admin session, `GET /me/bookings` 401 vs authorized, cookie Secure/Domain where practical (`testing/node-testing.mdc`)
- [x] 1.9 Mid-apply: `pnpm format:check && pnpm lint && pnpm typecheck` in `./backend`

## 2. web

- [x] 2.1 Confirm `app/src/api/features/auth` still unwraps product envelope; adjust only if paths/fields drift; keep `withCredentials` (`api/api-layer.mdc`, `api/zod-validation.mdc`)
- [x] 2.2 AuthProvider + portal guards continue to use API `getMe` / role; session expiry surfaces as logged-out (`state/data-ownership.mdc`, `security/frontend-security.mdc`)
- [x] 2.3 Update auth-related tests (portal access, login/signup) for API-backed session
- [x] 2.4 Mid-apply: `pnpm format:check && pnpm lint && pnpm exec tsc -b --noEmit` in `./app`

## 3. plans

- [x] 3.1 Keep proposal / design / specs / tasks aligned if apply discovers gaps
- [x] 3.2 `openspec validate` for this change when artifacts edit

## 4. Ship

- [x] 4.1 Branch `feat/better-auth-portals` from repo root
- [x] 4.2 Set Railway prod vars (`BETTER_AUTH_SECRET`, `BETTER_AUTH_URL=https://api.pickleera.co`, `AUTH_COOKIE_DOMAIN=.pickleera.co`); confirm `API_CORS_ORIGIN` / `VITE_API_URL`
- [ ] 4.3 Deploy API (migrate) → re-seed admin → deploy web if needed → smoke login on `https://pickleera.co` and `/admin/bookings`
- [x] 4.4 `/opsx-verify` (api + web `pnpm verify` + merge-readiness)
- [x] 4.5 `/opsx-pr` (one monorepo PR)
