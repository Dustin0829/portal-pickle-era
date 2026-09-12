---
name: activity-logs-hunter
description: >-
  Scheduled hunt over Timescale activity_log: PII/secret leaks, auth/abuse
  anomalies, per-actor traffic, PH off-hours signals, admin 401-before-refresh
  bursts, HTTP/job error spikes, perf/hygiene digests. Files CRITICAL only on
  AI QA Backlog with Activity logs + category label; one Discord embed per run.
  Never opens a fix PR. Sibling of activity-logs-fixer. Overlay owns run loop.
disable-model-invocation: true
---

# Activity-logs hunter (backend)

Hunt **activity-store anomalies** only. Do **not** open fix PRs. Fixes are **Activity-logs fixer**, only from **Ready**.

**Golden code:** `src/lib/activity-logs/redact.ts`, `http-capture.ts`, `sampling.ts`, `schema.ts`, `pool.ts`.

**Workspace run loop:** overlay `activity-logs-hunter` (snapshot → hunt → file CRITICAL → Discord → stop). If overlay and this skill disagree on detectors/filing, **this skill wins**.

**Do not** read `merge-readiness-check` during a scheduled hunt.

## Stance

- Query **only** `LOGS_DATABASE_URL` (read-only). Never product `DATABASE_URL` for detectors.
- Day-1 filing: **CRITICAL → Workspace**; HIGH/IMPROVE → Discord digest only.
- Filing is a claim — Fixer re-grounds Ready cards.
- Never auto-PR. Job failure spikes are observability only — do not infer product ledger semantics.
- Abuse lens: detect hostile or anomalous **logged** traffic (auth hammering, per-IP/user volume, PH off-hours spikes). Not a full SIEM — evidence must come from `activity_log` rows/rates.

## Known issues snapshot (first)

1. `get_board` both **Bugs & Improvements (AI Quality Assurance Agent)** and **Bugs & Improvements (User Reported)** — titles, ticket keys, list names only. No `get_card` for snapshot.
2. Build skip table of **open** cards (list not `Shipped` / `Abandoned`).
3. Same title or same obvious failure → do not file duplicate; still hunt for different holes.

## Window & access

- Primary window: last ~24h ending at run time (Manila morning cron).
- Baseline: ~7d before that when data exists.
- Secret: `LOGS_DATABASE_URL`. If missing/unreachable → Discord unavailable banner; **no tickets**; stop.
- Prefer SQL aggregates + `LIMIT` samples of JSONB. Do not dump entire days of bodies.

## Query playbook (required)

Use `psql "$LOGS_DATABASE_URL" -c '…'` (or equivalent). **Never** `SELECT * FROM activity_log` without a tight `WHERE` + `LIMIT`. **Never** export whole JSONB columns for a day.

### Hard caps

| Cap                     | Value                                                                                                                                                                        |
| ----------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Time filter             | Always `timestamp >= now() - interval '24 hours'` (or the run window); baseline queries use an explicit older range                                                          |
| Aggregate rows returned | `LIMIT 50` after `ORDER BY` (worst offenders)                                                                                                                                |
| Body / payload samples  | **≤ 20 rows** per detector; prefer `LIMIT 5` first                                                                                                                           |
| Columns on samples      | `id, timestamp, kind, method, path, status_code, queue, job_name, job_status, duration_ms, truncated, error` — then **one** of `request`, `response`, or `payload` if needed |
| Forbidden               | `SELECT *` unbounded; `COPY` / `\copy` of full table; paging through all rows; `jsonb_each` over every row in the window                                                     |

### 1) Volume sanity (run first)

```sql
SELECT kind, count(*)::bigint AS n
FROM activity_log
WHERE timestamp >= now() - interval '24 hours'
GROUP BY kind;
```

If this fails or hangs → unavailable path (Discord banner, stop).

### 2) HTTP error spikes (CRITICAL / HIGH)

```sql
-- Window rates by path+method
SELECT method, path,
       count(*)::bigint AS n,
       count(*) FILTER (WHERE status_code >= 400)::bigint AS err_n,
       round(100.0 * count(*) FILTER (WHERE status_code >= 400) / nullif(count(*), 0), 1) AS err_pct
FROM activity_log
WHERE kind = 'http'
  AND timestamp >= now() - interval '24 hours'
GROUP BY method, path
HAVING count(*) >= 20
ORDER BY err_n DESC
LIMIT 50;
```

