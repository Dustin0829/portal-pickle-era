import { useMemo, useState } from "react";
import { AppPageShell } from "@/components/layout/AppPageShell";
import { OpenPlayFifoBoardView } from "@/components/portal/OpenPlayFifoBoardView";
import { PortalListSkeleton } from "@/components/portal/portal-skeletons";
import {
  useMeOpenPlayFifoBoard,
  useMyBookings,
} from "@/api/features/bookings/use-bookings";
import { dateKey, formatLongDate } from "@/lib/booking/booking";
import { useOpenPlaySlots } from "@/lib/booking/openPlaySlots";
import { cn } from "@/lib/utils";

function todayIso() {
  return dateKey(new Date());
}

type OpenPlaySessionKey = {
  date: string;
  slotId: string;
  bookingId: string;
};

function sessionKeyId(key: OpenPlaySessionKey) {
  return `${key.bookingId}:${key.date}:${key.slotId}`;
}

function pickDefaultSession(
  bookings: OpenPlaySessionKey[],
  today: string,
): OpenPlaySessionKey | null {
  if (bookings.length === 0) return null;
  const upcoming = bookings
    .filter((b) => b.date >= today)
    .sort((a, b) =>
      a.date === b.date
        ? a.slotId.localeCompare(b.slotId)
        : a.date.localeCompare(b.date),
    );
  if (upcoming[0]) return upcoming[0];
  return [...bookings].sort((a, b) =>
    a.date === b.date
      ? b.slotId.localeCompare(a.slotId)
      : b.date.localeCompare(a.date),
  )[0]!;
}

function toSessionKeys(
  items: Array<{
    id: string;
    plan: string;
    status: string;
    date: string;
    slotIds: string[];
  }>,
): OpenPlaySessionKey[] {
  const keys: OpenPlaySessionKey[] = [];
  for (const booking of items) {
    if (booking.plan !== "open-play" || booking.status !== "approved") continue;
    const slotId = booking.slotIds[0];
    if (!slotId) continue;
    keys.push({ date: booking.date, slotId, bookingId: booking.id });
  }
  keys.sort((a, b) =>
    a.date === b.date
      ? a.slotId.localeCompare(b.slotId)
      : a.date.localeCompare(b.date),
  );
  return keys;
}

export function OpenPlayPage() {
  const sessions = useOpenPlaySlots();
  const { data: bookings, isPending: bookingsPending } = useMyBookings();
  const sessionKeys = useMemo(() => toSessionKeys(bookings ?? []), [bookings]);
  const today = todayIso();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const defaultSession = useMemo(
    () => pickDefaultSession(sessionKeys, today),
    [sessionKeys, today],
  );
  const selected = useMemo(() => {
    if (sessionKeys.length === 0) return null;
    if (selectedId) {
      const match = sessionKeys.find((k) => sessionKeyId(k) === selectedId);
      if (match) return match;
    }
    return defaultSession;
  }, [sessionKeys, selectedId, defaultSession]);

  const query = useMemo(
    () =>
      selected
        ? { date: selected.date, slotId: selected.slotId }
        : { date: "", slotId: "" },
    [selected],
  );
  const boardQuery = useMeOpenPlayFifoBoard(query, Boolean(selected));
  const slotLabel =
    sessions.find((s) => s.id === selected?.slotId)?.label ??
    selected?.slotId ??
    "";

  return (
    <div className="relative min-h-full overflow-hidden">
      <AppPageShell width="wide" className="relative z-10">
        <header className="mb-6 flex flex-col gap-2">
          <h1 className="display text-[28px] text-zinc-900 sm:text-[32px]">
            Open <span className="text-yellow">Play</span>
          </h1>
          <p className="max-w-xl text-sm text-zinc-500">
            Your session rotation by booking order — courts, sides, and who is
            next.
          </p>
        </header>

        {bookingsPending && !bookings ? (
          <PortalListSkeleton rows={4} />
        ) : sessionKeys.length === 0 ? (
          <div className="rounded-2xl border border-zinc-200/80 bg-white px-5 py-8 text-sm text-zinc-500">
            No schedule for open play
          </div>
        ) : (
          <>
            {sessionKeys.length > 1 ? (
              <div
                role="group"
                aria-label="Your Open Play sessions"
                className="mb-6 flex flex-wrap gap-1.5"
              >
                {sessionKeys.map((key) => {
                  const label =
                    sessions.find((s) => s.id === key.slotId)?.label ??
                    key.slotId;
                  const active =
                    selected != null &&
                    sessionKeyId(selected) === sessionKeyId(key);
                  return (
                    <button
                      key={sessionKeyId(key)}
                      type="button"
                      onClick={() => setSelectedId(sessionKeyId(key))}
                      className={cn(
                        "h-11 rounded-xl px-4 text-[11px] font-bold uppercase tracking-[0.12em] transition",
                        active
                          ? "bg-yellow text-black"
                          : "border border-zinc-200 bg-white text-zinc-600 hover:border-yellow",
                      )}
                    >
                      {formatLongDate(key.date)} · {label}
                    </button>
                  );
                })}
              </div>
            ) : selected ? (
              <p className="mb-6 text-sm text-zinc-500">
                {formatLongDate(selected.date)}
                {slotLabel ? ` · ${slotLabel}` : ""}
              </p>
            ) : null}

            {boardQuery.isPending && !boardQuery.data ? (
              <PortalListSkeleton rows={4} />
            ) : boardQuery.isError ? (
              <div
                className="rounded-2xl border border-zinc-200/80 bg-white px-5 py-8 text-sm text-zinc-500"
                role="alert"
              >
                <p>Could not load the Open Play rotation.</p>
                <button
                  type="button"
                  onClick={() => void boardQuery.refetch()}
                  className="mt-3 text-[11px] font-bold uppercase tracking-[0.14em] text-amber-700 hover:text-zinc-900"
                >
                  Try again
                </button>
              </div>
            ) : boardQuery.data ? (
              <OpenPlayFifoBoardView
                board={boardQuery.data}
                highlightBookingId={selected?.bookingId}
              />
            ) : null}
          </>
        )}
      </AppPageShell>
    </div>
  );
}
