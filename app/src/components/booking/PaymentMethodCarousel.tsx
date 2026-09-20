import { Check, Copy } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { paymentMethodLogoSrc } from "@/lib/booking/paymentMethodLogo";
import type { FacilityPaymentMethod } from "@/lib/booking/paymentMethods";
import { cn } from "@/lib/utils";

type PaymentMethodPickerProps = {
  methods: FacilityPaymentMethod[];
  /** Optional amount line, e.g. remaining cash due. */
  amountHint?: string | null;
  /** Visual variant for dark booking modal vs light wallet card. */
  variant?: "dark" | "light";
  className?: string;
  /** Fires when selection changes (null = chooser). */
  onActiveChange?: (method: FacilityPaymentMethod | null) => void;
};

export function PaymentMethodPicker({
  methods,
  amountHint,
  variant = "light",
  className,
  onActiveChange,
}: PaymentMethodPickerProps) {
  const list = methods;
  const [selectedId, setSelectedId] = useState<string | null>(() =>
    list.length === 1 ? (list[0]?.id ?? null) : null,
  );
  const [copied, setCopied] = useState(false);
  const active = list.find((method) => method.id === selectedId) ?? null;
  const dark = variant === "dark";
  const canChange = list.length > 1;

  function selectMethod(id: string | null) {
    setCopied(false);
    setSelectedId(id);
    const next = id ? (list.find((method) => method.id === id) ?? null) : null;
    onActiveChange?.(next);
  }

  useEffect(() => {
    onActiveChange?.(
      list.length === 1
        ? (list[0] ?? null)
        : (list.find((method) => method.id === selectedId) ?? null),
    );
    // Parent sync on mount only (incl. single-method auto-select).
    // eslint-disable-next-line react-hooks/exhaustive-deps -- mount notify
  }, []);

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
      <div
        className={cn(
          "flex min-h-[14rem] flex-col items-center justify-center gap-4",
          className,
        )}
      >
        <p
          className={cn(
            "text-center text-[11px] font-bold uppercase tracking-[0.14em]",
            dark ? "text-white/70" : "text-zinc-500",
          )}
        >
          Select a payment method
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          {list.map((method) => {
            const logo = paymentMethodLogoSrc(method.label);
            return (
              <button
                key={method.id}
                type="button"
                onClick={() => selectMethod(method.id)}
                className={cn(
                  "flex h-16 w-[7.5rem] flex-col items-center justify-center gap-1 rounded-xl border bg-white px-3 transition hover:border-yellow",
                  dark
                    ? "border-white/15 hover:shadow-[0_0_0_1px_rgba(245,237,90,0.5)]"
                    : "border-zinc-200",
                )}
                aria-label={method.label}
              >
                {logo ? (
                  <img
                    src={logo}
                    alt=""
                    className="max-h-8 max-w-[5.5rem] object-contain"
                  />
                ) : (
                  <span className="text-center text-[11px] font-bold uppercase tracking-[0.12em] text-zinc-800">
                    {method.label}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className={cn("relative space-y-3", className)}>
      {canChange ? (
        <div className="flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => selectMethod(null)}
            className={cn(
              "inline-flex h-9 items-center border px-3 text-[10px] font-bold uppercase tracking-[0.14em] transition",
              dark
                ? "border-white/20 text-white/80 hover:border-yellow hover:text-yellow"
                : "border-zinc-200 text-zinc-600 hover:border-yellow hover:text-zinc-900",
            )}
          >
            Change method
          </button>
          <p
            className={cn(
              "text-[11px] font-bold uppercase tracking-[0.14em] text-yellow",
            )}
          >
            {active.label}
          </p>
        </div>
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
          {active.qrImageUrl ? (
            <img
              src={active.qrImageUrl}
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
