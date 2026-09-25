import { useMemo, useState } from "react";
import { AppPageShell } from "@/components/layout/AppPageShell";
import { PortalListSkeleton } from "@/components/portal/portal-skeletons";
import { useAdminOpenPlayFifoBoard } from "@/api/features/bookings/use-bookings";
import type { OpenPlayFifoFoursome } from "@/api/features/bookings/bookings.schema";
import { useOpenPlaySlots } from "@/lib/booking/openPlaySlots";
import { dateKey } from "@/lib/booking/booking";
import { cn } from "@/lib/utils";

function todayIso() {
  return dateKey(new Date());
}

function FoursomeCard({
  foursome,
  title,
}: {
  foursome: OpenPlayFifoFoursome;
  title: string;
}) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-4">
      <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-zinc-500">
        {title}
      </p>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-yellow">
            Side A
          </p>
          <ul className="mt-1 space-y-1 text-sm text-zinc-800">
            {foursome.sideA.map((p) => (
              <li key={p.bookingId}>
                #{p.queueIndex} {p.name}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-zinc-500">
            Side B
          </p>
          <ul className="mt-1 space-y-1 text-sm text-zinc-800">
            {foursome.sideB.map((p) => (
              <li key={p.bookingId}>
                #{p.queueIndex} {p.name}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
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
        ) : !data || data.players.length === 0 ? (
          <div className="rounded-2xl border border-zinc-200/80 bg-white px-5 py-8 text-sm text-zinc-500">
            No approved Open Play seats for this session yet.
          </div>
        ) : (
          <div className="flex flex-col gap-8">
            <section>
              <h2 className="mb-3 text-sm font-semibold text-zinc-900">
                On courts ({data.courts.length})
              </h2>
              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                {data.courts.map((foursome) => (
                  <FoursomeCard
                    key={foursome.courtId ?? foursome.sideA[0]?.bookingId}
                    foursome={foursome}
                    title={foursome.courtLabel ?? "Court"}
                  />
                ))}
              </div>
            </section>

            {data.nextUp.length > 0 ? (
              <section>
                <h2 className="mb-3 text-sm font-semibold text-zinc-900">
                  Next up
                </h2>
                <div className="grid gap-3 md:grid-cols-2">
                  {data.nextUp.map((foursome, index) => (
                    <FoursomeCard
                      key={`next-${foursome.sideA[0]?.bookingId}`}
                      foursome={foursome}
                      title={`Wave ${index + 1}`}
                    />
                  ))}
                </div>
              </section>
            ) : null}

            {data.remainder.length > 0 ? (
              <section>
                <h2 className="mb-3 text-sm font-semibold text-zinc-900">
                  Waiting for a full foursome
                </h2>
                <ul className="rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-800">
                  {data.remainder.map((p) => (
                    <li
                      key={p.bookingId}
                      className="border-t border-zinc-100 py-2 first:border-t-0 first:pt-0"
                    >
                      #{p.queueIndex} {p.name}
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}
          </div>
        )}
      </AppPageShell>
    </div>
  );
}
