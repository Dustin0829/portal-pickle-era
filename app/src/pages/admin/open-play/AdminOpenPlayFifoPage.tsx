import { useMemo, useState } from "react";
import { AppPageShell } from "@/components/layout/AppPageShell";
import { OpenPlayLiveBoard } from "@/components/portal/OpenPlayLiveBoard";
import { PortalListSkeleton } from "@/components/portal/portal-skeletons";
import {
  useAdminOpenPlayLiveBoard,
  useCheckInOpenPlayLiveParticipant,
  useEndAdminOpenPlayLiveGame,
  useMarkOpenPlayLiveParticipantLeft,
  useMarkOpenPlayLiveParticipantNoShow,
  usePatchAdminOpenPlayLiveSession,
  useSetOpenPlayLiveCourtAvailable,
  useSetOpenPlayLiveCourtUnavailable,
  useStartOpenPlayLiveGame,
} from "@/api/features/open-play-live/use-open-play-live";
import type {
  OpenPlayLiveBoard as OpenPlayLiveBoardDto,
  OpenPlayLiveParticipantStatus,
  OpenPlayLiveSessionStatus,
} from "@/api/features/open-play-live/open-play-live.schema";
import { useOpenPlaySlots } from "@/lib/booking/openPlaySlots";
import { dateKey } from "@/lib/booking/booking";
import { cn } from "@/lib/utils";

const GAME_SEATS = 4;

const SESSION_STATUS_LABEL: Record<OpenPlayLiveSessionStatus, string> = {
  upcoming: "Upcoming",
  live: "Live",
  completed: "Completed",
  cancelled: "Cancelled",
};

const SESSION_STATUS_CLASS: Record<OpenPlayLiveSessionStatus, string> = {
  upcoming: "bg-zinc-100 text-zinc-600",
  live: "bg-emerald-100 text-emerald-800",
  completed: "bg-zinc-200 text-zinc-600",
  cancelled: "bg-red-100 text-red-700",
};

const ALLOWED_TRANSITIONS: Record<
  OpenPlayLiveSessionStatus,
  OpenPlayLiveSessionStatus[]
> = {
  upcoming: ["live", "cancelled"],
  live: ["completed", "cancelled"],
  completed: [],
  cancelled: [],
};

const PARTICIPANT_STATUS_LABEL: Record<OpenPlayLiveParticipantStatus, string> =
  {
    booked: "Booked",
    checked_in: "Checked in",
    no_show: "No show",
    left_session: "Left",
  };

function todayIso() {
  return dateKey(new Date());
}

const actionButtonClass =
  "h-11 rounded-xl border border-zinc-200 bg-white px-3 text-[11px] font-bold uppercase tracking-[0.12em] text-zinc-600 transition hover:border-yellow disabled:opacity-50 disabled:hover:border-zinc-200";

const primaryButtonClass =
  "h-11 rounded-xl bg-yellow px-4 text-[11px] font-bold uppercase tracking-[0.12em] text-black transition disabled:opacity-50";