```sql
-- 7d baseline for the same keys (adjust path/method list from above)
SELECT method, path,
       count(*)::bigint AS n,
       count(*) FILTER (WHERE status_code >= 400)::bigint AS err_n,
       round(100.0 * count(*) FILTER (WHERE status_code >= 400) / nullif(count(*), 0), 1) AS err_pct
FROM activity_log
WHERE kind = 'http'
  AND timestamp >= now() - interval '8 days'
  AND timestamp <  now() - interval '24 hours'
GROUP BY method, path
HAVING count(*) >= 20
ORDER BY err_n DESC
LIMIT 50;
```

Sample only for paths that pass the spike gate (≤ 5 rows):

```sql
SELECT id, timestamp, method, path, status_code, duration_ms, truncated, left(error, 200) AS error
FROM activity_log
WHERE kind = 'http'
  AND timestamp >= now() - interval '24 hours'
  AND method = $1 AND path = $2
  AND status_code >= 400
ORDER BY timestamp DESC
LIMIT 5;
```

### 3) Work-queue failure spikes

```sql
SELECT queue, job_name,
       count(*)::bigint AS n,
       count(*) FILTER (WHERE job_status IN ('failed', 'error') OR error IS NOT NULL)::bigint AS fail_n
FROM activity_log
WHERE kind = 'job'
  AND timestamp >= now() - interval '24 hours'
GROUP BY queue, job_name
HAVING count(*) >= 20
ORDER BY fail_n DESC
LIMIT 50;
```

Sample failures (metadata only first):

```sql
SELECT id, timestamp, queue, job_name, job_status, left(error, 200) AS error
FROM activity_log
WHERE kind = 'job'
  AND timestamp >= now() - interval '24 hours'
  AND queue = $1 AND job_name = $2
ORDER BY timestamp DESC
LIMIT 5;
```

### 4) PII / secret leak samples (CRITICAL)

Do **not** scan every JSONB body. Narrow first, then sample:

1. Prefer high-PII paths (auth, uploads, webhooks, identity routes) from recent aggregates.
2. Pull **≤ 20** rows total across the run for body inspection (split across paths).
3. Inspect keys client-side / in the agent — look for cleartext vs `[REDACTED]`.

```sql
SELECT id, timestamp, method, path, status_code,
       left(request::text, 4000) AS request_snip,
       left(response::text, 4000) AS response_snip
FROM activity_log
WHERE kind = 'http'
  AND timestamp >= now() - interval '24 hours'
  AND path LIKE $1   -- e.g. '%/auth/%' or '%/uploads/%'
ORDER BY timestamp DESC
LIMIT 5;
```

For jobs with sensitive payloads:

```sql
SELECT id, timestamp, queue, job_name, job_status,
       left(payload::text, 4000) AS payload_snip
FROM activity_log
WHERE kind = 'job'
  AND timestamp >= now() - interval '24 hours'
  AND queue = $1
ORDER BY timestamp DESC
LIMIT 5;
```

`left(..., 4000)` is intentional — never pull unbounded `request`/`response`/`payload`.

### 5) HIGH / IMPROVE (digest only)

```sql
-- Truncation / latency outliers (aggregate, not every row)
SELECT method, path,
       count(*)::bigint AS n,
       count(*) FILTER (WHERE truncated)::bigint AS trunc_n,
       percentile_cont(0.95) WITHIN GROUP (ORDER BY duration_ms) AS p95_ms
FROM activity_log
WHERE kind = 'http'
  AND timestamp >= now() - interval '24 hours'
  AND duration_ms IS NOT NULL
GROUP BY method, path
HAVING count(*) >= 20
ORDER BY p95_ms DESC NULLS LAST
LIMIT 30;
```

Fat-body IMPROVE: sample ≤ 5 rows for a candidate path; compare `pg_column_size(request)` vs `pg_column_size(response)` — still with `LIMIT 5`.

### 6) Auth, abuse, and actor anomalies (security lens)

Use aggregates first. **Primary market: Philippines** — treat off-hours as **02:00–05:00 Asia/Manila** (`timestamp AT TIME ZONE 'Asia/Manila'`). Compare window rates to 7d baseline when history exists.

**Auth / authorization paths** (tighten focus before filing CRITICAL):

- `/auth/%`, `/admin/%` (operator tools), `/uploads/%`, webhook paths your product mounts
- Status codes: **401** (unauthenticated), **403** (forbidden), **429** (rate limited)

**Per `remote_addr` (when present) — failed auth hammering:**

