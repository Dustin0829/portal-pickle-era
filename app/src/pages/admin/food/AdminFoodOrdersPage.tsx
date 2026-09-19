import { useMemo, useState } from "react";
import { Clock3, Search, UtensilsCrossed } from "lucide-react";
import {
  useAdminFoodOrders,
  usePatchAdminFoodOrder,
} from "@/api/features/food/use-food";
import type {
  FoodOrderDto,
  FoodOrderStatus,
} from "@/api/features/food/food.schema";
import { AppPageShell } from "@/components/layout/AppPageShell";
import { PortalListSkeleton } from "@/components/portal/portal-skeletons";
import { formatCentsAsPesos } from "@/lib/wallet/formatWalletMoney";
import { cn } from "@/lib/utils";

const NEXT_STATUS: Partial<Record<FoodOrderStatus, FoodOrderStatus>> = {
  pending: "preparing",
  preparing: "ready",
};

export function AdminFoodOrdersPage() {
  const [filter, setFilter] = useState<"active" | "all">("active");
  const [query, setQuery] = useState("");

  const { data, isPending, isError, refetch } = useAdminFoodOrders({
    page: 1,
    limit: 100,
    order: "desc",
  });
  const { mutateAsync: patchOrder, isPending: isPatching } =
    usePatchAdminFoodOrder();

  const orders = useMemo(() => data?.items ?? [], [data?.items]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return orders.filter((item) => {
      if (filter === "active" && item.status === "ready") return false;
      if (!q) return true;
      return (
        (item.userName ?? "").toLowerCase().includes(q) ||
        (item.userEmail ?? "").toLowerCase().includes(q) ||
        item.id.toLowerCase().includes(q) ||
        item.lines.some((line) => line.name.toLowerCase().includes(q))
      );
    });
  }, [orders, filter, query]);

  async function advance(order: FoodOrderDto) {
    const next = NEXT_STATUS[order.status];
    if (!next) return;
    await patchOrder({ id: order.id, status: next });
    void refetch();
  }

  return (
    <div className="relative min-h-full overflow-hidden">
      <AppPageShell width="full" className="relative z-10 max-w-6xl">
        <header className="mb-6 flex flex-col gap-2">
          <h1 className="display text-[42px] text-zinc-900 sm:text-[52px]">
            Food <span className="text-amber-600">orders</span>
          </h1>
          <p className="text-sm text-zinc-500">
            Advance café orders from pending → preparing → ready.
          </p>
        </header>

        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex gap-2">
            {(
              [
                ["active", "Active"],
                ["all", "All"],
              ] as const
            ).map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => setFilter(value)}
                className={cn(
                  "h-9 rounded-xl px-3 text-[11px] font-bold uppercase tracking-[0.12em]",
                  filter === value
                    ? "bg-amber-500 text-white"
                    : "border border-zinc-200 text-zinc-600",
                )}
              >
                {label}
              </button>
            ))}
          </div>
          <label className="relative block w-full sm:max-w-xs">
            <Search
              size={14}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"
              aria-hidden
            />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search orders"
              className="h-9 w-full rounded-xl border border-zinc-200 bg-white pl-9 pr-3 text-sm text-zinc-900 outline-none focus:border-yellow"
            />
          </label>
        </div>

        {isPending && !data ? (
          <PortalListSkeleton rows={5} />
        ) : isError && !data ? (
          <div
            className="rounded-2xl border border-zinc-200/80 bg-white px-5 py-8 text-sm text-zinc-500 shadow-sm"
            role="alert"
          >
            <p>Could not load food orders.</p>
            <button
              type="button"
              onClick={() => void refetch()}
              className="mt-3 text-[11px] font-bold uppercase tracking-[0.14em] text-amber-700"
            >
              Try again
            </button>
          </div>
        ) : visible.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-zinc-200 bg-white/80 px-5 py-10 text-center text-sm text-zinc-500">
            No orders match this filter.
          </div>
        ) : (
          <ul className="flex flex-col gap-3">
            {visible.map((order) => {
              const next = NEXT_STATUS[order.status];
              return (
                <li
                  key={order.id}
                  className="rounded-2xl border border-zinc-200/80 bg-white p-4 shadow-sm sm:p-5"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <StatusBadge status={order.status} />
                        <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-zinc-400">
                          {order.payMode === "wallet" ? "Wallet" : "Counter"}
                        </span>
                      </div>
                      <p className="mt-2 text-sm font-semibold text-zinc-900">
                        {order.userName ?? "Player"}
                        {order.userEmail ? (
                          <span className="font-normal text-zinc-500">
                            {" "}
                            · {order.userEmail}
                          </span>
                        ) : null}
                      </p>
                      <ul className="mt-2 space-y-0.5 text-sm text-zinc-600">
                        {order.lines.map((line) => (
                          <li key={line.id}>
                            {line.quantity}× {line.name}
                          </li>
                        ))}
                      </ul>
                      {order.notes ? (
                        <p className="mt-2 text-xs text-zinc-500">
                          Note: {order.notes}
                        </p>
                      ) : null}
                      <p className="mt-2 text-xs text-zinc-400">
                        {new Date(order.createdAt).toLocaleString()} ·{" "}
                        {formatCentsAsPesos(order.totalCents)}
                      </p>
                    </div>
                    {next ? (
                      <button
                        type="button"
                        disabled={isPatching}
                        onClick={() => void advance(order)}
                        className="h-10 shrink-0 rounded-xl bg-amber-500 px-4 text-[11px] font-bold uppercase tracking-[0.12em] text-white hover:bg-zinc-900 disabled:opacity-60"
                      >
                        Mark {next}
                      </button>
                    ) : null}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </AppPageShell>
    </div>
  );
}

function StatusBadge({ status }: { status: FoodOrderStatus }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em]",
        status === "pending" && "bg-amber-100 text-amber-800",
        status === "preparing" && "bg-sky-100 text-sky-800",
        status === "ready" && "bg-emerald-100 text-emerald-800",
      )}
    >
      {status === "pending" ? <Clock3 size={12} aria-hidden /> : null}
      {status === "ready" ? <UtensilsCrossed size={12} aria-hidden /> : null}
      {status}
    </span>
  );
}
