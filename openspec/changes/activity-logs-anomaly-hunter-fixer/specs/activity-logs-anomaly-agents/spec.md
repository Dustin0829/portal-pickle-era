## Purpose

Defines the Activity-logs hunter and fixer agent pair: scheduled anomaly detection over the Timescale activity store, Discord digests, CRITICAL Workspace filing, and Ready-queue surgical fixes.

## ADDED Requirements

### Requirement: Hunter runs on a fixed daily window without mutating production data

The Activity-logs hunter SHALL run on a scheduled Cursor Automation approximately daily at 08:00 Asia/Manila. It MUST query only the activity logs database with a read-only credential. It MUST NOT write to the activity store, product database, or application code, and MUST NOT open pull requests.

#### Scenario: Hunter is read-only

- **WHEN** the daily hunter run completes
- **THEN** the activity_log table MUST have no inserts, updates, or deletes attributed to the hunter
- **AND** no application repository branch or PR MUST be created by that run

### Requirement: Discord digest is always posted; CRITICAL only creates Workspace tickets

Every hunter run MUST post exactly one Discord embed digest. Day-1 filing policy: only findings classified **CRITICAL** MUST create cards on **Bugs & Improvements (AI Quality Assurance Agent)** in list **Backlog**. HIGH and IMPROVE findings MUST appear in the Discord digest only.

#### Scenario: Clean run posts digest without cards

- **WHEN** the hunter finds no CRITICAL issues in the window
- **THEN** Discord MUST receive one clean banner
- **AND** no new Workspace cards MUST be created

### Requirement: CRITICAL detectors include PII/secret leak and severe failure spikes

CRITICAL classification MUST include at least: (1) persisted JSON containing plaintext values that should have been redacted; (2) sustained auth-path error spikes vs baseline; (3) job failure-rate spikes exceeding documented thresholds vs baseline.

#### Scenario: Cleartext PII in store is CRITICAL

- **WHEN** a sample of persisted HTTP bodies contains `email` equal to a non-placeholder address (not `[REDACTED]`)
- **THEN** the hunter MUST classify the finding CRITICAL and file if not already open

### Requirement: Fixer processes Ready queue only

The Activity-logs fixer MUST process cards on **Ready** and answered **Needs Human Judgement** with label **Activity logs**. It MUST NOT pick **Backlog**, MUST NOT merge PRs, and MUST ground-check against current `main` before branching.

#### Scenario: Fixer skips Backlog

- **WHEN** a CRITICAL card remains on **Backlog** without human triage
- **THEN** the fixer MUST NOT claim or implement that card in the same run
