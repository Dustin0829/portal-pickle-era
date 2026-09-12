## MODIFIED Requirements

### Requirement: Persisted bodies are redacted and compact

HTTP and job activity bodies stored in Timescale MUST pass through activity redaction (`PII_KEYS`, secret keys, OTP-shaped codes), compaction for bulky nests, and byte caps before insert. Cleartext passwords, tokens, OTP codes, account numbers, and personal contact fields MUST NOT appear in persisted JSON.

#### Scenario: New PII field added to API

- **WHEN** a new sensitive field is added to a route response or request body
- **THEN** the field key MUST be added to `PII_KEYS` (or secret sets) in `redact.ts`
- **AND** unit tests MUST cover the redaction behavior

### Requirement: High-PII success responses are enveloped in the store

For paths listed in `isActivityEnvelopePath`, successful (2xx) HTTP responses persisted to the activity store MUST store envelope metadata only (`success`, `message`, `code`) — not the full resource DTO.

#### Scenario: Auth mutation success

- **WHEN** a POST to an auth path returns 200 with a token-bearing body
- **THEN** the persisted activity response MUST NOT contain cleartext tokens or emails

### Requirement: GET sampling reduces noise

Successful GET/HEAD requests faster than the slow threshold MUST NOT be persisted unless they return status ≥ 400. Mutations and errors MUST always persist when capture is enabled.

#### Scenario: Fast successful GET is skipped

- **WHEN** a GET request completes in 200ms with status 200
- **THEN** no activity log row MUST be written for that request
- **AND** a POST mutation on the same path MUST still be persisted
