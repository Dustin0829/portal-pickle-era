import { useMemo, useState } from "react";
import { AppPageShell } from "@/components/layout/AppPageShell";
import { OpenPlayLiveBoard } from "@/components/portal/OpenPlayLiveBoard";
import { PortalListSkeleton } from "@/components/portal/portal-skeletons";
import { useMyBookings } from "@/api/features/bookings/use-bookings";
import {
  useEndMyOpenPlayLiveGame,
  useMeOpenPlayLiveBoard,
} from "@/api/features/open-play-live/use-open-play-live";
import type { OpenPlayLiveBoard as OpenPlayLiveBoardDto } from "@/api/features/open-play-live/open-play-live.schema";
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

function MyStatusCard({
  board,
  onEndGame,
  isEndingGame,
}: {
  board: OpenPlayLiveBoardDto;
  onEndGame: (gameId: string) => void;
  isEndingGame: boolean;
}) {
  const [confirming, setConfirming] = useState(false);
  const myStatus = board.myStatus;

  if (!myStatus) {
    return (
      <div className="rounded-2xl border border-zinc-200/80 bg-white px-5 py-4 text-sm text-zinc-500">
        You are not on the roster for this session yet. Check with the desk.
      </div>
    );
  }

  const court = board.courts.find(
    (item) => item.courtId === myStatus.courtId && item.game !== null,
  );
  const partners =
    court?.game?.players.filter(
      (player) => player.participantId !== myStatus.participantId,
    ) ?? [];

  const headline =
    myStatus.state === "playing"
      ? `On ${myStatus.courtLabel ?? "court"}${myStatus.side ? ` · Side ${myStatus.side}` : ""}`
      : myStatus.state === "waiting"
        ? myStatus.queuePosition
          ? `Waiting · #${myStatus.queuePosition} in queue`
          : "Waiting for a spot"
        : myStatus.state === "not_checked_in"
          ? "Not checked in"
          : myStatus.participantStatus === "no_show"
            ? "Marked as a no show"
            : "You left this session";

  const detail =
    myStatus.state === "playing"
      ? partners.length > 0
        ? `With ${partners.map((player) => player.name).join(", ")}`
        : "Waiting for the rest of the foursome"
      : myStatus.state === "not_checked_in"
        ? "Check in at the desk to join the rotation."
        : myStatus.state === "waiting"
          ? "Staff will call you when a court opens."
          : "Talk to the desk to rejoin the rotation.";

  return (
    <section className="rounded-2xl border border-zinc-200/80 bg-white px-5 py-4">
      <h2 className="text-[10px] font-bold uppercase tracking-[0.14em] text-zinc-500">
        Your status
      </h2>
      <p className="mt-1 text-lg font-semibold text-zinc-900">{headline}</p>
      <p className="mt-1 text-sm text-zinc-500">{detail}</p>

      {myStatus.state === "playing" && myStatus.gameId ? (
        confirming ? (
          <div
            role="dialog"
            aria-label="End game"
            className="mt-4 rounded-xl border border-zinc-200 bg-zinc-50 p-4"
          >
            <p className="text-sm text-zinc-700">
              End this game for everyone on {myStatus.courtLabel ?? "the court"}
              ? The next players in line take the court.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                disabled={isEndingGame}
                aria-busy={isEndingGame}
                onClick={() => onEndGame(myStatus.gameId!)}
                className="h-11 rounded-xl bg-yellow px-4 text-[11px] font-bold uppercase tracking-[0.12em] text-black transition disabled:opacity-60"
              >
                {isEndingGame ? "Ending…" : "Confirm end game"}
              </button>
              <button
                type="button"
                onClick={() => setConfirming(false)}
                className="h-11 rounded-xl border border-zinc-200 px-4 text-[11px] font-bold uppercase tracking-[0.12em] text-zinc-600 transition hover:border-yellow"
              >
                Keep playing
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setConfirming(true)}
            className="mt-4 h-11 w-full rounded-xl bg-yellow px-4 text-[11px] font-bold uppercase tracking-[0.12em] text-black transition sm:w-auto"
          >
            End game
          </button>
        )
      ) : null}
    </section>
  );
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
  const {
    data: board,
    isPending: isBoardPending,
    isError: isBoardError,
    refetch: refetchBoard,
  } = useMeOpenPlayLiveBoard(query, Boolean(selected));
  const { mutate: endMyGame, isPending: isEndingGame } =
    useEndMyOpenPlayLiveGame();

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
            Your live session — where you stand, who is on court, and who is up
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

            {isBoardPending && !board ? (
              <PortalListSkeleton rows={4} />
            ) : isBoardError ? (
              <div
                className="rounded-2xl border border-zinc-200/80 bg-white px-5 py-8 text-sm text-zinc-500"
                role="alert"
              >
                <p>Could not load the Open Play session.</p>
                <button
                  type="button"
                  onClick={() => void refetchBoard()}
                  className="mt-3 text-[11px] font-bold uppercase tracking-[0.14em] text-amber-700 hover:text-zinc-900"
                >
                  Try again
                </button>
              </div>
            ) : board ? (
              <div className="flex flex-col gap-6">
                <MyStatusCard
                  board={board}
                  onEndGame={(gameId) => endMyGame(gameId)}
                  isEndingGame={isEndingGame}
                />
                <OpenPlayLiveBoard
                  board={board}
                  highlightParticipantId={board.myStatus?.participantId ?? null}
                />
              </div>
            ) : null}
          </>
        )}
      </AppPageShell>
    </div>
  );
}
