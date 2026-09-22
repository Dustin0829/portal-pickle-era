import { useEffect, useState } from "react";
import { Check, Search, X } from "lucide-react";
import { useAdminUsers } from "@/api/features/bookings/use-bookings";
import type { AuthUserDto } from "@/api/features/auth/auth.schema";
import {
  useAdminWalletProfile,
  useCreateAdminManualCredit,
} from "@/api/features/wallet/use-wallet";
import { createAdminManualCreditFormSchema } from "@/api/features/wallet/wallet.schema";
import { getUserFacingApiErrorMessage } from "@/api/lib/api-error-message";
import { formatCentsAsPesos } from "@/lib/wallet/formatWalletMoney";
import { cn } from "@/lib/utils";

type Step = "search" | "credit";

type PlayerHit = Pick<AuthUserDto, "id" | "name" | "email">;

export function ManualTopUpModal({ onClose }: { onClose: () => void }) {
  const [step, setStep] = useState<Step>("search");
  const [query, setQuery] = useState("");
  const [debounced, setDebounced] = useState("");
  const [selected, setSelected] = useState<PlayerHit | null>(null);
  const [amountPesos, setAmountPesos] = useState("");
  const [fieldError, setFieldError] = useState("");

  useEffect(() => {
    const handle = window.setTimeout(() => setDebounced(query.trim()), 250);
    return () => window.clearTimeout(handle);
  }, [query]);

  const searchEnabled = debounced.length >= 2;
  const { data, isFetching, isError } = useAdminUsers(
    {
      role: "student",
      search: searchEnabled ? debounced : undefined,
      page: 1,
      limit: 20,
    },
    searchEnabled,
  );
  const profile = useAdminWalletProfile(selected?.id ?? null);
  const credit = useCreateAdminManualCredit();

  const players = data?.items ?? [];

  async function onAddCredits() {
    if (!selected) return;
    setFieldError("");
    const parsed = createAdminManualCreditFormSchema.safeParse({
      amountPesos,
    });
    if (!parsed.success) {
      setFieldError(parsed.error.issues[0]?.message ?? "Enter a valid amount");
      return;
    }
    try {
      await credit.mutateAsync({
        userId: selected.id,
        amountCents: Math.round(parsed.data.amountPesos * 100),
      });
      onClose();
    } catch (error) {
      setFieldError(getUserFacingApiErrorMessage(error));
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4">
      <button
        type="button"
        className="absolute inset-0 bg-black/40"
        aria-label="Close manual top-up"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="manual-top-up-title"
        className="relative z-10 flex w-full max-w-lg flex-col overflow-hidden rounded-t-2xl border border-zinc-200/80 bg-white shadow-2xl sm:rounded-2xl"
      >
        <div className="flex items-center justify-between gap-3 border-b border-zinc-200 px-4 py-3 sm:px-5">
          <h2
            id="manual-top-up-title"
            className="text-lg font-semibold text-zinc-900"
          >
            Manual top-up
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="grid size-8 place-items-center rounded-lg border border-maroon/40 text-maroon"
            aria-label="Close"
          >
            <X size={15} />
          </button>
        </div>

        <div className="flex flex-col gap-4 p-4 sm:p-5">
          {step === "search" ? (
            <>
              <label className="flex flex-col gap-1.5">
                <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-zinc-500">
                  Search player
                </span>
                <span className="relative">
                  <Search
                    size={14}
                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"
                    aria-hidden
                  />
                  <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Email or name (min 2 characters)"
                    className="h-11 w-full rounded-xl border border-zinc-200 bg-white pl-9 pr-3 text-sm text-zinc-900 outline-none focus:border-yellow"
                    autoFocus
                  />
                </span>
              </label>

              <div className="max-h-64 overflow-y-auto rounded-xl border border-zinc-200">
                {!searchEnabled ? (
                  <p className="px-4 py-6 text-center text-sm text-zinc-500">
                    Type at least 2 characters to search.
                  </p>
                ) : isFetching ? (
                  <p className="px-4 py-6 text-center text-sm text-zinc-500">
                    Searching…
                  </p>
                ) : isError ? (
                  <p className="px-4 py-6 text-center text-sm text-maroon">
                    Could not search players.
                  </p>
                ) : players.length === 0 ? (
                  <p className="px-4 py-6 text-center text-sm text-zinc-500">
                    No players found.
                  </p>
                ) : (
                  <ul className="divide-y divide-zinc-100">
                    {players.map((player) => (
                      <li key={player.id}>
                        <button
                          type="button"
                          className="flex w-full flex-col gap-0.5 px-4 py-3 text-left transition hover:bg-zinc-50"
                          onClick={() => {
                            setSelected({
                              id: player.id,
                              name: player.name,
                              email: player.email,
                            });
                            setStep("credit");
                          }}
                        >
                          <span className="text-sm font-semibold text-zinc-900">
                            {player.name}
                          </span>
                          <span className="text-xs text-zinc-500">
                            {player.email}
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </>
          ) : selected ? (
            <>
              <button
                type="button"
                className="self-start text-[11px] font-semibold uppercase tracking-[0.12em] text-maroon"
                onClick={() => {
                  setStep("search");
                  setFieldError("");
                }}
              >
                ← Back to search
              </button>

              <div className="rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3">
                <p className="text-sm font-semibold text-zinc-900">
                  {selected.name}
                </p>
                <p className="text-xs text-zinc-500">{selected.email}</p>
                {profile.data ? (
                  <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-zinc-600">
                    <span>
                      Joined{" "}
                      {new Date(
                        profile.data.user.createdAt,
                      ).toLocaleDateString()}
                    </span>
                    <span>
                      Balance {formatCentsAsPesos(profile.data.balanceCents)}
                    </span>
                    <span>
                      {profile.data.bookingsCount} booking
                      {profile.data.bookingsCount === 1 ? "" : "s"}
                    </span>
                  </div>
                ) : profile.isFetching ? (
                  <p className="mt-2 text-[11px] text-zinc-500">
                    Loading profile…
                  </p>
                ) : null}
              </div>

              <label className="flex flex-col gap-1.5">
                <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-zinc-500">
                  Amount (₱)
                </span>
                <input
                  value={amountPesos}
                  onChange={(e) => setAmountPesos(e.target.value)}
                  inputMode="decimal"
                  placeholder="500"
                  className={cn(
                    "h-11 rounded-xl border bg-white px-3 text-sm outline-none focus:border-yellow",
                    fieldError ? "border-maroon" : "border-zinc-200",
                  )}
                />
                {fieldError ? (
                  <span className="text-xs text-maroon">{fieldError}</span>
                ) : null}
              </label>

              <button
                type="button"
                disabled={credit.isPending}
                onClick={() => void onAddCredits()}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-yellow px-4 text-[11px] font-bold uppercase tracking-[0.14em] text-black disabled:opacity-60"
              >
                <Check size={14} aria-hidden />
                {credit.isPending ? "Adding…" : "Add credits"}
              </button>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}
