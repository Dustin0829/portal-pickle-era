## 1. api — food orders

- [ ] 1.1 Prisma `FoodOrder` + `FoodOrderLine` (+ optional menu seed); migrate (`data/database.mdc`)
- [ ] 1.2 Stub menu constant or seed (`core/ponytail-rules.mdc`)
- [ ] 1.3 Food module: student list menu + create order; admin list + PATCH status (`add-feature-module/SKILL.md`, `api/http-api.mdc`, `api/role-based-access.mdc`)
- [ ] 1.4 Wallet debit path in same txn when `payMode=wallet`; counter skips debit (`data/concurrency.mdc`)
- [ ] 1.5 Tests: counter order; wallet success; insufficient funds; status forward only (`testing/`)
- [ ] 1.6 OpenAPI regen/check
- [ ] 1.7 Mid-apply: `cd backend &&` kit `verify_fast`
- [ ] 1.8 Full `cd backend && pnpm verify` + merge-readiness before ship

## 2. web — Food tab + admin inbox

- [ ] 2.1 API client + Zod (`api/api-layer.mdc`)
- [ ] 2.2 Student Food page + nav (`pages/page-layout.mdc`, `security/route-protection.mdc`, `copy/ui-microcopy.mdc`)
- [ ] 2.3 Admin Food orders inbox + nav (`pages/page-composition.mdc`, `state/async-ui.mdc`)
- [ ] 2.4 Vitest smoke for menu/order client or page (`testing/vitest-testing.mdc`)
- [ ] 2.5 Mid-apply: `cd app &&` kit `verify_fast`
- [ ] 2.6 Full `cd app && pnpm verify` + merge-readiness before ship

## 3. plans

- [ ] 3.1 Align artifacts if Phase 2 wallet API names differ
- [ ] 3.2 `openspec validate player-food-orders`

## 4. Ship

- [ ] 4.1 `/opsx-verify` (api + web)
- [ ] 4.2 `/opsx-pr` (branch `feat/player-food-orders`; after Phase 2 on main preferred)
