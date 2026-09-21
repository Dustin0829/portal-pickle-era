## Purpose

Gives every product built from the starter a generic HTTP 429 contract and a full-page recovery gate in the product web app, without encoding product-specific quota codes.

## ADDED Requirements

### Requirement: Generic 429 envelope

When the API rate limiter rejects a request, the response MUST be HTTP 429 with JSON `{ success: false, message: string }` and MUST NOT require a product-quota `code`. The limiter MUST skip `GET /health`, `GET /health/db`, and activity-log read routes.

#### Scenario: Client exceeds window
- **WHEN** a client exceeds the configured request limit in the window on an in-scope product route
- **THEN** the API returns 429 with `success: false` and a generic retry message

#### Scenario: Health is not limited
- **WHEN** a client calls `GET /health` repeatedly inside the window
- **THEN** the response MUST NOT be 429 from this limiter

### Requirement: Product RateLimitGate

The product web app MUST treat a generic API 429 as a global blocked state and replace the main UI with a full-page “too many requests” recovery view. Retry MUST clear the blocked state and refetch queries. A 429 that includes a future product-quota `code` MUST NOT trip this gate (skip-list starts empty).

#### Scenario: Generic 429 blocks the app
- **WHEN** the product API client receives 429 without a skip-listed `code`
- **THEN** the user sees the RateLimitGate page instead of the previous screen

#### Scenario: Retry recovers
- **WHEN** the user activates retry on RateLimitGate
- **THEN** the blocked state is cleared and in-flight queries are invalidated or resumed

#### Scenario: Support app unchanged by this requirement
- **WHEN** only the product app RateLimitGate is specified
- **THEN** this capability does not require the support app to implement the same gate
