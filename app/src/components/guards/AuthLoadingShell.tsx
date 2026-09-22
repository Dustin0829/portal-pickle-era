import { Skeleton } from "@/components/ui/skeleton";

/**
 * In-content session check — render inside portal chrome so the sidebar
 * stays mounted while auth status is `loading`. Never use AuthLayout/login.
 */
export function AuthLoadingShell({ label = "Loading" }: { label?: string }) {
  return (
    <div
      className="mx-auto flex min-h-[50vh] w-full max-w-3xl flex-col gap-4 px-4 py-10 sm:px-6"
      role="status"
      aria-live="polite"
      aria-label={label}
    >
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">
        {label}
      </p>
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-4 w-72" />
      <Skeleton className="mt-4 h-40 w-full" />
    </div>
  );
}
