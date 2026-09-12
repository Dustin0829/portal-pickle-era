## Why

Activity logs now make production HTTP and job traffic visible in the support SPA — including partial-update patterns, body size, redaction gaps, and abuse signals. Without a scheduled hunter/fixer pair, those signals stay buried in Timescale until someone manually scrolls the UI. We need a daily anomaly agent that digests Discord, files CRITICAL Workspace cards, and a sibling Fixer that turns Ready cards into PRs (redact keys, envelope paths, sampling, hygiene) without inventing unrelated product scope.

## What Changes

- Add **Activity-logs hunter** (Cursor Automation, daily ~08:00 Manila): read-only queries against the Timescale activity store; Discord embed digest; file **CRITICAL** findings only (day 1) on **Bugs & Improvements (AI Quality Assurance Agent)** → **Backlog**; never open PRs.
- Add **Activity-logs fixer** (scheduled / Ready-queue): ground-check Ready (+ answered Needs Human Judgement) cards labeled for activity logs; implement surgical fixes in backend; Discord banner; never merge; never pick Backlog.
- Add Cursor skills (backend canonical + overlay run-loop pointers), filing gate, Discord voice, and Workspace card shape.
- Add backend Cursor rule `activity-logs.mdc` (prevent layer): partial mutation bodies, envelope paths for high-PII 2xx, maintain `PII_KEYS` / secret keys when adding sensitive fields; extend merge-readiness with an activity-log hygiene check when capture/redact/sampling changes.
- Strengthen activity capture: PII redaction keys, compaction, envelope responses, smart GET sampling (slow/error only).
- Document read-only `LOGS_DATABASE_URL` as the Automation secret for the hunter — **not** app `DATABASE_URL`.
- **No BREAKING** API changes. No new public HTTP routes required for v1 (agents use SQL + Workspace MCP + Discord webhook).

## Capabilities

### New Capabilities
- `activity-logs-anomaly-agents`: Scheduled hunter/fixer pair for activity-store anomalies (PII leak in persisted bodies, abuse/error spikes, job failure spikes, API hygiene IMPROVE signals in digest); Discord + Workspace filing policy; ground-check Fixer stance.

### Modified Capabilities
- `activity-logs`: Normative requirements that redaction key sets and envelope paths stay maintainable when new high-PII routes ship; persisted store remains the source of truth the hunter queries.

## Impact

| Area | In scope? |
|------|-----------|
| **backend** | Skills, `activity-logs.mdc`, merge-readiness checklist row, redact/sampling/capture hardening, ops runbook |
| **support** | Out of scope unless fixer card cites parallel admin 401 client hygiene |
| **openspec** | This change + specs |
| **solo-founder-workspace** | Ticket board via MCP — cards created by hunter |
| **Timescale logs DB** | Read-only role for hunter; no schema change |
| **Discord** | Webhook usernames `Activity-logs hunter` / `Activity-logs fixer` |

### Non-goals

- No auto-merge; no production promote from Fixer.
- No day-1 tickets for HIGH/IMPROVE (digest only); CRITICAL only to Backlog.
- No rewriting public response DTOs unless a Ready card + human policy says so.
- No k6 / load tests.

### Must not break

- Support activity logs list/detail and existing redaction/envelope/sampling behavior for users.
- Fail-open activity ingest (hunter/fixer MUST NOT make capture fail closed).
