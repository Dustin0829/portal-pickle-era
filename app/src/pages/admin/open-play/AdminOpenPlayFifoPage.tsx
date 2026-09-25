import { useMemo, useState } from "react";
import { AppPageShell } from "@/components/layout/AppPageShell";
import { OpenPlayFifoBoardView } from "@/components/portal/OpenPlayFifoBoardView";
import { PortalListSkeleton } from "@/components/portal/portal-skeletons";
import { useAdminOpenPlayFifoBoard } from "@/api/features/bookings/use-bookings";
import { useOpenPlaySlots } from "@/lib/booking/openPlaySlots";
import { dateKey } from "@/lib/booking/booking";
import { cn } from "@/lib/utils";

function todayIso() {
  return dateKey(new Date());
}

export function AdminOpenPlayFifoPage() {
  const sessions = useOpenPlaySlots();
  const [date, setDate] = useState(todayIso);
  const [slotId, setSlotId] = useState(() => sessions[0]?.id ?? "07:00");
  const query = useMemo(() => ({ date, slotId }), [date, slotId]);
  const { data, isPending, isError, refetch, error } =
    useAdminOpenPlayFifoBoard(query);

  return (
    <div className="relative min-h-full overflow-hidden">
      <AppPageShell width="wide" className="relative z-10">
        <header className="mb-6 flex flex-col gap-2">
          <h1 className="display text-[28px] text-zinc-900 sm:text-[32px]">
            Open Play queue
          </h1>
          <p className="max-w-xl text-sm text-zinc-500">
            Opening wave by booking order (FIFO). Approved seats only — first
            booked, first on court.
          </p>
        </header>

        <div className="mb-6 flex flex-wrap items-end gap-3">
          <label className="flex flex-col gap-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-zinc-500">
            Date
            <input
              type="date"
              value={date}
              onChange={(event) => setDate(event.target.value)}
              className="h-11 rounded-xl border border-zinc-200 bg-white px-3 text-sm font-medium normal-case tracking-normal text-zinc-900"
            />
          </label>
          <div
            role="group"
            aria-label="Open Play session"
            className="flex flex-wrap gap-1.5"
          >
            {sessions.map((session) => (
              <button
                key={session.id}
                type="button"
                onClick={() => setSlotId(session.id)}
                className={cn(
                  "h-11 rounded-xl px-4 text-[11px] font-bold uppercase tracking-[0.12em] transition",
                  slotId === session.id
                    ? "bg-yellow text-black"
                    : "border border-zinc-200 bg-white text-zinc-600 hover:border-yellow",
                )}
              >
                {session.label}
              </button>
            ))}
          </div>
        </div>

        {isPending && !data ? (
          <PortalListSkeleton rows={4} />
        ) : isError ? (
          <div
            className="rounded-2xl border border-zinc-200/80 bg-white px-5 py-8 text-sm text-zinc-500"
            role="alert"
          >
            <p>Could not load the Open Play queue.</p>
            <button
              type="button"
              onClick={() => void refetch()}
              className="mt-3 text-[11px] font-bold uppercase tracking-[0.14em] text-amber-700 hover:text-zinc-900"
            >
              Try again
            </button>
            {error ? (
              <p className="mt-2 text-xs text-zinc-400">
                {String(error.message)}
              </p>
            ) : null}
          </div>
        ) : data ? (
          <OpenPlayFifoBoardView board={data} />
        ) : (
          <div className="rounded-2xl border border-zinc-200/80 bg-white px-5 py-8 text-sm text-zinc-500">
            No approved Open Play seats for this session yet.
          </div>
        )}
      </AppPageShell>
    </div>
  );
}
