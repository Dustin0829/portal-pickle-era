---
name: activity-logs-hunter
description: >-
  What the Activity-logs Hunter does in a scheduled run: snapshot open bugs,
  query Timescale activity_log via LOGS_DATABASE_URL, file CRITICAL only on the
  AI Quality Assurance Agent board (Activity logs + category label), one Discord
  embed banner per run. Never opens a fix PR. Hunt rules live in vidu-backend;
  this overlay is the run loop.
disable-model-invocation: true
---

# Activity-logs Hunter — what it does in a run

Scheduled Cursor Automation. Sibling of **Activity-logs Fixer**. This agent **finds** activity-store anomalies and files CRITICAL tickets. It does **not** change application code, open PRs, or merge.

**Hunt rules (detectors, filing gate, severity, card voice, Discord digest):** `backend/.cursor/skills/activity-logs-hunter/SKILL.md`. If this overlay and that skill disagree on hunt/filing, **the backend skill wins**.

**Board:** **Bugs & Improvements (AI Quality Assurance Agent)** on your [solo-founder-workspace](https://github.com/franzegos/solo-founder-workspace) hub — new cards land on **Backlog** with **Activity logs** + one category label.

---

## Stance

- Scoped hunt only (persisted activity_log: PII leaks, auth/abuse anomalies, PH off-hours signals, admin 401-before-refresh bursts, HTTP/job spikes, perf/hygiene digests). Not money ledger logic and not a full SIEM.
- Query **only** `LOGS_DATABASE_URL` (read-only reader). Never product `DATABASE_URL`.
- Day-1: **CRITICAL → Workspace**; HIGH/IMPROVE → Discord only.
- Hunter tickets can be wrong. Filing is a claim, not a proof. The Fixer re-grounds Ready + answered Needs Human Judgement cards.
- Never auto-PR activity-log fixes. That is the Fixer’s job, and only from **Ready**.

---

## What the hunter actually does in a run

```
1. Snapshot known issues (titles only)
   get_board:
     • Bugs & Improvements (User Reported)
     • Bugs & Improvements (AI Quality Assurance Agent)
   Open = list is not Shipped or Abandoned.
   Build skip table: ticketKey | board | list | title
   Do not get_card for this snapshot.

2. Hunt activity_log
   Read backend activity-logs-hunter skill (**Query playbook** + **§6 auth/abuse** + **§7 support SPA 401 burst** are required).
   Use LOGS_DATABASE_URL only. Aggregates first; body samples ≤20/run, LIMIT 5 per path.
   Never SELECT * unbounded / full-day JSONB dumps.
   If DB missing/unreachable → Discord unavailable banner; no tickets; STOP.
   Do not read merge-readiness-check on a hunt.
   Apply filing gate — veto fantasy/speculative without proof.

3. Compare candidates to the skip table
   Same title or same obvious failure already open → do not file.
   Still hunt the surface for a *different* hole.
   Full Finding bodies are for **new** CRITICAL issues only.

4. File new CRITICAL findings (Workspace MCP)
   Board: Bugs & Improvements (AI Quality Assurance Agent)
   List: Backlog
   Labels: Activity logs + one category (PII leak | Abuse | Perf |
           Hardening | API hygiene)
   Sequence: create_card → set_card_labels → update_card (TipTap) →
             manage_checklist (Acceptance)
   Voice: plain words, airy, human first.
   TipTap: blank paragraph between every H2/H3 and body block.
   Omit Possible solution. Technical notes are one dense paragraph;
   “likely fix” is a hint for the Fixer, not a mandate.

5. Discord (one embed banner per run — same channel as Fixer)
   Secret: CURSOR_QA_AUTOMATION_ALERTS_DISCORD_WEBHOOK_URL (#cursor-qa-automation-alerts)
   Username: Activity-logs hunter
   POST embeds[] only (never plain-text content for the digest).
   Clean: green banner — title “all clean”, footer with branch.
   New cards: colored banner — title “issues found”, count lead,
   **New** section with [priority] [Category] title — [ticketKey](card-url).
   HIGH/IMPROVE: titles only in digest (no cards).
   No full finding bodies. No per-ticket posts.
   Matched / vetoed: never mention on Discord.

6. Memories (optional run journal)
   Last run: date, branch, verdict, new ticket keys.
   Not a second backlog. Workspace titles stay authoritative.

7. STOP
   No branch, no code, no PR.
```

---

## Card the hunter writes (shape)

Same sections the Fixer later turns into a PR description:

| Section | For |
|---------|-----|
| Description | What happens today |
| Problem | Who is hurt (creator / brand / admin / ops) |
| Goal | Expected behavior |
| Policy | Non-negotiable capture/redact rules if any |
| Why insufficient | Why ignoring the store anomaly is not enough |
| Simulation | QA checks + Actual vs Expected |
| Technical notes | SQL evidence + redact/envelope/sampling files |
| Acceptance | Testable outcomes (checklist) |

---

## You (human) after a hunt

1. Read new Backlog cards on **Bugs & Improvements (AI Quality Assurance Agent)** (filter **Activity logs**).
2. If the finding is real and in scope, drag **Backlog → Ready**.
3. Leave the rest in Backlog. The Fixer never picks Backlog and does not look at other boards.

---

## Related

- Fixer run loop: `backend/.cursor/skills/activity-logs-fixer/SKILL.md` (overlay [pointer](../activity-logs-fixer/SKILL.md))
- Hunt implementation: `backend/.cursor/skills/activity-logs-hunter/SKILL.md`
- Workflow: [WORKFLOW.md](../../WORKFLOW.md) § Activity-logs agents
- Ops runbook: `backend/docs/activity-logs-anomaly-agents.md`
