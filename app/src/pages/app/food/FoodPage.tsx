import { useMemo, useState } from "react";
import { Minus, Plus, UtensilsCrossed } from "lucide-react";
import {
  useCreateMyFoodOrder,
  useMyFoodMenu,
} from "@/api/features/food/use-food";
import type { FoodPayMode } from "@/api/features/food/food.schema";
import { AppPageShell } from "@/components/layout/AppPageShell";
import { PortalBackdrop } from "@/components/portal/PortalBackdrop";
import { PortalListSkeleton } from "@/components/portal/portal-skeletons";
import { formatCentsAsPesos } from "@/lib/wallet/formatWalletMoney";
import { cn } from "@/lib/utils";

export function FoodPage() {
  const { data, isPending, isError, refetch } = useMyFoodMenu();
  const { mutate: placeOrder, isPending: isPlacing } = useCreateMyFoodOrder();
  const [qtyById, setQtyById] = useState<Record<string, number>>({});
  const [notes, setNotes] = useState("");
  const [payMode, setPayMode] = useState<FoodPayMode>("counter");

  const lines = useMemo(
    () =>
      Object.entries(qtyById)
        .filter(([, qty]) => qty > 0)
        .map(([menuItemId, quantity]) => ({ menuItemId, quantity })),
    [qtyById],
  );

  const totalCents = useMemo(() => {
    if (!data) return 0;
    return lines.reduce((sum, line) => {
      const item = data.find((row) => row.id === line.menuItemId);
      return sum + (item?.priceCents ?? 0) * line.quantity;
    }, 0);
  }, [data, lines]);

  function setQty(id: string, next: number) {
    setQtyById((prev) => {
      const qty = Math.max(0, Math.min(50, next));
      if (qty === 0) {
        const rest = { ...prev };
        delete rest[id];
        return rest;
      }
      return { ...prev, [id]: qty };
    });
  }

  function onPlaceOrder() {
    if (lines.length === 0) return;
    placeOrder(
      {
        lines,
        payMode,
        notes: notes.trim() || undefined,
      },
      {
        onSuccess: () => {
          setQtyById({});
          setNotes("");
        },
      },
    );
  }

  return (
    <div className="relative min-h-full overflow-hidden">
      <PortalBackdrop />

      <AppPageShell width="full" className="relative z-10 max-w-3xl">
        <header className="mb-8 flex flex-col gap-2">
          <h1 className="display text-[42px] text-zinc-900 sm:text-[52px]">
            Food
          </h1>
          <p className="text-sm text-zinc-500">
            Order from the café menu. Pay with wallet or at the counter.
          </p>
        </header>

        {isPending ? (
          <PortalListSkeleton rows={4} />
        ) : isError ? (
          <div
            className="rounded-2xl border border-zinc-200/80 bg-white px-5 py-8 text-sm text-zinc-500 shadow-sm"
            role="alert"
          >
            <p>Could not load the menu.</p>
            <button
              type="button"
              onClick={() => void refetch()}
              className="mt-3 text-[11px] font-bold uppercase tracking-[0.14em] text-amber-700 hover:text-zinc-900"
            >
              Try again
            </button>
          </div>
        ) : !data?.length ? (
          <div className="rounded-2xl border border-dashed border-zinc-200 bg-white/80 px-5 py-10 text-center text-sm text-zinc-500">
            No menu items available yet.
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            <ul className="flex flex-col gap-3">
              {data.map((item) => {
                const qty = qtyById[item.id] ?? 0;
                return (
                  <li
                    key={item.id}
                    className="flex gap-3 rounded-2xl border border-zinc-200/80 bg-white p-3 shadow-sm sm:p-4"
                  >
                    <div className="size-20 shrink-0 overflow-hidden rounded-xl bg-zinc-100 sm:size-24">
                      {item.imageUrl ? (
                        <img
                          src={item.imageUrl}
                          alt=""
                          className="size-full object-cover"
                        />
                      ) : (
                        <div className="grid size-full place-items-center text-zinc-300">
                          <UtensilsCrossed size={28} aria-hidden />
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-zinc-900">
                        {item.name}
                      </p>
                      <p className="mt-0.5 text-sm text-amber-700">
                        {formatCentsAsPesos(item.priceCents)}
                      </p>
                      <div className="mt-3 flex items-center gap-2">
                        <button
                          type="button"
                          aria-label={`Decrease ${item.name}`}
                          disabled={qty === 0}
                          onClick={() => setQty(item.id, qty - 1)}
                          className="grid size-9 place-items-center rounded-lg border border-zinc-200 text-zinc-600 disabled:opacity-30"
                        >
                          <Minus size={14} />
                        </button>
                        <span className="min-w-6 text-center text-sm font-semibold tabular-nums text-zinc-900">
                          {qty}
                        </span>
                        <button
                          type="button"
                          aria-label={`Increase ${item.name}`}
                          onClick={() => setQty(item.id, qty + 1)}
                          className="grid size-9 place-items-center rounded-lg border border-zinc-200 text-zinc-600"
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>

            <section className="rounded-2xl border border-zinc-200/80 bg-white p-5 shadow-sm sm:p-6">
              <label className="flex flex-col gap-1 text-xs text-zinc-500">
                Notes (optional)
                <textarea
                  value={notes}
                  onChange={(event) => setNotes(event.target.value)}
                  rows={2}
                  maxLength={500}
                  placeholder="Allergies, pickup timing…"
                  className="rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:border-yellow"
                />
              </label>

              <fieldset className="mt-4">
                <legend className="text-xs text-zinc-500">Pay with</legend>
                <div className="mt-2 flex flex-wrap gap-2">
                  {(
                    [
                      ["counter", "Pay at counter"],
                      ["wallet", "Wallet"],
                    ] as const
                  ).map(([mode, label]) => (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => setPayMode(mode)}
                      className={cn(
                        "h-10 rounded-xl px-4 text-[11px] font-bold uppercase tracking-[0.12em] transition",
                        payMode === mode
                          ? "bg-amber-500 text-white"
                          : "border border-zinc-200 text-zinc-600 hover:border-amber-400",
                      )}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </fieldset>

              <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm font-semibold text-zinc-900">
                  Total {formatCentsAsPesos(totalCents)}
                </p>
                <button
                  type="button"
                  disabled={lines.length === 0 || isPlacing}
                  onClick={onPlaceOrder}
                  className="h-11 w-full rounded-xl bg-amber-500 px-5 text-[11px] font-bold uppercase tracking-[0.14em] text-white transition hover:bg-zinc-900 disabled:cursor-not-allowed disabled:bg-zinc-200 disabled:text-zinc-400 sm:w-auto"
                >
                  {isPlacing ? "Placing…" : "Place order"}
                </button>
              </div>
            </section>
          </div>
        )}
      </AppPageShell>
    </div>
  );
}
