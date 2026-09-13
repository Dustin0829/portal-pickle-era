import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useJoinClubModal } from "@/providers/JoinClubModalProvider";
import { useAuth } from "@/providers/AuthProvider";

/** Branded gate while the player portal is not ready to ship. */
export function PlayerComingSoon() {
  const { openJoinClubModal } = useJoinClubModal();
  const { logout } = useAuth();

  return (
    <div className="relative flex min-h-[70vh] flex-col items-start justify-center px-1 py-10 sm:px-2">
      <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-zinc-400">
        Player portal
      </p>
      <h1 className="display mt-3 text-[42px] text-zinc-900 sm:text-[56px]">
        Coming soon.
      </h1>
      <p className="mt-4 max-w-md text-sm leading-relaxed text-zinc-500">
        You&apos;re signed in. Court booking and the full player portal are
        still being finished — join the club so we can reach you when it opens.
      </p>

      <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
        <button
          type="button"
          onClick={() => openJoinClubModal()}
          className="inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-yellow px-6 text-[12px] font-bold uppercase tracking-[0.16em] text-black transition hover:bg-yellow/90"
        >
          Join the club
          <ArrowRight size={16} />
        </button>
        <Link
          to="/"
          className="inline-flex h-12 items-center justify-center border border-zinc-300 px-6 text-[12px] font-bold uppercase tracking-[0.16em] text-zinc-800 transition hover:border-yellow"
        >
          Back to home
        </Link>
        <button
          type="button"
          onClick={() => void logout()}
          className="inline-flex h-12 items-center justify-center px-2 text-[12px] font-bold uppercase tracking-[0.16em] text-zinc-500 transition hover:text-zinc-900"
        >
          Log out
        </button>
      </div>
    </div>
  );
}
