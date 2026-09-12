import { Skeleton } from "@/components/ui/skeleton";

export function AuthLoadingShell({ label = "Loading" }: { label?: string }) {
  return (
    <div
      className="mx-auto flex min-h-[50vh] w-full max-w-3xl flex-col gap-4 px-4 py-10 sm:px-6"
      role="status"
      aria-live="polite"
      aria-label={label}
    >
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-4 w-72" />
      <Skeleton className="mt-4 h-40 w-full" />
    </div>
  );
}
