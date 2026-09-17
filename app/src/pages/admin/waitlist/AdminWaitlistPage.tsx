import { useMemo, useState } from "react";
import { Download, Search } from "lucide-react";
import { useAdminWaitlistList } from "@/api/features/waitlist/use-waitlist";
import type { WaitlistEntry } from "@/api/features/waitlist/waitlist.schema";
import { ApiRequestError } from "@/api/client";
import { getUserFacingApiErrorMessage } from "@/api/lib/api-error-message";
import { AppPageShell } from "@/components/layout/AppPageShell";
import { PortalBackdrop } from "@/components/portal/PortalBackdrop";
import { PortalTableSkeleton } from "@/components/portal/portal-skeletons";
import { cn } from "@/lib/utils";

function initialsFromName(name: string, email: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0]![0] ?? ""}${parts[1]![0] ?? ""}`.toUpperCase();
  }
  if (parts.length === 1 && parts[0]) {
    return parts[0].slice(0, 2).toUpperCase();
  }
  return email.slice(0, 2).toUpperCase() || "?";
}

function formatJoinedAt(value: string) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString(undefined, {
    month: "numeric",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function contactLabel(entry: WaitlistEntry) {
  if (entry.phone) return `${entry.email} · ${entry.phone}`;
  return entry.email;
}

function sourceBadge(source: WaitlistEntry["source"]) {
  switch (source) {
    case "booking":
      return {
        label: "Booking",
        className: "border-yellow/50 bg-yellow/15 text-zinc-900",
      };
    case "newsletter":
      return {
        label: "Newsletter",
        className: "border-green/40 bg-green/10 text-green",
      };
    case "join_club":
    default:
      return {
        label: "Join club",
        className: "border-zinc-300 bg-zinc-100 text-zinc-600",
      };
  }
}

function exportCsv(entries: WaitlistEntry[]) {
  const header = ["Name", "Email", "Phone", "Joined at", "Source"];
  const rows = entries.map((entry) => [
    entry.name || "",
    entry.email,
    entry.phone || "",
    entry.createdAt || "",
    entry.source,
  ]);
  const csv = [header, ...rows]
    .map((row) =>
      row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(","),
    )
    .join("\n");

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `pickle-era-players-${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

function opsMessage(error: unknown): string {
  if (error instanceof ApiRequestError) {
    if (error.statusCode === 401) {
      return "Players list requires API admin Basic Auth in this environment. Use Swagger (/docs), curl, or TablePlus until session-authenticated admin APIs ship.";
    }
    if (error.statusCode === 404) {
      return "Admin players API is not mounted (common in production without ADMIN_BASIC_AUTH_*). Review leads via Swagger, curl, or the database.";
    }
  }
  return getUserFacingApiErrorMessage(error);
}

export function AdminPlayersPage() {
  const [query, setQuery] = useState("");
  const [exporting, setExporting] = useState(false);
  const { data, isPending, isError, error } = useAdminWaitlistList(query);

  const visible = useMemo(() => {
    const entries = data?.items ?? [];
    const q = query.trim().toLowerCase();
    if (!q || q.length < 2) return entries;
    return entries.filter((entry) => {
      return (
        entry.name.toLowerCase().includes(q) ||
        entry.email.toLowerCase().includes(q) ||
        (entry.phone ?? "").toLowerCase().includes(q)
      );
    });
  }, [data?.items, query]);

  const entries = data?.items ?? [];
  const tablePending = isPending && !data;

  function onExport() {
    if (visible.length === 0 || exporting) return;
    setExporting(true);
    try {
      exportCsv(visible);
    } finally {
      window.setTimeout(() => setExporting(false), 250);
    }
  }

  return (
    <div className="relative min-h-full overflow-hidden">
      <PortalBackdrop variant="top" />

      <AppPageShell width="full" className="relative z-10 max-w-5xl">
        <header className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="flex flex-col gap-2">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-400">
              Members & growth
            </p>
            <h1 className="display text-[42px] text-zinc-900 sm:text-[52px]">
              Players
            </h1>
            <p className="text-sm text-zinc-500">
              Leads from newsletter signup and court bookings (product API).
            </p>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <label className="relative min-w-0 flex-1 sm:w-64">
              <span className="sr-only">Search players</span>
              <Search
                size={16}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"
                aria-hidden
              />
              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search players…"
                className="h-11 w-full rounded-xl border border-zinc-200 bg-white pl-10 pr-3 text-sm text-zinc-900 outline-none placeholder:text-zinc-400 focus:border-yellow"
              />
            </label>
            <button
              type="button"
              onClick={onExport}
              disabled={visible.length === 0 || exporting}
              className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-yellow px-4 text-[11px] font-bold uppercase tracking-[0.14em] text-black transition hover:bg-yellow/90 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Download size={15} aria-hidden />
              {exporting ? "Exporting…" : "Export"}
            </button>
          </div>
        </header>

        <div className="overflow-hidden rounded-2xl border border-zinc-200/80 bg-white shadow-sm">
          {tablePending ? (
            <PortalTableSkeleton />
          ) : isError ? (
            <div className="px-5 py-10 text-sm text-zinc-600" role="alert">
              <p className="font-medium text-zinc-900">
                Could not load players from API
              </p>
              <p className="mt-2 max-w-xl leading-relaxed">
                {opsMessage(error)}
              </p>
            </div>
          ) : visible.length === 0 ? (
            <div className="px-5 py-10 text-sm text-zinc-500">
              {entries.length === 0
                ? "No players yet. Entries appear after newsletter signup or a public booking."
                : "No leads match your search."}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] border-collapse text-left">
                <thead>
                  <tr className="border-b border-zinc-200 text-[10px] font-semibold uppercase tracking-[0.16em] text-zinc-400">
                    <th className="px-4 py-3 font-semibold sm:px-5">Name</th>
                    <th className="px-4 py-3 font-semibold sm:px-5">Contact</th>
                    <th className="px-4 py-3 font-semibold sm:px-5">
                      Joined at
                    </th>
                    <th className="px-4 py-3 font-semibold sm:px-5">Source</th>
                  </tr>
                </thead>
                <tbody>
                  {visible.map((entry) => {
                    const badge = sourceBadge(entry.source);
                    return (
                      <tr
                        key={entry.id}
                        className="border-b border-zinc-100 last:border-b-0"
                      >
                        <td className="px-4 py-3.5 sm:px-5">
                          <div className="flex items-center gap-3">
                            <span
                              className={cn(
                                "grid size-9 shrink-0 place-items-center rounded-full",
                                "bg-yellow text-[11px] font-bold tracking-wide text-black",
                              )}
                              aria-hidden
                            >
                              {initialsFromName(entry.name, entry.email)}
                            </span>
                            <span className="text-sm font-medium text-zinc-900">
                              {entry.name || "No name"}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3.5 text-sm text-zinc-600 sm:px-5">
                          {contactLabel(entry)}
                        </td>
                        <td className="px-4 py-3.5 text-sm text-zinc-600 sm:px-5">
                          {formatJoinedAt(entry.createdAt)}
                        </td>
                        <td className="px-4 py-3.5 sm:px-5">
                          <span
                            className={cn(
                              "inline-flex items-center rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em]",
                              badge.className,
                            )}
                          >
                            {badge.label}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {!isError ? (
          <p className="mt-4 text-xs text-zinc-400">
            Showing {visible.length} of {entries.length} player
            {entries.length === 1 ? "" : "s"}.
          </p>
        ) : null}
      </AppPageShell>
    </div>
  );
}
