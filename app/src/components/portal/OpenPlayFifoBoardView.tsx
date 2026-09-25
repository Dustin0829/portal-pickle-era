import type {
  OpenPlayFifoBoard,
  OpenPlayFifoFoursome,
} from "@/api/features/bookings/bookings.schema";

function FoursomeCard({
  foursome,
  title,
  highlightBookingId,
}: {
  foursome: OpenPlayFifoFoursome;
  title: string;
  highlightBookingId?: string;
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
              <li
                key={p.bookingId}
                className={
                  p.bookingId === highlightBookingId
                    ? "font-semibold text-zinc-900"
                    : undefined
                }
              >
                #{p.queueIndex} {p.name}
                {p.bookingId === highlightBookingId ? " (you)" : ""}
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
              <li
                key={p.bookingId}
                className={
                  p.bookingId === highlightBookingId
                    ? "font-semibold text-zinc-900"
                    : undefined
                }
              >
                #{p.queueIndex} {p.name}
                {p.bookingId === highlightBookingId ? " (you)" : ""}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

export function OpenPlayFifoBoardView({
  board,
  highlightBookingId,
}: {
  board: OpenPlayFifoBoard;
  highlightBookingId?: string;
}) {
  if (board.players.length === 0) {
    return (
      <div className="rounded-2xl border border-zinc-200/80 bg-white px-5 py-8 text-sm text-zinc-500">
        No approved Open Play seats for this session yet.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <section>
        <h2 className="mb-3 text-sm font-semibold text-zinc-900">
          On courts ({board.courts.length})
        </h2>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {board.courts.map((foursome) => (
            <FoursomeCard
              key={foursome.courtId ?? foursome.sideA[0]?.bookingId}
              foursome={foursome}
              title={foursome.courtLabel ?? "Court"}
              highlightBookingId={highlightBookingId}
            />
          ))}
        </div>
      </section>

      {board.nextUp.length > 0 ? (
        <section>
          <h2 className="mb-3 text-sm font-semibold text-zinc-900">Next up</h2>
          <div className="grid gap-3 md:grid-cols-2">
            {board.nextUp.map((foursome, index) => (
              <FoursomeCard
                key={`next-${foursome.sideA[0]?.bookingId}`}
                foursome={foursome}
                title={`Wave ${index + 1}`}
                highlightBookingId={highlightBookingId}
              />
            ))}
          </div>
        </section>
      ) : null}

      {board.remainder.length > 0 ? (
        <section>
          <h2 className="mb-3 text-sm font-semibold text-zinc-900">
            Waiting for a full foursome
          </h2>
          <ul className="rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-800">
            {board.remainder.map((p) => (
              <li
                key={p.bookingId}
                className={
                  p.bookingId === highlightBookingId
                    ? "border-t border-zinc-100 py-2 font-semibold text-zinc-900 first:border-t-0 first:pt-0"
                    : "border-t border-zinc-100 py-2 first:border-t-0 first:pt-0"
                }
              >
                #{p.queueIndex} {p.name}
                {p.bookingId === highlightBookingId ? " (you)" : ""}
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
