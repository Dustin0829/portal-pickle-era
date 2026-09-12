## Context

See `proposal.md`. Production already persists HTTP + job activity to Timescale (`LOGS_DATABASE_URL`), with redaction/envelope/compaction in `backend/src/lib/activity-logs/`. This design adds a hunter/fixer agent pair for activity-store anomalies, mirroring the pattern used in production VidU stacks.

## Goals / Non-Goals

**Goals:**
- Canonical hunter + fixer skills in backend; overlay run-loop pointers at repo root.
- Prevent-layer rule `activity-logs.mdc` + merge-readiness hygiene row.
- Strengthen PII redaction, compaction, envelope paths, and GET sampling.
- Document Automation secrets and Discord/Workspace wiring.
- Day-1 CRITICAL-only filing; digest for the rest.

**Non-Goals:**
- No new support UI, no public API for anomalies.
- No day-1 SQL materialized views.
- No changing public DTO responses without Needs Human Judgement.

## Decisions

### D1: Cursor Automation + SQL, not a backend cron worker

Hunter/Fixer are Cursor Automations querying logs DB with `psql` against `LOGS_DATABASE_URL`.

### D2: Read-only `LOGS_DATABASE_URL` secret (not app `DATABASE_URL`)

Dedicated read-only role `activity_logs_reader` (SELECT on `activity_log` only).

### D3: Skill split

| Artifact | Location | Owns |
|----------|----------|------|
| `activity-logs-hunter/SKILL.md` | backend | Detectors, filing gate, Discord payload, card shape |
| Overlay hunter | `.cursor/skills/` | Run loop snapshot → hunt → file → Discord → stop |
| `activity-logs-fixer/SKILL.md` | backend | Ready/NHJ queue, ground check, surgical fix allowlist |

Backend skill wins on detector/filing conflicts.

### D4: CRITICAL vs digest (day 1)

| Class | Ticket? | Examples |
|-------|---------|----------|
| CRITICAL | Yes | Cleartext PII/secrets; severe HTTP/job error spikes; sustained auth-path hammering |
| HIGH | Digest only | p95 regressions, truncated rate up, novel 5xx paths |
| IMPROVE | Digest only | Fat GET bodies, missing envelope, parallel support SPA admin 401 bursts |

## Risks / Trade-offs

| Risk | Mitigation |
|------|------------|
| False CRITICAL tickets | Filing gate + Fixer ground check + Abandoned path |
| Agent scans huge JSONB | Aggregates + limited SAMPLE; hard caps in hunter skill |
| Digest noise | CRITICAL-only tickets day 1 |

## Migration Plan

1. Create read-only DB role + Cursor secrets.
2. Merge skills + `activity-logs.mdc` + capture hardening.
3. Enable Hunter Automation; observe digests.
4. Enable Fixer after first CRITICAL cards triaged to Ready.