function ParticipantRoster({
  board,
  onCheckIn,
  onNoShow,
  onLeft,
  isBusy,
}: {
  board: OpenPlayLiveBoardDto;
  onCheckIn: (participantId: string) => void;
  onNoShow: (participantId: string) => void;
  onLeft: (participantId: string) => void;
  isBusy: boolean;
}) {
  if (board.participants.length === 0) {
    return (
      <p className="rounded-xl border border-zinc-200 bg-white px-4 py-5 text-sm text-zinc-500">
        No approved Open Play seats for this session yet.
      </p>
    );
  }

  return (
    <ul className="flex flex-col gap-2">
      {board.participants.map((participant) => (
        <li
          key={participant.id}
          className="flex flex-wrap items-center gap-3 rounded-xl border border-zinc-200 bg-white px-4 py-3"
        >
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-zinc-900">
              {participant.name}
            </p>
            <p className="text-[11px] uppercase tracking-[0.12em] text-zinc-400">
              {PARTICIPANT_STATUS_LABEL[participant.status]}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              className={actionButtonClass}
              disabled={
                isBusy ||
                board.session.status !== "live" ||
                participant.status === "checked_in" ||
                participant.status === "no_show" ||
                participant.status === "left_session"
              }
              onClick={() => onCheckIn(participant.id)}
            >
              Check in
            </button>
            <button
              type="button"
              className={actionButtonClass}
              disabled={isBusy || participant.status !== "booked"}
              onClick={() => onNoShow(participant.id)}
            >
              No show
            </button>
            <button
              type="button"
              className={actionButtonClass}
              disabled={isBusy || participant.status !== "checked_in"}
              onClick={() => onLeft(participant.id)}
            >
              Left
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
}

export function AdminOpenPlayFifoPage() {
  const sessions = useOpenPlaySlots();
  const [date, setDate] = useState(todayIso);
  const [slotId, setSlotId] = useState(() => sessions[0]?.id ?? "07:00");
  const query = useMemo(() => ({ date, slotId }), [date, slotId]);
  const {
    data: board,
    isPending,
    isError,
    refetch,
    error,
  } = useAdminOpenPlayLiveBoard(query);

  const { mutate: patchSession, isPending: isPatchingSession } =
    usePatchAdminOpenPlayLiveSession();
  const { mutate: checkIn, isPending: isCheckingIn } =
    useCheckInOpenPlayLiveParticipant();
  const { mutate: markNoShow, isPending: isMarkingNoShow } =
    useMarkOpenPlayLiveParticipantNoShow();
  const { mutate: markLeft, isPending: isMarkingLeft } =
    useMarkOpenPlayLiveParticipantLeft();
  const { mutate: endGame, isPending: isEndingGame } =
    useEndAdminOpenPlayLiveGame();
  const { mutate: setCourtUnavailable, isPending: isBlockingCourt } =
    useSetOpenPlayLiveCourtUnavailable();
  const { mutate: setCourtAvailable, isPending: isFreeingCourt } =
    useSetOpenPlayLiveCourtAvailable();
  const { mutate: startGame, isPending: isStartingGame } =
    useStartOpenPlayLiveGame();

  const isRosterBusy = isCheckingIn || isMarkingNoShow || isMarkingLeft;
  const isCourtBusy =
    isEndingGame || isBlockingCourt || isFreeingCourt || isStartingGame;

  const status = board?.session.status ?? "upcoming";
  const allowed = ALLOWED_TRANSITIONS[status];
  const hasActiveGame = Boolean(board?.courts.some((court) => court.game));
  const nextFour = (board?.upNext ?? [])
    .slice(0, GAME_SEATS)
    .map((entry) => entry.participantId);

  return (
    <div className="relative min-h-full overflow-hidden">
      <AppPageShell width="wide" className="relative z-10">
        <header className="mb-6 flex flex-col gap-2">
          <h1 className="display text-[28px] text-zinc-900 sm:text-[32px]">
            Open Play live
          </h1>
          <p className="max-w-xl text-sm text-zinc-500">
            Run the session: check players in, start games, and rotate the queue
            as courts free up.
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

        {isPending && !board ? (
          <PortalListSkeleton rows={4} />
        ) : isError ? (
          <div
            className="rounded-2xl border border-zinc-200/80 bg-white px-5 py-8 text-sm text-zinc-500"
            role="alert"
          >
            <p>Could not load the Open Play session.</p>
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
        ) : board ? (
          <div className="flex flex-col gap-8">
            <section className="flex flex-wrap items-center gap-3 rounded-2xl border border-zinc-200/80 bg-white px-5 py-4">
              <span
                className={cn(
                  "rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-[0.12em]",
                  SESSION_STATUS_CLASS[status],
                )}
              >
                {SESSION_STATUS_LABEL[status]}
              </span>
              <p className="text-sm text-zinc-500">
                {board.checkedInCount} of {board.capacity} checked in
              </p>
              <div className="flex flex-1 flex-wrap justify-end gap-2">
                <button
                  type="button"
                  className={primaryButtonClass}
                  disabled={isPatchingSession || !allowed.includes("live")}
                  onClick={() => patchSession({ ...query, status: "live" })}
                >
                  Go live
                </button>
                <button
                  type="button"
                  className={actionButtonClass}
                  disabled={
                    isPatchingSession ||
                    !allowed.includes("completed") ||
                    hasActiveGame
                  }
                  title={
                    hasActiveGame
                      ? "End all active games before completing the session"
                      : undefined
                  }
                  onClick={() =>
                    patchSession({ ...query, status: "completed" })
                  }
                >
                  Complete
                </button>
                <button
                  type="button"
                  className={actionButtonClass}
                  disabled={isPatchingSession || !allowed.includes("cancelled")}
                  onClick={() =>
                    patchSession({ ...query, status: "cancelled" })
                  }
                >
                  Cancel
                </button>
              </div>
            </section>

            <OpenPlayLiveBoard
              board={board}
              renderCourtActions={(court) => {
                if (court.game) {
                  return (
                    <button
                      type="button"
                      className={actionButtonClass}
                      disabled={isCourtBusy}
                      onClick={() => endGame(court.game!.id)}
                    >
                      End game
                    </button>
                  );
                }
                if (court.state === "unavailable") {
                  return (
                    <button
                      type="button"
                      className={actionButtonClass}
                      disabled={isCourtBusy}
                      onClick={() =>
                        setCourtAvailable({ courtId: court.courtId, ...query })
                      }
                    >
                      Mark available
                    </button>
                  );
                }
                return (
                  <>
                    <button
                      type="button"
                      className={actionButtonClass}
                      disabled={
                        isCourtBusy ||
                        status !== "live" ||
                        nextFour.length < GAME_SEATS
                      }
                      onClick={() =>
                        startGame({
                          courtId: court.courtId,
                          ...query,
                          participantIds: nextFour,
                        })
                      }
                    >
                      Start next 4
                    </button>
                    <button
                      type="button"
                      className={actionButtonClass}
                      disabled={isCourtBusy}
                      onClick={() =>
                        setCourtUnavailable({
                          courtId: court.courtId,
                          ...query,
                        })
                      }
                    >
                      Mark unavailable
                    </button>
                  </>
                );
              }}
            />

            <section>
              <h2 className="mb-3 text-[11px] font-bold uppercase tracking-[0.14em] text-zinc-500">
                Roster
              </h2>
              <ParticipantRoster
                board={board}
                isBusy={isRosterBusy}
                onCheckIn={(participantId) => checkIn(participantId)}
                onNoShow={(participantId) => markNoShow(participantId)}
                onLeft={(participantId) => markLeft(participantId)}
              />
            </section>
          </div>
        ) : null}
      </AppPageShell>
    </div>
  );
}
