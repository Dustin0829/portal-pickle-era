import { useEffect, useId, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import {
  PORTAL_RANGE_OPTIONS,
  type PortalRangeValue,
} from "@/components/portal/portalRange";
import { cn } from "@/lib/utils";

type PortalRangeSelectProps = {
  value: PortalRangeValue;
  onChange: (value: PortalRangeValue) => void;
  label?: string;
  className?: string;
};

export function PortalRangeSelect({
  value,
  onChange,
  label = "Time range",
  className,
}: PortalRangeSelectProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const listId = useId();
  const selected =
    PORTAL_RANGE_OPTIONS.find((item) => item.value === value) ??
    PORTAL_RANGE_OPTIONS[0]!;

  useEffect(() => {
    if (!open) return;

    function onPointerDown(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    window.addEventListener("mousedown", onPointerDown);
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("mousedown", onPointerDown);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div ref={rootRef} className={cn("relative shrink-0", className)}>
      <button
        type="button"
        aria-label={label}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        onClick={() => setOpen((current) => !current)}
        className="inline-flex h-11 min-w-[9.5rem] items-center justify-between gap-3 rounded-full border border-zinc-200/80 bg-white px-4 text-[11px] font-bold uppercase tracking-[0.14em] text-zinc-800 transition hover:border-zinc-300"
      >
        <span>{selected.label}</span>
        <ChevronDown
          size={15}
          className={cn(
            "shrink-0 text-zinc-500 transition",
            open && "rotate-180 text-zinc-800",
          )}
          aria-hidden
        />
      </button>

      {open ? (
        <ul
          id={listId}
          role="listbox"
          aria-label={label}
          className="absolute right-0 z-30 mt-2 min-w-full overflow-hidden rounded-2xl border border-zinc-200/80 bg-white py-1.5 shadow-lg"
        >
          {PORTAL_RANGE_OPTIONS.map((option) => {
            const active = option.value === value;
            return (
              <li key={option.value} role="option" aria-selected={active}>
                <button
                  type="button"
                  onClick={() => {
                    onChange(option.value);
                    setOpen(false);
                  }}
                  className={cn(
                    "flex w-full items-center px-4 py-2.5 text-left text-[11px] font-bold uppercase tracking-[0.14em] transition",
                    active
                      ? "bg-yellow/70 text-black"
                      : "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900",
                  )}
                >
                  {option.label}
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}
