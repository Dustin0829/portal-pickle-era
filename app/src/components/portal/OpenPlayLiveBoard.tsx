import { useEffect, useState, type ReactNode } from "react";
import type {
  OpenPlayLiveBoard as OpenPlayLiveBoardDto,
  OpenPlayLiveCourt,
  OpenPlayLiveCourtState,
} from "@/api/features/open-play-live/open-play-live.schema";
import { cn } from "@/lib/utils";

const COURT_STATE_LABEL: Record<OpenPlayLiveCourtState, string> = {
  available: "Open",
  ready: "Ready",
  playing: "Playing",
  game_over: "Game over",
  unavailable: "Unavailable",
};

const COURT_STATE_CLASS: Record<OpenPlayLiveCourtState, string> = {
  available: "bg-zinc-100 text-zinc-600",
  ready: "bg-yellow/20 text-amber-800",
  playing: "bg-emerald-100 text-emerald-800",
  game_over: "bg-amber-100 text-amber-800",
  unavailable: "bg-zinc-200 text-zinc-500",
};

/** Ticks once a second so elapsed game clocks stay live between polls. */
function useSecondTick(enabled: boolean) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!enabled) return;
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, [enabled]);
  return now;
}

function formatElapsed(startedAt: string, now: number) {
  const started = new Date(startedAt).getTime();
  if (Number.isNaN(started)) return "--:--";
  const totalSeconds = Math.max(0, Math.floor((now - started) / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

function CourtCard({
  court,
  now,
  highlightParticipantId,
  actions,
}: {
  court: OpenPlayLiveCourt;
  now: number;
  highlightParticipantId?: string | null;
  actions?: ReactNode;
}) {
  const sideA = court.game?.players.filter((p) => p.side === "A") ?? [];
  const sideB = court.game?.players.filter((p) => p.side === "B") ?? [];

  return (
    <div className="flex flex-col rounded-xl border border-zinc-200 bg-white p-4">
      <div className="flex items-center justify-between gap-2">
        <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-zinc-900">
          {court.courtLabel}
        </p>
        <span
          className={cn(
            "rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.12em]",
            COURT_STATE_CLASS[court.state],
          )}
        >
          {COURT_STATE_LABEL[court.state]}
        </span>
      </div>

      {court.game ? (
        <>
          <p className="mt-2 text-xs font-medium tabular-nums text-zinc-500">
            Elapsed {formatElapsed(court.game.startedAt, now)}
          </p>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {[
              { label: "Side A", players: sideA },
              { label: "Side B", players: sideB },
            ].map((side) => (
              <div key={side.label}>
                <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-zinc-500">
                  {side.label}
                </p>
                <ul className="mt-1 space-y-1 text-sm text-zinc-800">
                  {side.players.map((player) => (
                    <li
                      key={player.participantId}
                      className={cn(
                        player.participantId === highlightParticipantId &&
                          "font-semibold text-zinc-900",
                      )}
                    >
                      {player.name}
                      {player.participantId === highlightParticipantId
                        ? " (you)"
                        : ""}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </>
      ) : (
        <p className="mt-3 text-sm text-zinc-500">
          {court.state === "unavailable"
            ? "Out of rotation"
            : "Waiting for players"}
        </p>
      )}

      {actions ? (
        <div className="mt-4 flex flex-wrap gap-2 border-t border-zinc-100 pt-3">
          {actions}
        </div>
      ) : null}
    </div>
  );
}

function CourtGroup({
  title,
  courts,
  now,
  highlightParticipantId,
  renderCourtActions,
}: {
  title: string;
  courts: OpenPlayLiveCourt[];
  now: number;
  highlightParticipantId?: string | null;
  renderCourtActions?: (court: OpenPlayLiveCourt) => ReactNode;
}) {
  if (courts.length === 0) return null;
  return (
    <section>
      <h3 className="mb-3 text-[11px] font-bold uppercase tracking-[0.14em] text-zinc-500">
        {title}
      </h3>
      <div className="grid gap-3 lg:grid-cols-3">
        {courts.map((court) => (
          <CourtCard
            key={court.courtId}
            court={court}
            now={now}
            highlightParticipantId={highlightParticipantId}
            actions={renderCourtActions?.(court)}
          />
        ))}
      </div>
    </section>
  );
}

export function OpenPlayLiveBoard({
  board,
  highlightParticipantId,
  renderCourtActions,
}: {
  board: OpenPlayLiveBoardDto;
  highlightParticipantId?: string | null;
  renderCourtActions?: (court: OpenPlayLiveCourt) => ReactNode;
}) {
  const hasGame = board.courts.some((court) => court.game !== null);
  const now = useSecondTick(hasGame);
  const indoor = board.courts.filter((court) =>
    court.courtId.startsWith("in-"),
  );
  const outdoor = board.courts.filter((court) =>
    court.courtId.startsWith("out-"),
  );
  const other = board.courts.filter(
    (court) => !indoor.includes(court) && !outdoor.includes(court),
  );

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-6">
        <CourtGroup
          title="Indoor"
          courts={indoor}
          now={now}
          highlightParticipantId={highlightParticipantId}
          renderCourtActions={renderCourtActions}
        />
        <CourtGroup
          title="Outdoor"
          courts={outdoor}
          now={now}
          highlightParticipantId={highlightParticipantId}
          renderCourtActions={renderCourtActions}
        />
        <CourtGroup
          title="Courts"
          courts={other}
          now={now}
          highlightParticipantId={highlightParticipantId}
          renderCourtActions={renderCourtActions}
        />
      </div>

      <section>
        <h3 className="mb-3 text-[11px] font-bold uppercase tracking-[0.14em] text-zinc-500">
          Up next
        </h3>
        {board.upNext.length === 0 ? (
          <p className="rounded-xl border border-zinc-200 bg-white px-4 py-5 text-sm text-zinc-500">
            Nobody is waiting. Check in players to build the queue.
          </p>
        ) : (
          <ol className="rounded-xl border border-zinc-200 bg-white px-4 py-2 text-sm text-zinc-800">
            {board.upNext.map((entry) => (
              <li
                key={entry.participantId}
                className={cn(
                  "flex items-center gap-3 border-t border-zinc-100 py-2 first:border-t-0",
                  entry.participantId === highlightParticipantId &&
                    "font-semibold text-zinc-900",
                )}
              >
                <span className="w-6 shrink-0 text-[11px] font-bold tabular-nums text-zinc-400">
                  {entry.position}
                </span>
                <span className="min-w-0 truncate">
                  {entry.name}
                  {entry.participantId === highlightParticipantId
                    ? " (you)"
                    : ""}
                </span>
              </li>
            ))}
          </ol>
        )}
      </section>
    </div>
  );
}
