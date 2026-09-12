# Activity-logs anomaly agents (Hunter + Fixer)

Scheduled Cursor Automations that watch the Timescale **activity store** (not the product DB).

| Agent  | Skill (Cloud Agents)                                   | Overlay run loop                      |
| ------ | ------------------------------------------------------ | ------------------------------------- |
| Hunter | `backend/.cursor/skills/activity-logs-hunter/SKILL.md` | `.cursor/skills/activity-logs-hunter` |
| Fixer  | `backend/.cursor/skills/activity-logs-fixer/SKILL.md`  | pointer in overlay                    |

**Day-1 filing:** CRITICAL → Workspace tickets; HIGH/IMPROVE → Discord digest only.

**Querying:** Hunter MUST follow the **Query playbook** in `backend/.cursor/skills/activity-logs-hunter/SKILL.md` — aggregates + `LIMIT` samples only; never dump full-day JSONB.

**Secrets (Automations):**

| Secret                                            | Purpose                                                                                 |
| ------------------------------------------------- | --------------------------------------------------------------------------------------- |
| `LOGS_DATABASE_URL`                               | Read-only connection to Timescale (`activity_logs_reader`). **Not** app `DATABASE_URL`. |
| `CURSOR_QA_AUTOMATION_ALERTS_DISCORD_WEBHOOK_URL` | Ops automation channel; usernames `Activity-logs hunter` / `Activity-logs fixer`        |

---

## 1. Create read-only Timescale role

Run as a privileged admin on the **logs** database (once per environment). Replace passwords and DB name.

```sql
-- Role: SELECT only on activity_log (no INSERT/UPDATE/DELETE)
CREATE ROLE activity_logs_reader WITH LOGIN PASSWORD '<strong-random-password>';

GRANT CONNECT ON DATABASE <logs_db_name> TO activity_logs_reader;
GRANT USAGE ON SCHEMA public TO activity_logs_reader;
GRANT SELECT ON TABLE activity_log TO activity_logs_reader;

-- Optional: deny default privileges on future tables in public
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  REVOKE ALL ON TABLES FROM activity_logs_reader;
```

Connection string for Cursor secret `LOGS_DATABASE_URL`:

```text
postgresql://activity_logs_reader:<password>@<host>:<port>/<logs_db_name>?sslmode=require
```

**Verify:**

```bash
# Should succeed
psql "$LOGS_DATABASE_URL" -c 'SELECT count(*) FROM activity_log'

# Should fail
psql "$LOGS_DATABASE_URL" -c "INSERT INTO activity_log DEFAULT VALUES"
```

Never grant this role write access. Never put the writer (app) password in the hunter Automation.

App runtime already uses `LOGS_DATABASE_URL` for ingest — the Automation may use the **same env name** with the **reader** URL only inside Cursor secrets (do not replace production writer URL with the reader).

---

## 2. Discord

1. Create (or reuse) a webhook for your ops automation channel.
2. Store as Cursor secret `CURSOR_QA_AUTOMATION_ALERTS_DISCORD_WEBHOOK_URL`.
3. Agents set username per post: `Activity-logs hunter` / `Activity-logs fixer`.

---

## Labels (create once in Workspace UI)

`set_card_labels` **does not** create missing names — add these on **Bugs & Improvements (AI Quality Assurance Agent)** before enabling the hunter:

- **Activity logs** (required on every hunter card)
- Category (exactly one): **PII leak**, **Abuse**, **Perf**, **Hardening**, **API hygiene**

---

## 3. Cursor Automations

| Automation | Schedule                           | Prompt points at               | Secrets / MCP                                        |
| ---------- | ---------------------------------- | ------------------------------ | ---------------------------------------------------- |
| Hunter     | ~08:00 Asia/Manila                 | backend `activity-logs-hunter` | Workspace MCP, `LOGS_DATABASE_URL`, Discord          |
| Fixer      | after Ready cards exist (or daily) | backend `activity-logs-fixer`  | Workspace MCP, optional `LOGS_DATABASE_URL`, Discord |

Repos: `backend` (+ `support` if fixer needs client hygiene). Workspace hub lives in [solo-founder-workspace](https://github.com/franzegos/solo-founder-workspace).

**Human triage:** drag real CRITICAL cards **Backlog → Ready**. Fixer never picks Backlog.

**Unavailable DB:** hunter posts Discord unavailable banner and files **nothing**.

---

## Related

- Prevent rule: `.cursor/rules/ops/activity-logs.mdc`
- Env summary: [environment.md](./environment.md) § Activity-logs anomaly agents