```sql
SELECT remote_addr,
       count(*)::bigint AS n,
       count(*) FILTER (WHERE status_code IN (401, 403))::bigint AS auth_fail_n
FROM activity_log
WHERE kind = 'http'
  AND timestamp >= now() - interval '24 hours'
  AND remote_addr IS NOT NULL
  AND (
    path LIKE '/auth/%' OR path LIKE '/admin/auth/%'
    OR path LIKE '/admin/%'
  )
GROUP BY remote_addr
HAVING count(*) FILTER (WHERE status_code IN (401, 403)) >= 30
ORDER BY auth_fail_n DESC
LIMIT 30;
```

**Per `user_id` (when present) — unusual volume (possible account abuse or scraper using a valid session):**

```sql
SELECT user_id, role,
       count(*)::bigint AS n,
       count(DISTINCT path)::bigint AS distinct_paths,
       count(*) FILTER (WHERE status_code >= 400)::bigint AS err_n
FROM activity_log
WHERE kind = 'http'
  AND timestamp >= now() - interval '24 hours'
  AND user_id IS NOT NULL
GROUP BY user_id, role
HAVING count(*) >= 200
ORDER BY n DESC
LIMIT 30;
```

**PH off-hours traffic (digest / CRITICAL only with baseline):**

```sql
SELECT count(*)::bigint AS n,
       count(*) FILTER (WHERE status_code >= 400)::bigint AS err_n
FROM activity_log
WHERE kind = 'http'
  AND timestamp >= now() - interval '24 hours'
  AND extract(hour from timestamp AT TIME ZONE 'Asia/Manila') BETWEEN 2 AND 4;
```

Compare `n` and `err_n` to the same hour-bucket over the prior 7d (aggregate only). **HIGH** digest when off-hours volume is ≥3× baseline; **CRITICAL** only if combined with auth-fail spike thresholds on auth paths in that window.

**Scanner / enumeration (HIGH digest):** many distinct paths, mostly 404/401, same `remote_addr` in 24h:

```sql
SELECT remote_addr,
       count(DISTINCT path)::bigint AS paths,
       count(*)::bigint AS n,
       count(*) FILTER (WHERE status_code IN (401, 403, 404))::bigint AS probe_n
FROM activity_log
WHERE kind = 'http'
  AND timestamp >= now() - interval '24 hours'
  AND remote_addr IS NOT NULL
GROUP BY remote_addr
HAVING count(DISTINCT path) >= 25
   AND count(*) FILTER (WHERE status_code IN (401, 403, 404)) >= 40
ORDER BY paths DESC
LIMIT 20;
```

### 7) Support SPA: parallel admin 401 bursts (API hygiene)

**Expected:** when the support SPA loads, parallel API calls should not each log **401** before Basic Auth credentials are applied (see `support/src/api/client.ts`).

**Bad pattern:** several **401** `GET /admin/...` within ~1–3s from the same session, then successful requests — noise in logs and extra load.

Detect burst windows with **≥3** admin 401s from the same `remote_addr` (or same `user_agent` when IP null) within 3 seconds:

```sql
SELECT remote_addr,
       date_trunc('second', timestamp) AS burst_second,
       count(*)::int AS admin_401_count,
       array_agg(DISTINCT path ORDER BY path) AS sample_paths
FROM activity_log
WHERE kind = 'http'
  AND status_code = 401
  AND path LIKE '/admin/%'
  AND timestamp >= now() - interval '24 hours'
GROUP BY remote_addr, date_trunc('second', timestamp)
HAVING count(*) >= 3
ORDER BY admin_401_count DESC
LIMIT 20;
```

| Finding                                     | Severity                   | Label           | Fix surface (for Fixer)                                                                                   |
| ------------------------------------------- | -------------------------- | --------------- | --------------------------------------------------------------------------------------------------------- |
| ≥3 admin 401s within 1s from same session   | **IMPROVE** (digest day-1) | **API hygiene** | `support/src/api/client.ts` — gate requests until auth header is ready; dedupe parallel 401s on page load |
| Same pattern ≥10× in 24h from many sessions | **HIGH** digest            | **API hygiene** | Same — systemic client bug, not attack                                                                    |

Do **not** CRITICAL-file admin 401 bursts unless paired with auth-fail CRITICAL thresholds (attack). This is normally a **client hygiene** finding.

### Detector loop (order)

1. Volume sanity
2. HTTP error spike aggregates
3. Job failure spike aggregates
4. Auth / abuse / actor aggregates (§6)
5. Admin 401-before-refresh bursts (§7)
6. Targeted body samples for PII leak check
7. Latency / truncation aggregates
8. Discord + CRITICAL filing

If any step would need >20 body rows or a full-day dump → **stop expanding**; file with evidence you have or digest-only HIGH/IMPROVE.

## Severity

