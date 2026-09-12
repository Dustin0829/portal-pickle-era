---
name: add-external-integration
description: >-
  Add a third-party integration (Stripe, OpenAI, email, SMS) — src/lib client,
  env vars, service/job wiring, timeouts, idempotency, and cost protection. Use
  when adding Stripe, OpenAI, Anthropic, email, webhooks, or any billable vendor.
---

# Add external integration

Golden references: `src/lib/storage/r2.ts`, `src/lib/observability/discord-alert.ts`.

Read `external-dependencies.mdc`, `api-protection.mdc`, and `async-reliability.mdc` before coding.

## 1. Decide sync vs async

| Work type                     | Pattern                                                                  |
| ----------------------------- | ------------------------------------------------------------------------ |
| Fast, cheap, read-only        | `src/lib/<vendor>/` called from service (with timeout)                   |
| Slow, billable, or unreliable | Enqueue `*.job.ts` — HTTP returns `202` / pending (`api-protection.mdc`) |
| Inbound webhook               | `*.routes.ts` raw body + signature verify → service dedupe               |

Never block HTTP on OpenAI, email, SMS, or multi-second vendor calls.

## 2. Environment (`src/app/env.ts`)

- Add vars to `envSchema` — optional with `.optional()` when integration is not required locally.
- Never read `process.env.VENDOR_*` outside `env.ts` (`security-secrets.mdc`).

## 3. Client (`src/lib/<vendor>/`)

```
src/lib/openai/client.ts
src/lib/stripe/client.ts
src/lib/email/send.ts
```

- Construct SDK/fetch client here — not in modules.
- Set **timeouts** on every outbound call (`AbortSignal.timeout` or SDK option).
- Structured errors + logging: `provider`, `operation`, `durationMs` (`observability.mdc`).
- Never log secrets (`security-secrets.mdc`).

## 4. Service layer

- Module `*.service.ts` orchestrates — calls `src/lib/<vendor>/` functions.
- Billable actions: check quota / `Idempotency-Key` before vendor call (`api-protection.mdc`).
- Payment writes: provider idempotency key + DB unique constraint (`async-reliability.mdc`, `concurrency.mdc`).

## 5. Optional job (`<feature>.job.ts`)

When work is async:

1. `createOptionalQueue` in `<feature>.queue.ts`
2. Handler in `<feature>.job.ts` — idempotent start (`async-reliability.mdc`)
3. Worker options: `concurrency`, `attempts`, backoff (`worker-scaling.mdc`)
4. Register in `src/worker/index.ts` and `register-queues.ts`

## 6. Webhooks (inbound)

1. Verify signature in route or dedicated middleware
2. Dedupe by provider event ID before side effects (`async-reliability.mdc`)
3. Scope tenant if payload includes org — `multi-tenant-safety.mdc`

## 7. Tests

- Mock `src/lib/<vendor>/` at service boundary — do not hit real APIs in unit tests.
- Redis optional (`node-testing.mdc`).

## 8. Finish

```bash
pnpm verify
```

Document quota/rate-limit plan in PR if endpoint is public or billable.

## Checklist

- [ ] Client in `src/lib/<vendor>/` with timeout
- [ ] Env vars only in `env.ts`
- [ ] No vendor imports in controllers
- [ ] Billable work → job + quota (not bare `POST /generate`)
- [ ] Retries only when idempotent
- [ ] Webhooks verified + deduped
