# Incident log

Track mistakes AI (or humans) make while building on this template. **Rules grow from repeated pain — not prediction.**

## When to add a rule

| Occurrences | Action                                            |
| ----------- | ------------------------------------------------- |
| **1×**      | Log it here only — fix the PR, no new rule        |
| **2×**      | Log it — mention in PR review / merge-readiness   |
| **3×**      | Add or strengthen a `.cursor/rules/**/*.mdc` file |

Do not add rules for one-off mistakes. Do not add generic architecture rules (CQRS, DDD, SOLID, etc.) — keep rules tied to bugs you have actually seen.

## How to log an entry

```txt
## YYYY-MM-DD — Short title

**What happened:** one sentence
**Rule (if any):** existing rule violated, or "none yet"
**Fix:** what we did in the PR
**Count:** 1 | 2 | 3 → promote to rule
```

## Log

<!-- Add new entries at the top -->

## Example entries (delete when real incidents are logged)

### 2026-06-10 — Silent blank list

**What happened:** `if (!data) return null` on items list page — users saw a white screen while loading and after errors.
**Rule (if any):** `error-handling.mdc`
**Fix:** Skeleton + error + empty components; explicit Query branches.
**Count:** 1

### 2026-06-14 — Server list copied into Zustand

**What happened:** `useEffect` synced `useItems()` data into `itemStore` — stale list after mutation and double source of truth.
**Rule (if any):** `data-ownership.mdc`
**Fix:** Removed sync; page reads Query only.
**Count:** 1

### 2026-06-18 — Search race overwrote results

**What happened:** Typeahead fired requests without `signal`; slow response replaced newer results.
**Rule (if any):** `async-ui.mdc`
**Fix:** Debounced query key + `signal` forwarded to Axios.
**Count:** 1

### 2026-06-22 — Admin button with no API enforcement

**What happened:** Delete button hidden with `user.role === 'admin'`; API still allowed DELETE for any authenticated user.
**Rule (if any):** `frontend-security.mdc`
**Fix:** Backend `403`; mutation `onError` toast on client.
**Count:** 1

### 2026-06-25 — isLoading + isSubmitting + isSaving on one form

**What happened:** Page combined five booleans for save/draft/publish; button disabled state wrong during background refetch.
**Rule (if any):** `error-handling.mdc`
**Fix:** `submitStatus` union in `useSubmitItem`; `isRefreshing` separate from submit.
**Count:** 1

### 2026-06-28 — Full reload on `online` event

**What happened:** `window.addEventListener('online', () => location.reload())` wiped unsaved draft.
**Rule (if any):** `offline-reconnect.mdc`, `forms-and-drafts.mdc`
**Fix:** Rely on Query `refetchOnReconnect`; offline banner only.
**Count:** 1

---

Promoted rules from this process should link back here in their opening section when helpful.
