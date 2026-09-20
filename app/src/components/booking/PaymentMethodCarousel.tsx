import { Check, Copy } from "lucide-react";
import { useMemo, useState } from "react";
import type { FacilityPaymentMethod } from "@/lib/booking/paymentMethods";
import { cn } from "@/lib/utils";

type PaymentMethodPickerProps = {
  methods: FacilityPaymentMethod[];
  /** Optional amount line, e.g. remaining cash due. */
  amountHint?: string | null;
  /** Visual variant for dark booking modal vs light wallet card. */
  variant?: "dark" | "light";
  className?: string;
};

export function PaymentMethodPicker({
  methods,
  amountHint,
  variant = "light",
  className,
}: PaymentMethodPickerProps) {
  const list = methods;
  const [selectedId, setSelectedId] = useState<string | null>(() =>
    list.length === 1 ? (list[0]?.id ?? null) : null,
  );
  const [copied, setCopied] = useState(false);
  const active = list.find((method) => method.id === selectedId) ?? null;
  const dark = variant === "dark";
  const canChange = list.length > 1;

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

  if (list.length === 0) {
    return (
      <p className={cn("text-sm", dark ? "text-white/60" : "text-zinc-500")}>
        No payment methods configured.
      </p>
    );
  }

  if (!active) {
    return (
      <div className={cn("space-y-3", className)}>
        <p
          className={cn(
            "text-[11px] font-bold uppercase tracking-[0.14em]",
            dark ? "text-white/70" : "text-zinc-500",
          )}
        >
          Select a payment method
        </p>
        <div className="flex flex-wrap gap-2">
          {list.map((method) => (
            <button
              key={method.id}
              type="button"
              onClick={() => {
                setCopied(false);
                setSelectedId(method.id);
              }}
              className={cn(
                "h-10 px-3 text-[11px] font-bold uppercase tracking-[0.12em] transition",
                dark
                  ? "border border-white/20 text-white hover:border-yellow hover:text-yellow"
                  : "border border-zinc-200 text-zinc-800 hover:border-yellow",
              )}
            >
              {method.label}
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={cn("relative space-y-3", className)}>
      {canChange ? (
        <button
          type="button"
          onClick={() => {
            setCopied(false);
            setSelectedId(null);
          }}
          className={cn(
            "text-[10px] font-bold uppercase tracking-[0.14em] transition",
            dark
              ? "text-white/60 hover:text-yellow"
              : "text-zinc-500 hover:text-zinc-900",
          )}
        >
          Change method
        </button>
      ) : null}

      <div className="grid items-start gap-4 sm:grid-cols-[168px_minmax(0,1fr)] sm:gap-8">
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
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-yellow">
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

/** @deprecated Use PaymentMethodPicker — select then details. */
export const PaymentMethodCarousel = PaymentMethodPicker;

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
