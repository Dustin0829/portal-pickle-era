import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

/**
 * Portal query loading contract:
 * - `isPending && !data` → show these skeletons
 * - `isFetching && data` → keep content (do not swap to a full skeleton)
 */

export function PortalStatSkeleton({
  className,
  count = 3,
}: {
  className?: string;
  count?: number;
}) {
  return (
    <div
      className={cn("grid gap-3 sm:grid-cols-3", className)}
      aria-busy="true"
      aria-label="Loading stats"
    >
      {Array.from({ length: count }, (_, index) => (
        <div
          key={index}
          className="rounded-2xl border border-zinc-200/80 bg-white p-4 shadow-sm sm:p-5"
        >
          <Skeleton className="h-3 w-20" />
          <Skeleton className="mt-4 h-8 w-24" />
          <Skeleton className="mt-2 h-3 w-28" />
        </div>
      ))}
    </div>
  );
}

export function PortalListSkeleton({
  className,
  rows = 4,
}: {
  className?: string;
  rows?: number;
}) {
  return (
    <ul
      className={cn("flex flex-col gap-3", className)}
      aria-busy="true"
      aria-label="Loading list"
    >
      {Array.from({ length: rows }, (_, index) => (
        <li
          key={index}
          className="overflow-hidden rounded-2xl border border-zinc-200/80 bg-white p-4 shadow-sm"
        >
          <div className="flex items-center gap-3">
            <Skeleton className="size-11 shrink-0 rounded-full" />
            <div className="min-w-0 flex-1 space-y-2">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-4 w-3/4 max-w-xs" />
              <Skeleton className="h-3 w-40" />
            </div>
            <Skeleton className="hidden h-8 w-20 shrink-0 rounded-full sm:block" />
          </div>
        </li>
      ))}
    </ul>
  );
}

export function PortalCalendarSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-zinc-200/80 bg-white shadow-sm",
        className,
      )}
      aria-busy="true"
      aria-label="Loading calendar"
    >
      <div className="flex shrink-0 items-center justify-between gap-3 border-b border-zinc-200 px-4 py-3">
        <Skeleton className="size-8 rounded-lg" />
        <Skeleton className="h-5 w-36" />
        <Skeleton className="size-8 rounded-lg" />
      </div>
      <div className="grid shrink-0 grid-cols-7 border-b border-zinc-200">
        {Array.from({ length: 7 }, (_, index) => (
          <div key={index} className="grid place-items-center py-2">
            <Skeleton className="h-3 w-6" />
          </div>
        ))}
      </div>
      <div className="grid min-h-0 flex-1 grid-cols-7 grid-rows-6">
        {Array.from({ length: 42 }, (_, index) => (
          <div
            key={index}
            className="border-b border-r border-zinc-100 p-2 last:border-r-0"
          >
            <Skeleton className="mb-2 h-3 w-5" />
            <Skeleton className="h-2 w-full" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function PortalTableSkeleton({
  className,
  rows = 6,
  columns = 4,
}: {
  className?: string;
  rows?: number;
  columns?: number;
}) {
  return (
    <div
      className={cn("overflow-x-auto", className)}
      aria-busy="true"
      aria-label="Loading table"
    >
      <table className="w-full min-w-[640px] border-collapse text-left">
        <thead>
          <tr className="border-b border-zinc-200">
            {Array.from({ length: columns }, (_, index) => (
              <th key={index} className="px-4 py-3 sm:px-5">
                <Skeleton className="h-3 w-16" />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rows }, (_, row) => (
            <tr key={row} className="border-b border-zinc-100 last:border-b-0">
              {Array.from({ length: columns }, (_, col) => (
                <td key={col} className="px-4 py-3.5 sm:px-5">
                  <Skeleton
                    className={cn("h-4", col === 0 ? "w-28" : "w-36")}
                  />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
