---
name: optimistic-ui
description: >-
  Applies TanStack Query optimistic cache updates for mutations in this app.
  Use when adding or changing useMutation, invalidateQueries, or onMutate.
---

# Optimistic UI

**Default yes** — if the UI already has the next cache shape, patch Query before the response.

## Gate

Optimistic when all of:

1. The screen reads TanStack Query (not a local form draft).
2. The next field or status is known without a server-minted id.
3. Failure is reversible by restoring a snapshot.

Otherwise invalidate and keep pending on the control.

## Recipe

In query hooks (not pages):

1. `cancelQueries` for touched keys
2. Snapshot `getQueryData` / `getQueriesData`
3. `setQueryData` / `setQueriesData`
4. `onError` — restore snapshot + error toast; **no** success toast
5. `onSuccess` — success toast only if the hook already toasts success
6. `onSettled` — `invalidateQueries` (quiet confirm)

Do not use React `useOptimistic`. Do not invent rows that need a server id (creates, invites, uploads). Status-only patches — no fake timestamps.

## Never

- Payments, checkout, or irreversible money moves
- Long-running jobs / AI generate
- File uploads
- Creates that need a real server id
- Account/profile form saves that already feel instant as a local draft
