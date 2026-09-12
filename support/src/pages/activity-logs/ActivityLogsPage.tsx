import { useMemo, useState } from "react";
import { ApiRequestError } from "@/api/client";
import {
  useActivityLogDetail,
  useActivityLogsList,
} from "@/api/features/activity-logs/use-activity-logs";
import type { ActivityLogKind } from "@/api/features/activity-logs/activity-logs.schema";
import { AppPageShell, PageHeader } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const PAGE_SIZE = 20;

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

function toDatetimeLocalValue(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function defaultRange(): { from: string; to: string } {
  const to = new Date();
  const from = new Date(to.getTime() - 24 * 60 * 60 * 1000);
  return { from: toDatetimeLocalValue(from), to: toDatetimeLocalValue(to) };
}

function toIso(local: string): string {
  return new Date(local).toISOString();
}

function isStoreUnavailable(error: unknown): boolean {
  return (
    error instanceof ApiRequestError &&
    (error.code === "ACTIVITY_LOGS_UNAVAILABLE" || error.statusCode === 503)
  );
}

export function ActivityLogsPage() {
  const [page, setPage] = useState(1);
  const [kind, setKind] = useState<ActivityLogKind>("http");
  const rangeDefaults = useMemo(() => defaultRange(), []);
  const [fromLocal, setFromLocal] = useState(rangeDefaults.from);
  const [toLocal, setToLocal] = useState(rangeDefaults.to);
  const [pathContains, setPathContains] = useState("");
  const [method, setMethod] = useState("all");
  const [statusClass, setStatusClass] = useState("all");
  const [queue, setQueue] = useState("");
  const [jobName, setJobName] = useState("");
  const [jobStatus, setJobStatus] = useState("all");
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const query = {
    page,
    limit: PAGE_SIZE,
    from: toIso(fromLocal),
    to: toIso(toLocal),
    kind,
    ...(method !== "all" ? { method } : {}),
    ...(statusClass !== "all" ? { status_class: statusClass } : {}),
    ...(pathContains.trim() ? { path_contains: pathContains.trim() } : {}),
    ...(queue.trim() ? { queue: queue.trim() } : {}),
    ...(jobName.trim() ? { job_name: jobName.trim() } : {}),
    ...(jobStatus !== "all" ? { job_status: jobStatus } : {}),
  };

  const list = useActivityLogsList(query, autoRefresh ? 8000 : undefined);
  const detail = useActivityLogDetail(selectedId);
  const unavailable = isStoreUnavailable(list.error);
  const items = list.data?.items ?? [];
  const totalPages = list.data?.meta?.total_pages ?? 1;

  return (
    <AppPageShell width="full">
      <PageHeader
        title="Activity logs"
        description="HTTP and job events from the API. Metadata in the table; bodies in the detail view."
        action={
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
            />
            Auto-refresh
          </label>
        }
      />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <FilterField label="Kind">
          <select
            className="border-input bg-background h-9 w-full rounded-md border px-2 text-sm"
            value={kind}
            onChange={(e) => {
              setKind(e.target.value as ActivityLogKind);
              setPage(1);
            }}
          >
            <option value="http">HTTP</option>
            <option value="job">Jobs</option>
          </select>
        </FilterField>
        <FilterField label="From">
          <Input
            type="datetime-local"
            value={fromLocal}
            onChange={(e) => {
              setFromLocal(e.target.value);
              setPage(1);
            }}
          />
        </FilterField>
        <FilterField label="To">
          <Input
            type="datetime-local"
            value={toLocal}
            onChange={(e) => {
              setToLocal(e.target.value);
              setPage(1);
            }}
          />
        </FilterField>
        {kind === "http" ? (
          <>
            <FilterField label="Method">
              <select
                className="border-input bg-background h-9 w-full rounded-md border px-2 text-sm"
                value={method}
                onChange={(e) => {
                  setMethod(e.target.value);
                  setPage(1);
                }}
              >
                <option value="all">Any method</option>
                <option value="GET">GET</option>
                <option value="POST">POST</option>
                <option value="PUT">PUT</option>
                <option value="PATCH">PATCH</option>
                <option value="DELETE">DELETE</option>
              </select>
            </FilterField>
            <FilterField label="Status">
              <select
                className="border-input bg-background h-9 w-full rounded-md border px-2 text-sm"
                value={statusClass}
                onChange={(e) => {
                  setStatusClass(e.target.value);
                  setPage(1);
                }}
              >
                <option value="all">Any status</option>
                <option value="2xx">2xx</option>
                <option value="3xx">3xx</option>
                <option value="4xx">4xx</option>
                <option value="5xx">5xx</option>
              </select>
            </FilterField>
            <FilterField label="Path contains">
              <Input
                value={pathContains}
                onChange={(e) => {
                  setPathContains(e.target.value);
                  setPage(1);
                }}
              />
            </FilterField>
          </>
        ) : (
          <>
            <FilterField label="Queue">
              <Input
                value={queue}
                onChange={(e) => {
                  setQueue(e.target.value);
                  setPage(1);
                }}
              />
            </FilterField>
            <FilterField label="Job name">
              <Input
                value={jobName}
                onChange={(e) => {
                  setJobName(e.target.value);
                  setPage(1);
                }}
              />
            </FilterField>
            <FilterField label="Result">
              <select
                className="border-input bg-background h-9 w-full rounded-md border px-2 text-sm"
                value={jobStatus}
                onChange={(e) => {
                  setJobStatus(e.target.value);
                  setPage(1);
                }}
              >
                <option value="all">Any result</option>
                <option value="completed">Completed</option>
                <option value="failed">Failed</option>
              </select>
            </FilterField>
          </>
        )}
      </div>

      {unavailable ? (
        <p className="text-muted-foreground text-sm">
          Activity log store is unavailable. Set LOGS_DATABASE_URL and restart
          the API.
        </p>
      ) : list.isPending ? (
        <p className="text-muted-foreground text-sm">Loading logs…</p>
      ) : list.isError ? (
        <p className="text-destructive text-sm">
          Could not load activity logs.
        </p>
      ) : items.length === 0 ? (
        <p className="text-muted-foreground text-sm">
          No activity in this range.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-md border">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="px-3 py-2 font-medium">Time</th>
                {kind === "http" ? (
                  <>
                    <th className="px-3 py-2 font-medium">Method</th>
                    <th className="px-3 py-2 font-medium">Path</th>
                    <th className="px-3 py-2 font-medium">Status</th>
                    <th className="px-3 py-2 font-medium">Duration</th>
                  </>
                ) : (
                  <>
                    <th className="px-3 py-2 font-medium">Queue</th>
                    <th className="px-3 py-2 font-medium">Job</th>
                    <th className="px-3 py-2 font-medium">Result</th>
                  </>
                )}
              </tr>
            </thead>
            <tbody>
              {items.map((row) => (
                <tr
                  key={row.id}
                  className="hover:bg-muted/40 cursor-pointer border-t"
                  onClick={() => setSelectedId(row.id)}
                >
                  <td className="px-3 py-2 whitespace-nowrap">
                    {new Date(row.timestamp).toLocaleString()}
                  </td>
                  {kind === "http" ? (
                    <>
                      <td className="px-3 py-2">{row.method ?? "—"}</td>
                      <td className="max-w-md truncate px-3 py-2">
                        {row.path ?? "—"}
                      </td>
                      <td className="px-3 py-2">{row.statusCode ?? "—"}</td>
                      <td className="px-3 py-2">
                        {row.durationMs == null ? "—" : `${row.durationMs} ms`}
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="px-3 py-2">{row.queue ?? "—"}</td>
                      <td className="px-3 py-2">{row.jobName ?? "—"}</td>
                      <td className="px-3 py-2">{row.jobStatus ?? "—"}</td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {totalPages > 1 ? (
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            Previous
          </Button>
          <span className="text-muted-foreground text-sm">
            Page {page} of {totalPages}
          </span>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </Button>
        </div>
      ) : null}

      {selectedId ? (
        <div className="bg-background/80 fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="bg-card max-h-[85vh] w-full max-w-2xl overflow-auto rounded-lg border p-4 shadow-lg">
            <div className="mb-3 flex items-start justify-between gap-4">
              <h2 className="text-lg font-semibold">Log detail</h2>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setSelectedId(null)}
              >
                Close
              </Button>
            </div>
            {detail.isPending ? (
              <p className="text-muted-foreground text-sm">Loading…</p>
            ) : detail.data ? (
              <pre className="overflow-x-auto text-xs whitespace-pre-wrap">
                {JSON.stringify(detail.data, null, 2)}
              </pre>
            ) : (
              <p className="text-destructive text-sm">
                Could not load this log.
              </p>
            )}
          </div>
        </div>
      ) : null}
    </AppPageShell>
  );
}

function FilterField({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1">
      <Label>{label}</Label>
      {children}
    </div>
  );
}
