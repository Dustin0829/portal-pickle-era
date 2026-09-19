import { Check, ChevronLeft, ChevronRight, Copy } from "lucide-react";
import { useMemo, useState } from "react";
import type { FacilityPaymentMethod } from "@/lib/booking/paymentMethods";
import { cn } from "@/lib/utils";

type PaymentMethodCarouselProps = {
  methods: FacilityPaymentMethod[];
  /** Optional amount line, e.g. remaining cash due. */
  amountHint?: string | null;
  /** Visual variant for dark booking modal vs light wallet card. */
  variant?: "dark" | "light";
  className?: string;
};

export function PaymentMethodCarousel({
  methods,
  amountHint,
  variant = "light",
  className,
}: PaymentMethodCarouselProps) {
  const list = methods.length > 0 ? methods : [];
  const [index, setIndex] = useState(0);
  const [copied, setCopied] = useState(false);
  const safeIndex =
    list.length === 0 ? 0 : ((index % list.length) + list.length) % list.length;
  const active = list[safeIndex] ?? null;
  const canCycle = list.length > 1;
  const dark = variant === "dark";

  async function copyNumber() {
    if (!active) return;
    try {
      await navigator.clipboard.writeText(active.number.replaceAll(" ", ""));
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  }

  function go(delta: number) {
    if (!canCycle) return;
    setIndex((current) => current + delta);
  }

  if (!active) {
    return (
      <p className={cn("text-sm", dark ? "text-white/60" : "text-zinc-500")}>
        No payment methods configured.
      </p>
    );
  }

  return (
    <div className={cn("relative", className)}>
      {canCycle ? (
        <div className="mb-3 flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={() => go(-1)}
            className={cn(
              "inline-flex h-9 items-center gap-1 px-3 text-[10px] font-bold uppercase tracking-[0.12em] transition",
              dark
                ? "border border-white/20 text-white hover:border-yellow hover:text-yellow"
                : "border border-zinc-200 text-zinc-700 hover:border-yellow",
            )}
            aria-label="Previous payment method"
          >
            <ChevronLeft size={14} aria-hidden />
            Previous
          </button>
          <p
            className={cn(
              "text-[10px] font-semibold uppercase tracking-[0.14em]",
              dark ? "text-white/45" : "text-zinc-400",
            )}
          >
            {safeIndex + 1} / {list.length}
          </p>
          <button
            type="button"
            onClick={() => go(1)}
            className={cn(
              "inline-flex h-9 items-center gap-1 px-3 text-[10px] font-bold uppercase tracking-[0.12em] transition",
              dark
                ? "border border-white/20 text-white hover:border-yellow hover:text-yellow"
                : "border border-zinc-200 text-zinc-700 hover:border-yellow",
            )}
            aria-label="Next payment method"
          >
            Next
            <ChevronRight size={14} aria-hidden />
          </button>
        </div>
      ) : null}

      <div
        className={cn(
          "grid items-start gap-4 sm:grid-cols-[168px_minmax(0,1fr)] sm:gap-8",
        )}
      >
        <div
          className={cn(
            "mx-auto w-full max-w-[168px] p-3 sm:mx-0",
            dark
              ? "border border-white/10 bg-white"
              : "border border-zinc-200 bg-white",
          )}
        >
          {active.qrImageDataUrl ? (
            <img
              src={active.qrImageDataUrl}
              alt={`${active.label} QR code`}
              className="aspect-square w-full object-contain"
            />
          ) : (
            <GeneratedPaymentQr value={active.number} />
          )}
          <p
            className={cn(
              "mt-2 text-center text-[10px] font-bold uppercase tracking-[0.16em]",
              dark ? "text-black/70" : "text-zinc-500",
            )}
          >
            Scan to pay
          </p>
        </div>

        <div className="min-w-0 text-center sm:text-left">
          <p
            className={cn(
              "text-[11px] font-bold uppercase tracking-[0.16em] text-yellow",
            )}
          >
            {active.label}
          </p>
          <p
            className={cn(
              "mt-2 text-lg font-semibold",
              dark ? "text-white" : "text-zinc-900",
            )}
          >
            {active.name}
          </p>
          <div className="mt-3 flex items-center justify-center gap-2 sm:justify-start">
            <p
              className={cn(
                "text-lg font-bold tracking-wide sm:text-[22px]",
                dark ? "text-white" : "text-zinc-900",
              )}
            >
              {active.number}
            </p>
            <button
              type="button"
              onClick={() => void copyNumber()}
              className={cn(
                "grid h-9 w-9 shrink-0 place-items-center transition",
                dark
                  ? "border border-white/20 text-white hover:border-yellow hover:text-yellow"
                  : "border border-zinc-200 text-zinc-600 hover:border-yellow",
              )}
              aria-label={`Copy ${active.label} number`}
            >
              {copied ? <Check size={14} /> : <Copy size={14} />}
            </button>
          </div>
          {amountHint ? (
            <p className="mt-2 text-sm font-semibold text-yellow">
              {amountHint}
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function GeneratedPaymentQr({ value }: { value: string }) {
  const cells = useMemo(() => {
    const size = 21;
    const grid = Array.from({ length: size }, () =>
      Array.from({ length: size }, () => false),
    );

    function stamp(x: number, y: number) {
      for (let row = 0; row < 7; row += 1) {
        for (let col = 0; col < 7; col += 1) {
          const edge = row === 0 || row === 6 || col === 0 || col === 6;
          const inner = row >= 2 && row <= 4 && col >= 2 && col <= 4;
          grid[y + row]![x + col] = edge || inner;
        }
      }
    }

    stamp(0, 0);
    stamp(size - 7, 0);
    stamp(0, size - 7);

    let seed = 0;
    for (let index = 0; index < value.length; index += 1)
      seed = (seed * 33 + value.charCodeAt(index)) >>> 0;
    for (let row = 0; row < size; row += 1) {
      for (let col = 0; col < size; col += 1) {
        if (grid[row]![col]) continue;
        seed = (seed * 1103515245 + 12345) >>> 0;
        grid[row]![col] = seed % 3 !== 0;
      }
    }

    return grid;
  }, [value]);

  return (
    <svg viewBox="0 0 21 21" className="aspect-square w-full" aria-hidden>
      {cells.map((row, y) =>
        row.map((on, x) =>
          on ? (
            <rect
              key={`${x}-${y}`}
              x={x}
              y={y}
              width={1}
              height={1}
              fill="#111"
            />
          ) : null,
        ),
      )}
    </svg>
  );
}
