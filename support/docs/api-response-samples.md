# API response samples

Production-shaped examples for the backend `{ success, message, data?, code?, errors?, meta? }` envelope and how this frontend consumes them.

See also: `src/api/client.ts`, `src/api/lib/api-error-message.ts`, `src/api/lib/apply-field-errors-to-form.ts`, `.cursor/rules/api/api-error-routing.mdc`.

## Envelope

| Field     | Success             | Failure                             |
| --------- | ------------------- | ----------------------------------- |
| `success` | `true`              | `false`                             |
| `message` | optional (`"ok"`)   | human summary — not field copy      |
| `data`    | payload             | absent                              |
| `code`    | absent              | e.g. `VALIDATION_ERROR`, `CONFLICT` |
| `errors`  | absent              | structured detail (validation)      |
| `meta`    | optional pagination | absent                              |

---

## Success — wire vs what your code sees

The Axios response interceptor unwraps `{ success: true, data, meta? }`. Hooks and query functions receive the inner payload only.

### Simple read — `GET /examples/:id` → `200`

**Wire:**

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

**After interceptor:**

```ts
response.data; // → { id: "ex_01HXYZ", label: "Demo item", ... }
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

Mutation `onSuccess` runs; optional success toast lives in the query hook.

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
        "createdAt": "..."
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

**After interceptor:**

```ts
response.data; // → { items: [...] }
response.meta; // → pagination meta (attached by interceptor)
```

---

## Errors — wire vs `ApiRequestError`

Failed responses are rejected as `ApiRequestError` with sanitized `message` (never raw `ZodError:` JSON).

### Validation — flat field — `422`

**Wire:**

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

**`ApiRequestError`:**

```ts
{
  message: "Validation failed",
  statusCode: 422,
  code: "VALIDATION_ERROR",
  errors: { formErrors: [], fieldErrors: { userLimit: ["Must be at least 1"] } }
}
```

**UI:** `setError("userLimit", { type: "server", message: "Must be at least 1" })` — **no toast**.

### Validation — nested fields — `422`

Dot paths pass straight to React Hook Form.

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

**UI:**

```ts
setError("identitySummary.builds", {
  type: "server",
  message: "This field is required",
});
setError("identitySummary.expertise", {
  type: "server",
  message: "Add at least one item",
});
```

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

**UI:** no field highlights; no toast. Read surfaces show `"Check the highlighted fields and try again."` unless you render `formErrors` explicitly.

### Business — conflict — `409`

```json
{
  "success": false,
  "message": "An example with this label already exists",
  "code": "CONFLICT"
}
```

**UI:** toast → `"An example with this label already exists"`

### Business — forbidden — `403`

```json
{
  "success": false,
  "message": "You don't have permission to delete this item",
  "code": "FORBIDDEN"
}
```

**UI:** toast → `"You don't have permission to delete this item"`

### Business — not found — `404`

```json
{
  "success": false,
  "message": "Example not found",
  "code": "NOT_FOUND"
}
```

**UI:** query/read surface → inline `"Example not found"`; mutation → toast.

### System — server error — `500`

```json
{
  "success": false,
  "message": "Internal server error"
}
```

**UI:** toast / inline → `"Something went wrong. Try again."` (via `getUserFacingApiErrorMessage`).

---

## Zod dump sanitization

If the backend ever returns a raw Zod string in `message`, the interceptor rewrites it before `ApiRequestError` is constructed.

| Raw `message`                         | `code`             | Sanitized `message`                  | User sees                                   |
| ------------------------------------- | ------------------ | ------------------------------------ | ------------------------------------------- |
| `ZodError: [{"path":["builds"]...}]`  | `VALIDATION_ERROR` | `"Validation failed"`                | Field highlights (if `fieldErrors` present) |
| `ZodError: [...]`                     | — (500)            | `"Something went wrong. Try again."` | Generic toast                               |
| `"Validation failed"` + `fieldErrors` | `VALIDATION_ERROR` | unchanged                            | Field highlights                            |

---

## Routing cheat sheet

| HTTP            | `code`             | Channel        | User copy source                 |
| --------------- | ------------------ | -------------- | -------------------------------- |
| 422             | `VALIDATION_ERROR` | RHF `setError` | `errors.fieldErrors` (dot paths) |
| 409             | `CONFLICT`         | toast          | `message`                        |
| 403             | `FORBIDDEN`        | toast          | `message`                        |
| 404             | `NOT_FOUND`        | toast / inline | `message`                        |
| 500             | —                  | toast / inline | generic (never raw server text)  |
| network timeout | —                  | toast / inline | generic                          |

---

## Helpers

### Form submit

```ts
import { handleApiMutationError } from "@/api/lib/api-error-message";

onError: (error) => {
  handleApiMutationError(error, { setError, toastError: toast.error });
};
```

- `VALIDATION_ERROR` → `applyFieldErrorsToForm(error.errors, setError)` — no toast
- Everything else → `getUserFacingApiErrorMessage(error)` in toast

### Read surfaces (no form)

```ts
import { getUserFacingApiErrorMessage } from "@/api/lib/api-error-message";

getUserFacingApiErrorMessage(error);
// validation → "Check the highlighted fields and try again."
// 5xx → "Something went wrong. Try again."
```

Used in `ExamplesSection` and similar non-form error panels.

### Mutation hooks (no form context)

```ts
import { isApiValidationError } from "@/api/lib/apply-field-errors-to-form";
import { getUserFacingApiErrorMessage } from "@/api/lib/api-error-message";

onError: (error) => {
  if (isApiValidationError(error)) return; // page maps fieldErrors
  toast.error(getUserFacingApiErrorMessage(error));
};
```

---

## Anti-patterns

```ts
// Bad — raw error.message in toast or inline UI
toast.error(error.message);
<Alert>{error?.message}</Alert>

// Bad — toast on validation failure
onError: (e) => toast.error(e.message);
```

---

## Backend reference

Full server-side samples (error classes, `flattenZodError`, Discord formatting) live in the backend template `docs/api-response-samples.md`.
