---
name: activity-logs-fixer
description: >-
  Activity-logs Fixer run loop: Ready cards plus answered Needs Human Judgement
  on AI QA board with Activity logs label; ground-check; surgical fixes to
  redact/envelope/sampling/tests/rules only; verify + ready-for-review PRs.
  Never merges. Never picks Backlog. Sibling of activity-logs-hunter. Canonical
  for Cloud Agents checking out this repo.
disable-model-invocation: true
---

# Activity-logs Fixer — what it does in a run

**Canonical skill for Cloud Agents.** Sibling of **Activity-logs hunter**. Fixes tickets on **Ready** and **answered** **Needs Human Judgement**. Does **not** merge, promote, or pick **Backlog** / unanswered NHJ.

**Board:** only **Bugs & Improvements (AI Quality Assurance Agent)**. Prefer label **Activity logs**.

**Feature `/opsx-*` is usually wrong** for a redaction-key fix — the card is the proposal. Prefer **Needs Human Judgement** over inventing public API contract changes (e.g. shrinking a full resource response).

Ship path: `.cursor/skills/SKILL.md` + `.cursor/rules/`, Conventional Commits, verify + [merge-readiness-check](../merge-readiness-check/SKILL.md), Workspace `move_card`. Humans merge.

---

## Stance

- Work queue: **Ready** + **answered Needs Human Judgement**, sequential.
- **Ready ≠ proof.** Ground against `main` + sample `activity_log` rows (`LOGS_DATABASE_URL` read-only) before branching.
- Worth-fixing gate: speculative / already fixed / product-impossible → **Abandoned** + close open PRs.
- Don’t regress sibling capture paths. Surgical only.
- Policy / public contract shrink → **Needs Human Judgement**.
- Never merge.

---

## Claim and board moves

Exact list: **Needs Human Judgement**.

| Event             | List                                                                |
| ----------------- | ------------------------------------------------------------------- |
| Human triage      | Backlog → **Ready**                                                 |
| Claim             | Ready / answered NHJ → **In Development**                           |
| PR opened         | stay **In Development** + comment all PR URLs                       |
| Blocking judgment | **Needs Human Judgement** + comment; draft PR only if commits exist |
| Merged to main    | **Staging QA** (human / later)                                      |
| False positive    | **Abandoned** + comment; **close** open/draft PRs                   |

---

## Needs Human Judgement

Park when the hole is real but needs a product call (e.g. change PUT profile response shape). Answered check: human comment after latest `Needs a human decision:` — not another agent.

---

## Ground check (before branch)

1. Re-read hunter Technical notes.
2. Confirm on current `main`: is the redact/envelope/sampling hole still present?
3. Optional: sample recent rows via `LOGS_DATABASE_URL` for the cited path.
4. If not grounded → Abandoned.

---

## Surgical allowlist (in scope)

| Area                           | Paths                                                                                            |
| ------------------------------ | ------------------------------------------------------------------------------------------------ |
| Redaction / envelope / compact | `src/lib/activity-logs/redact.ts` + unit tests                                                   |
| Sampling / skip                | `src/lib/activity-logs/sampling.ts` + tests                                                      |
| Capture wiring                 | `http-capture.ts` / `job-capture.ts` only if required                                            |
| Prevent rule                   | `.cursor/rules/ops/activity-logs.mdc`                                                            |
| Docs                           | `docs/environment.md`, `docs/activity-logs-anomaly-agents.md`                                    |
| Admin auth client hygiene      | `support/src/api/client.ts` (+ tests) when card cites **parallel admin 401 bursts** on page load |

**Out of scope without NHJ:** unrelated product workers, public DTO shrink, unrelated support UI redesign, app DB migrations.

---

## Living rules

Default: code + tests only. Edit `.mdc` only when the invariant belongs in always-on agent guidance (new PII key class). Keep rule text portable — no secrets.

---

## Verify and PR

- Autofix with `pnpm --filter backend verify:fast` when needed; ship gate `pnpm verify` + merge-readiness.
- Branch `fix/{ticketKey}-…` or `fix/activity-logs-…`.
- PR ready for review; never merge.
- Discord: `CURSOR_QA_AUTOMATION_ALERTS_DISCORD_WEBHOOK_URL`, username `Activity-logs fixer`, one embed banner per run.

---

## STOP

After queue drained: Discord banner → stop. No production promote.
