# Tasks: activity-logs-anomaly-hunter-fixer

Branch prefix: `feat/activity-logs-anomaly-hunter-fixer`

## openspec

- [x] 0.1 Keep proposal/design/specs/tasks in sync — verify `openspec validate activity-logs-anomaly-hunter-fixer` passes
- [ ] 0.2 After ship: archive change / sync main specs as needed

## backend

- [x] 1.1 Strengthen `src/lib/activity-logs/redact.ts` — PII keys, compaction, envelope helpers + unit tests
- [x] 1.2 Strengthen `sampling.ts` — `shouldPersistHttpActivity` (GET slow/error only) + tests
- [x] 1.3 Update `http-capture.ts` — envelope paths, buffer parsing, smart persist gate
- [x] 1.4 Add `.cursor/skills/activity-logs-hunter/SKILL.md`
- [x] 1.5 Add `.cursor/skills/activity-logs-fixer/SKILL.md`
- [x] 1.6 Add `.cursor/rules/ops/activity-logs.mdc`
- [x] 1.7 Extend `merge-readiness-check` with Activity log hygiene dimension
- [x] 1.8 Document read-only role + Automations in `docs/environment.md` and `docs/activity-logs-anomaly-agents.md`
- [x] 1.9 Index skills in `.cursor/skills/SKILL.md`

## overlay

- [x] 2.1 Add `.cursor/skills/activity-logs-hunter/SKILL.md` run loop
- [x] 2.2 Add `.cursor/skills/activity-logs-fixer/SKILL.md` pointer
- [x] 2.3 Update `.cursor/WORKFLOW.md` § Activity-logs agents

## Ops / Automations (human after merge)

- [ ] 3.1 Create Timescale read-only role + Cursor secret `LOGS_DATABASE_URL` (reader URL)
- [ ] 3.2 Create Discord webhook secret + test embed
- [ ] 3.3 Add Workspace labels: **Activity logs**, **PII leak**, **Abuse**, **Perf**, **API hygiene**, **Hardening**
- [ ] 3.4 Enable Hunter Automation (~08:00 Asia/Manila)
- [ ] 3.5 Enable Fixer Automation on Ready queue

## After implementation

- [ ] 4.1 `/opsx-verify` — full `pnpm verify`
- [ ] 4.2 `/opsx-pr` — PR with branch prefix `feat/activity-logs-anomaly-hunter-fixer`
