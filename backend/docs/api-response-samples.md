# API response samples

Production-shaped examples for the `{ success, message, data?, code?, errors?, meta? }` envelope. All routes use `sendSuccess()` on success and `errorHandler` on failure.

See also: `src/lib/api-response.ts`, `src/lib/errors.ts`, `src/lib/zod-validation.ts`, `src/middleware/errorHandler.ts`.

## Envelope

| Field     | Success             | Failure                             |
| --------- | ------------------- | ----------------------------------- |
| `success` | `true`              | `false`                             |
| `message` | optional (`"ok"`)   | human summary — not field copy      |
| `data`    | payload             | absent                              |
| `code`    | absent              | e.g. `VALIDATION_ERROR`, `CONFLICT` |
| `errors`  | absent              | structured detail (validation)      |
| `meta`    | optional pagination | absent                              |

**Validation rule:** `message` is always `"Validation failed"`. Per-field copy lives in `errors.fieldErrors` only.

---

## Success

### Simple read — `GET /examples/:id` → `200`

```json
{
  "success": true,
  "message": "ok",
  "data": {
    "id": "ex_01HXYZ",
    "label": "Demo item",
    "userLimit": 10,
    "createdAt": "2026-06-30T12:00:00.000Z"
  }
}
```

### Create — `POST /examples` → `201`

```json
{
  "success": true,
  "message": "created",
  "data": {
    "id": "ex_01HABC",
    "label": "New item",
    "userLimit": 5,
    "createdAt": "2026-06-30T12:05:00.000Z"
  }
}
```

### Paginated list — `GET /examples?page=1&limit=20` → `200`

```json
{
  "success": true,
  "message": "ok",
  "data": {
    "items": [
      {
        "id": "ex_01HXYZ",
        "label": "Demo item",
        "userLimit": 10,
        "createdAt": "2026-06-30T12:00:00.000Z"
      }
    ]
  },
  "meta": {
    "page": 1,
    "current_page": 1,
    "limit": 20,
    "items_per_page": 20,
    "total": 42,
    "total_items": 42,
    "total_pages": 3
  }
}
```

---

## Errors

### Validation — flat field — `422`

Thrown via `validateBody()` middleware or `validationErrorFromZod()` in services.

```json
{
  "success": false,
  "message": "Validation failed",
  "code": "VALIDATION_ERROR",
  "errors": {
    "formErrors": [],
    "fieldErrors": {
      "userLimit": ["Must be at least 1"]
    }
  }
}
```

### Validation — nested fields — `422`

Zod paths are flattened to dot notation for React Hook Form (`identitySummary.builds`).

```json
{
  "success": false,
  "message": "Validation failed",
  "code": "VALIDATION_ERROR",
  "errors": {
    "formErrors": [],
    "fieldErrors": {
      "identitySummary.builds": ["This field is required"],
      "identitySummary.expertise": ["Add at least one item"]
    }
  }
}
```

Produced by `flattenZodError()` in `src/lib/format-zod-error.ts`. Messages are humanized via `configureZodErrorMap()` at startup.

### Validation — form-level only — `422`

```json
{
  "success": false,
  "message": "Validation failed",
  "code": "VALIDATION_ERROR",
  "errors": {
    "formErrors": ["At least one filter must be selected"],
    "fieldErrors": {}
  }
}
```

### Business — conflict — `409`

```json
{
  "success": false,
  "message": "An example with this label already exists",
  "code": "CONFLICT"
}
```

### Business — forbidden — `403`

```json
{
  "success": false,
  "message": "You don't have permission to delete this item",
  "code": "FORBIDDEN"
}
```

### Business — not found — `404`

```json
{
  "success": false,
  "message": "Example not found",
  "code": "NOT_FOUND"
}
```

### System — server error — `500`

**Production** (no stack in the response body):

```json
{
  "success": false,
  "message": "Internal server error"
}
```

**Development only** — stack attached for debugging:

```json
{
  "success": false,
  "message": "Internal server error",
  "errors": {
    "stack": "Error: connection refused\n    at ..."
  }
}
```

---

## Zod leak — before vs after

Service-level `.parse()` without middleware used to leak raw Zod JSON in `message`:

```json
{
  "success": false,
  "message": "ZodError: [{\"code\":\"invalid_type\",\"expected\":\"string\",\"received\":\"undefined\",\"path\":[\"identitySummary\",\"builds\"],\"message\":\"Required\"}]"
}
```

**Now** — `errorHandler` catches stray `ZodError` and `sanitizeValidationError()` normalizes leaked dumps:

```json
{
  "success": false,
  "message": "Validation failed",
  "code": "VALIDATION_ERROR",
  "errors": {
    "formErrors": [],
    "fieldErrors": {
      "identitySummary.builds": ["This field is required"]
    }
  }
}
```

Use `validationErrorFromZod(error)` anywhere you parse with Zod outside middleware.

---

## Error classes

| Class             | Status | `code`             | `errors`         |
| ----------------- | ------ | ------------------ | ---------------- |
| `ValidationError` | 422    | `VALIDATION_ERROR` | flattened Zod    |
| `ForbiddenError`  | 403    | `FORBIDDEN`        | —                |
| `NotFoundError`   | 404    | `NOT_FOUND`        | —                |
| `ConflictError`   | 409    | `CONFLICT`         | —                |
| Unknown           | 500    | —                  | stack (dev only) |

---

## Ops / Discord (not user-facing)

For `ValidationError`, logs and Discord alerts use a humanized one-liner from `formatFlattenedZodError()`:

```txt
identitySummary › builds: This field is required; identitySummary › expertise: Add at least one item
```

422 responses are skipped in production Discord alerts (expected user input). 5xx and unexpected failures are alerted when `DISCORD_API_ALERT_WEBHOOK_URL` is set.

---

## Frontend consumer expectations

The browser client unwraps success responses (`response.data` = inner payload). On failure it builds `ApiRequestError` with sanitized `message`.

| HTTP | `code`             | Expected UI                         |
| ---- | ------------------ | ----------------------------------- |
| 422  | `VALIDATION_ERROR` | Map `fieldErrors` to form fields    |
| 409  | `CONFLICT`         | Toast with `message`                |
| 403  | `FORBIDDEN`        | Toast with `message`                |
| 404  | `NOT_FOUND`        | Toast or inline alert               |
| 500  | —                  | Generic “Something went wrong” copy |

See the frontend template `docs/api-response-samples.md` for interceptor and helper details.