| Class        | Ticket?     | Examples                                                                                                                              |
| ------------ | ----------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| **CRITICAL** | Yes         | Cleartext PII/secrets in persisted bodies; severe HTTP/job error spikes; sustained auth-path hammering (per-IP/user thresholds below) |
| **HIGH**     | Digest only | p95 latency up; `truncated` rate up; novel 5xx; PH off-hours volume spike; scanner/enumeration; systemic support SPA admin 401 bursts |
| **IMPROVE**  | Digest only | Fat GET bodies; tiny PUT / huge response; missing envelope; **parallel admin 401 bursts** (≥3 in 1s)                                  |

### CRITICAL spike thresholds (day 1)

Same `path`+`method` **or** `queue`+`job_name`:

- ≥ **20** events in the window, **and**
- error/failure rate ≥ **3×** 7d baseline, **or** ≥ **50%** absolute if no baseline

Weaker spikes → HIGH digest only.

### CRITICAL PII / secret leak

In sampled persisted JSON, flag non-redacted values for keys that `redact.ts` / secret redact should have masked (normalize key like activity redaction: lowercased, `_` stripped). Examples: `streetAddress`, `phoneNumber`, `birthDate`, `email`, `accountNumber`, `password`, `otp`/`totp`/`code` (OTP-shaped), `signature`, tokens. Marker `[REDACTED]` is OK. Cleartext is CRITICAL.

### HIGH / IMPROVE (digest)

- HIGH: p95 `duration_ms` up vs baseline; rising `truncated`; new 5xx paths.
- IMPROVE: large GET identity bodies; mutation request tiny but non-envelope response huge; paths that look high-PII but are not in `isActivityEnvelopePath`.

## Filing gate

**Veto (run log only):** speculative with no rows/rates; assumption without sample; duplicate of Known issues.

**File CRITICAL when:** cleartext leak in store; spike thresholds met on HTTP/job paths; **or** auth abuse with evidence:

- Same `remote_addr`: **≥50** auth failures (401/403) on auth/admin paths in 24h **and** ≥3× 7d baseline (or ≥50% absolute if no baseline)
- Same `user_id`: **≥500** HTTP events in 24h with **≥100** errors (401/403/429) — possible compromised or abusive session (sample before filing)

**IMPROVE/HIGH only (day-1):** support SPA admin 401 bursts; per-user volume without error spike; off-hours traffic without auth-fail CRITICAL combo.

### Labels (required)

Apply **Activity logs** + exactly one:

| Label           | Use when                                                                                   |
| --------------- | ------------------------------------------------------------------------------------------ |
| **PII leak**    | Cleartext in persisted bodies                                                              |
| **Abuse**       | Auth/error hammering, per-IP/user anomalies, off-hours hostile traffic, enumeration        |
| **Perf**        | Latency / truncated spikes (if ever ticketed)                                              |
| **Hardening**   | Rare but real capture/redact hole                                                          |
| **API hygiene** | Envelope / fat-body; **parallel admin 401 bursts**; support client should gate auth header |

Priority: `urgent` / `high` / `normal` / `low` (trust leaks usually urgent/high).

## Output

```markdown
## Activity-logs hunter

**Branch / env:** …
**Verdict:** clean | issues found

### Digest

**New CRITICAL** (omit if none)

- **[urgent] [PII leak]** <title> — [ticketKey](url)

**HIGH / IMPROVE** (titles only; no cards)

- …
```

Card sections: Description, Problem, Goal, Policy (if any), Why insufficient, Simulation, Technical notes (one dense paragraph: SQL evidence + `redact.ts` / path), Acceptance checklist. Omit Possible solution.

### Coverage (end of run log)

- Detectors run (volume, HTTP spikes, job spikes, auth/abuse, support SPA 401-burst, PII samples, latency)
- Known issues count; vetoed count; new ticket keys / none
- Count of support SPA admin 401 bursts (≥3 in 1s) and top auth-fail `remote_addr` / `user_id` (titles only if digest-only)

## Workspace filing

Board: **Bugs & Improvements (AI Quality Assurance Agent)** → **Backlog**  
Sequence: `create_card` → `set_card_labels` → `update_card` → `manage_checklist` (Acceptance)

## Discord

Secret: `CURSOR_QA_AUTOMATION_ALERTS_DISCORD_WEBHOOK_URL` (ops automation channel).  
Username: `Activity-logs hunter`  
One embed per run; titles + links only; no full finding bodies; never mention vetoed/matched.

If Discord fails but MCP works: still file CRITICAL; note Discord failure in run log.

## STOP

No branch, no code, no PR.
