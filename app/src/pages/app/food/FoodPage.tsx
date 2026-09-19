import { useMemo, useState } from "react";
import { Minus, Plus, UtensilsCrossed } from "lucide-react";
import {
  useCreateMyFoodOrder,
  useMyFoodMenu,
} from "@/api/features/food/use-food";
import type { FoodPayMode } from "@/api/features/food/food.schema";
import { AppPageShell } from "@/components/layout/AppPageShell";
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

  const lineItems = useMemo(() => {
    if (!data) return [];
    return lines
      .map((line) => {
        const item = data.find((row) => row.id === line.menuItemId);
        if (!item) return null;
        return {
          ...line,
          name: item.name,
          priceCents: item.priceCents,
          imageUrl: item.imageUrl,
          lineTotal: item.priceCents * line.quantity,
        };
      })
      .filter(Boolean) as Array<{
      menuItemId: string;
      quantity: number;
      name: string;
      priceCents: number;
      imageUrl: string | null;
      lineTotal: number;
    }>;
  }, [data, lines]);

  const totalCents = useMemo(
    () => lineItems.reduce((sum, line) => sum + line.lineTotal, 0),
    [lineItems],
  );

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
    <div className="min-h-full">
      <AppPageShell width="full" className="max-w-6xl">
        <header className="mb-5 flex flex-col gap-2">
          <h1 className="display text-[36px] text-zinc-900 sm:text-[44px]">
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
            className="border border-zinc-200 bg-white px-5 py-8 text-sm text-zinc-500"
            role="alert"
          >
            <p>Could not load the menu.</p>
            <button
              type="button"
              onClick={() => void refetch()}
              className="mt-3 text-[11px] font-bold uppercase tracking-[0.14em] text-yellow hover:text-zinc-900"
            >
              Try again
            </button>
          </div>
        ) : !data?.length ? (
          <div className="border border-dashed border-zinc-200 bg-white px-5 py-10 text-center text-sm text-zinc-500">
            No menu items available yet.
          </div>
        ) : (
          <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_20rem]">
            <div className="min-w-0">
              <div className="mb-3 border-b border-zinc-200">
                <button
                  type="button"
                  className="border-b-2 border-yellow px-3 py-2 text-[11px] font-bold uppercase tracking-[0.12em] text-zinc-900"
                >
                  All menu
                </button>
              </div>
              <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {data.map((item) => {
                  const qty = qtyById[item.id] ?? 0;
                  return (
                    <li
                      key={item.id}
                      className="flex flex-col overflow-hidden border border-zinc-200 bg-white"
                    >
                      <div className="aspect-[4/3] bg-zinc-100">
                        {item.imageUrl ? (
                          <img
                            src={item.imageUrl}
                            alt=""
                            className="size-full object-cover"
                          />
                        ) : (
                          <div className="grid size-full place-items-center text-zinc-300">
                            <UtensilsCrossed size={36} aria-hidden />
                          </div>
                        )}
                      </div>
                      <div className="flex flex-1 flex-col gap-2 p-3">
                        <p className="text-sm font-bold text-zinc-900">
                          {item.name}
                        </p>
                        <p className="text-sm font-semibold text-zinc-700">
                          {formatCentsAsPesos(item.priceCents)}
                        </p>
                        <div className="mt-auto pt-1">
                          {qty === 0 ? (
                            <button
                              type="button"
                              onClick={() => setQty(item.id, 1)}
                              className="h-9 w-full bg-yellow text-[11px] font-bold uppercase tracking-[0.12em] text-black transition hover:bg-zinc-900 hover:text-yellow"
                            >
                              + Add
                            </button>
                          ) : (
                            <div className="flex h-9 items-center justify-between border border-zinc-200 bg-zinc-50 px-2">
                              <button
                                type="button"
                                aria-label={`Decrease ${item.name}`}
                                onClick={() => setQty(item.id, qty - 1)}
                                className="grid size-7 place-items-center text-zinc-700"
                              >
                                <Minus size={14} />
                              </button>
                              <span className="text-sm font-bold tabular-nums text-zinc-900">
                                {qty}
                              </span>
                              <button
                                type="button"
                                aria-label={`Increase ${item.name}`}
                                onClick={() => setQty(item.id, qty + 1)}
                                className="grid size-7 place-items-center text-zinc-700"
                              >
                                <Plus size={14} />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>

            <aside className="border border-zinc-200 bg-white lg:sticky lg:top-4 lg:self-start">
              <div className="border-b border-zinc-200 px-4 py-3">
                <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-yellow">
                  Your order
                </p>
                <p className="mt-0.5 text-xs text-zinc-500">
                  {lineItems.length === 0
                    ? "No items yet"
                    : `${lineItems.length} item${lineItems.length === 1 ? "" : "s"}`}
                </p>
              </div>

              <ul className="max-h-64 space-y-3 overflow-y-auto px-4 py-3">
                {lineItems.map((line) => (
                  <li key={line.menuItemId} className="flex gap-2">
                    <div className="size-10 shrink-0 overflow-hidden bg-zinc-100">
                      {line.imageUrl ? (
                        <img
                          src={line.imageUrl}
                          alt=""
                          className="size-full object-cover"
                        />
                      ) : (
                        <div className="grid size-full place-items-center text-zinc-300">
                          <UtensilsCrossed size={16} aria-hidden />
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-zinc-900">
                        {line.quantity}× {line.name}
                      </p>
                      <p className="text-xs text-zinc-500">
                        {formatCentsAsPesos(line.lineTotal)}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>

              <div className="space-y-3 border-t border-zinc-200 px-4 py-3">
                <label className="flex flex-col gap-1 text-xs text-zinc-500">
                  Notes (optional)
                  <textarea
                    value={notes}
                    onChange={(event) => setNotes(event.target.value)}
                    rows={2}
                    maxLength={500}
                    placeholder="Allergies, pickup timing…"
                    className="border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:border-yellow"
                  />
                </label>

                <fieldset>
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
                          "h-9 px-3 text-[10px] font-bold uppercase tracking-[0.12em] transition",
                          payMode === mode
                            ? "bg-yellow text-black"
                            : "border border-zinc-200 text-zinc-600 hover:border-yellow",
                        )}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </fieldset>

                <div className="flex items-center justify-between text-sm font-bold text-zinc-900">
                  <span>Total</span>
                  <span>{formatCentsAsPesos(totalCents)}</span>
                </div>

                <button
                  type="button"
                  disabled={lines.length === 0 || isPlacing}
                  onClick={onPlaceOrder}
                  className="h-11 w-full bg-zinc-900 text-[11px] font-bold uppercase tracking-[0.14em] text-yellow transition hover:bg-yellow hover:text-black disabled:cursor-not-allowed disabled:bg-zinc-200 disabled:text-zinc-400"
                >
                  {isPlacing ? "Placing…" : "Place order"}
                </button>
              </div>
            </aside>
          </div>
        )}
      </AppPageShell>
    </div>
  );
}
