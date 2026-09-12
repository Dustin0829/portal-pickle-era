## Purpose

Records business-history events in the product Postgres database so future features can append “who did what” in the same transaction as a domain write, distinct from HTTP/job activity logs.

## ADDED Requirements

### Requirement: Audit log persistence

The product database MUST include an `audit_logs` table with at least: `id`, `actorId` (nullable until product auth exists), `action`, `resource`, `metadata` (JSON), `createdAt`. Writes MUST go through a shared helper intended for use inside the same database transaction as the domain mutation.

#### Scenario: Example create writes audit
- **WHEN** a client successfully creates an example resource
- **THEN** an `audit_logs` row is stored with action `example.created` and a resource identifier for that example

#### Scenario: Example create fails
- **WHEN** example creation rolls back or fails before commit
- **THEN** no orphan `audit_logs` row is committed for that attempt

### Requirement: Audit is not activity log

Audit rows MUST live in the product database, not the Timescale activity-log store. Listing activity logs MUST NOT be required to return audit rows.

#### Scenario: Stores are separate
- **WHEN** an operator lists activity logs
- **THEN** the response contains HTTP/job activity records only, not Prisma audit rows
