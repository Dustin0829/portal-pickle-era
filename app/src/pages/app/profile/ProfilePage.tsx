import { useState } from "react";
import { Info, LogOut, Pencil, UserRound } from "lucide-react";
import { Link } from "react-router-dom";
import { AppPageShell } from "@/components/layout/AppPageShell";
import { PortalBackdrop } from "@/components/portal/PortalBackdrop";
import { ADMIN_FIXTURE } from "@/lib/auth/auth";
import { useAuth } from "@/providers/AuthProvider";

function roleLabel(role: string | undefined) {
  if (role === "admin") return "Admin";
  return "Player";
}

export function ProfilePage() {
  const { user, logout } = useAuth();
  const [editNote, setEditNote] = useState(false);
  const label = roleLabel(user?.role);

  return (
    <div className="relative min-h-full overflow-hidden">
      <PortalBackdrop />

      <AppPageShell width="full" className="relative z-10 max-w-3xl">
        <header className="mb-8 flex flex-col gap-2">
          <h1 className="display text-[42px] text-zinc-900 sm:text-[52px]">
            Profile
          </h1>
          <p className="text-sm text-zinc-500">
            Account details from the local auth stub.
          </p>
        </header>

        <section className="relative rounded-2xl border border-zinc-200/80 bg-white p-5 shadow-sm sm:p-6">
          <button
            type="button"
            onClick={() => setEditNote(true)}
            className="absolute right-4 top-4 inline-flex h-9 items-center gap-2 rounded-xl border border-zinc-200 px-3 text-[10px] font-bold uppercase tracking-[0.14em] text-zinc-600 transition hover:border-yellow hover:text-yellow sm:right-5 sm:top-5"
          >
            <Pencil size={13} aria-hidden />
            Edit profile
          </button>

          <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:gap-8">
            <div className="flex flex-col items-center gap-3 sm:w-36">
              <div className="grid size-24 place-items-center rounded-full border border-yellow/40 bg-yellow/10 text-yellow">
                <UserRound size={40} aria-hidden />
              </div>
              <span className="rounded-md bg-green px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-yellow">
                {label}
              </span>
            </div>

            <dl className="min-w-0 flex-1 space-y-4 pt-1 sm:pr-28">
              <div>
                <dt className="text-[10px] font-semibold uppercase tracking-[0.16em] text-zinc-400">
                  Name
                </dt>
                <dd className="mt-1 text-sm font-medium text-zinc-900">
                  {user?.name}
                </dd>
              </div>
              <div>
                <dt className="text-[10px] font-semibold uppercase tracking-[0.16em] text-zinc-400">
                  Email
                </dt>
                <dd className="mt-1 break-all text-sm font-medium text-zinc-900">
                  {user?.email}
                </dd>
              </div>
              <div>
                <dt className="text-[10px] font-semibold uppercase tracking-[0.16em] text-zinc-400">
                  Role
                </dt>
                <dd className="mt-1 text-sm font-medium text-zinc-900">
                  {label}
                </dd>
              </div>
            </dl>
          </div>

          {editNote ? (
            <p className="mt-4 text-xs text-zinc-500" role="status">
              Profile editing isn’t available in the local stub yet.
            </p>
          ) : null}
        </section>

        <div className="mt-4 flex gap-3 rounded-2xl border border-yellow/40 bg-yellow/5 px-4 py-3">
          <Info size={16} className="mt-0.5 shrink-0 text-yellow" aria-hidden />
          <p className="text-xs leading-relaxed text-zinc-600">
            Demo facility admin (local only): {ADMIN_FIXTURE.email} /{" "}
            {ADMIN_FIXTURE.password}. Gates are UX stubs, not real security.
          </p>
        </div>

        {user?.role === "admin" ? (
          <Link
            to="/admin"
            className="mt-4 inline-flex text-[11px] font-bold uppercase tracking-[0.16em] text-yellow hover:text-zinc-900"
          >
            Open facility admin
          </Link>
        ) : null}

        <button
          type="button"
          onClick={logout}
          className="mx-auto mt-8 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.16em] text-zinc-500 transition hover:text-yellow"
        >
          <LogOut size={14} aria-hidden />
          Log out
        </button>
      </AppPageShell>
    </div>
  );
}
