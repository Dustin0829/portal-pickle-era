import { useLenis } from "lenis/react";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Copy,
  Upload,
  X,
} from "lucide-react";
import {
  type ChangeEvent,
  type FormEvent,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  COURTS,
  PAYMENT,
  PLAN_META,
  SLOTS,
  allowsMultiSlot,
  bookingTotal,
  courtHasOpening,
  courtLabel,
  dateKey,
  formatLongDate,
  isSlotOpen,
  parseDateKey,
  saveBooking,
  selectedSlotLabels,
  type BookingPlan,
} from "@/lib/booking/booking";
import { useAuth } from "@/providers/AuthProvider";

type Step = "schedule" | "pay" | "done";

type BookingModalPreset = {
  date: string;
  courtId: string;
  slotIds: string[];
  step?: "schedule" | "pay";
};

type BookingModalProps = {
  plan: BookingPlan | null;
  preset?: BookingModalPreset;
  onClose: () => void;
};

const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

export function BookingModal({ plan, preset, onClose }: BookingModalProps) {
  const open = plan !== null;
  const lenis = useLenis();
  const { user } = useAuth();
  const [step, setStep] = useState<Step>(preset?.step ?? "schedule");
  const [month, setMonth] = useState(() =>
    startOfMonth(
      preset?.date ? parseDateKey(preset.date) : new Date(),
    ),
  );
  const [date, setDate] = useState(
    () => preset?.date ?? dateKey(new Date()),
  );
  const [courtId, setCourtId] = useState(() => preset?.courtId ?? "");
  const [slotIds, setSlotIds] = useState<string[]>(
    () => preset?.slotIds ?? [],
  );
  const [name, setName] = useState(() => user?.name ?? "");
  const [email, setEmail] = useState(() => user?.email ?? "");
  const [referenceId, setReferenceId] = useState("");
  const [receiptName, setReceiptName] = useState("");
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!user) return;
    setName((current) => current || user.name);
    setEmail((current) => current || user.email);
  }, [user]);

  useEffect(() => {
    if (!open) {
      lenis?.start();
      return;
    }

    lenis?.stop();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }

    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
      lenis?.start();
    };
  }, [open, onClose, lenis]);

  const days = useMemo(() => monthCells(month), [month]);
  const todayKey = dateKey(new Date());
  const meta = plan ? PLAN_META[plan] : null;
  const slots = plan ? SLOTS[plan] : [];
  const multiSlot = plan ? allowsMultiSlot(plan) : false;
  const total = plan ? bookingTotal(plan, slotIds.length) : 0;
  const selectedLabels = plan ? selectedSlotLabels(plan, slotIds) : [];
  const indoor = COURTS.filter((court) => court.group === "Indoor");
  const outdoor = COURTS.filter((court) => court.group === "Outdoor");

  function selectDate(next: string) {
    setDate(next);
    setCourtId("");
    setSlotIds([]);
  }

  function selectCourt(next: string) {
    setCourtId(next);
    setSlotIds([]);
  }

  function toggleSlot(id: string) {
    setSlotIds((current) => {
      if (!multiSlot) return current[0] === id ? [] : [id];
      if (current.includes(id)) return current.filter((slot) => slot !== id);
      return [...current, id];
    });
  }

  function onReceipt(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null;
    setReceiptFile(file);
    setReceiptName(file?.name ?? "");
  }

  async function copyNumber() {
    try {
      await navigator.clipboard.writeText(PAYMENT.number.replaceAll(" ", ""));
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  }

  function onBook() {
    if (!courtId || slotIds.length === 0) return;
    setStep("pay");
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (
      !plan ||
      !courtId ||
      slotIds.length === 0 ||
      !name.trim() ||
      !email.trim() ||
      !referenceId.trim() ||
      !receiptName ||
      !receiptFile
    ) {
      return;
    }

    let receiptDataUrl: string | undefined;
    if (receiptFile.size <= 1_500_000) {
      receiptDataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () =>
          resolve(typeof reader.result === "string" ? reader.result : "");
        reader.onerror = () => reject(reader.error);
        reader.readAsDataURL(receiptFile);
      }).catch(() => undefined);
    }

    saveBooking({
      plan,
      date,
      courtId,
      slotIds: slots
        .filter((slot) => slotIds.includes(slot.id))
        .map((slot) => slot.id),
      name: name.trim(),
      email: email.trim().toLowerCase(),
      referenceId: referenceId.trim(),
      receiptName,
      receiptDataUrl: receiptDataUrl || undefined,
      receiptMimeType: receiptFile.type || undefined,
    });
    setStep("done");
  }

  if (!open || !plan || !meta) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-5"
      data-lenis-prevent
    >
      <button
        type="button"
        className="absolute inset-0 bg-black/75"
        onClick={onClose}
        aria-label="Close booking"
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="booking-modal-title"
        className={
          step === "pay"
            ? "relative max-h-[min(92svh,840px)] w-full max-w-6xl overflow-y-auto border border-yellow/20 bg-black"
            : "relative flex h-[min(92svh,840px)] w-full max-w-6xl flex-col overflow-hidden border border-yellow/20 bg-black"
        }
      >
        <div className="pointer-events-none sticky top-0 z-20 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="pointer-events-auto m-3 grid h-9 w-9 place-items-center bg-black/80 text-white/70 transition hover:text-yellow"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {step === "done" ? (
          <div className="-mt-[60px] flex h-full flex-col items-center justify-center px-6 text-center">
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-yellow">
              Booking
            </p>
            <h2
              id="booking-modal-title"
              className="display mt-3 text-[36px] text-white sm:text-[46px]"
            >
              Proof received.
            </h2>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-white/70">
              We will review it. You&apos;ll get a confirmation email once your
              payment is approved.
            </p>
            <button
              type="button"
              onClick={onClose}
              className="mt-8 h-12 bg-yellow px-6 text-[12px] font-bold uppercase tracking-[0.16em] text-black transition hover:bg-white"
            >
              Done
            </button>
          </div>
        ) : null}

        {step === "schedule" ? (
          <div className="-mt-[60px] grid min-h-0 flex-1 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
            <div className="flex min-h-0 flex-col px-5 pt-6 sm:px-7 sm:pt-7 lg:border-r lg:border-white/10 lg:pr-6">
              <div className="shrink-0 pr-10">
                <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-yellow">
                  {meta.eyebrow}
                </p>
                <h2
                  id="booking-modal-title"
                  className="display mt-2 text-[28px] text-white sm:text-[34px]"
                >
                  {meta.title}
                </h2>
                <p className="mt-1 text-sm text-white/60">
                  ₱{meta.price} {meta.unit}. Pick a day, court, and time.
                </p>
              </div>

              <div className="mt-5 min-h-0 flex-1">
                <img
                  src="/image.png"
                  alt="Pickle Era court map: indoor courts 1 to 3, outdoor courts 4 to 6"
                  className="h-36 w-full object-contain object-center lg:h-full"
                />
              </div>
            </div>

            <div className="flex min-h-0 flex-col px-5 pb-5 pt-4 sm:px-7 sm:pb-7 lg:pt-7">
              <div className="min-h-0 flex-1 overflow-y-auto">
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-[12px] font-bold uppercase tracking-[0.16em] text-white">
                    {month.toLocaleDateString("en-PH", {
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                  <div className="flex gap-1">
                    <button
                      type="button"
                      className="grid h-8 w-8 place-items-center text-white/70 transition hover:text-yellow disabled:text-white/20"
                      onClick={() => setMonth(addMonths(month, -1))}
                      disabled={month <= startOfMonth(new Date())}
                      aria-label="Previous month"
                    >
                      <ChevronLeft size={18} />
                    </button>
                    <button
                      type="button"
                      className="grid h-8 w-8 place-items-center text-white/70 transition hover:text-yellow"
                      onClick={() => setMonth(addMonths(month, 1))}
                      aria-label="Next month"
                    >
                      <ChevronRight size={18} />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-semibold uppercase tracking-[0.12em] text-white/40">
                  {WEEKDAYS.map((day) => (
                    <span key={day} className="py-1">
                      {day}
                    </span>
                  ))}
                  {days.map((day, index) => {
                    if (!day)
                      return <span key={`pad-${index}`} className="h-9" />;
                    const key = dateKey(day);
                    const disabled = key < todayKey;
                    const selected = key === date;
                    return (
                      <button
                        key={key}
                        type="button"
                        disabled={disabled}
                        onClick={() => selectDate(key)}
                        className={`grid h-9 place-items-center text-[13px] transition ${
                          selected
                            ? "bg-yellow font-bold text-black"
                            : disabled
                              ? "text-white/20"
                              : "text-white hover:bg-white/10"
                        }`}
                      >
                        {day.getDate()}
                      </button>
                    );
                  })}
                </div>

                <p className="mt-5 text-[11px] font-bold uppercase tracking-[0.16em] text-white">
                  Available courts · {formatLongDate(date)}
                </p>

                <CourtGroup
                  label="Indoor"
                  courts={indoor}
                  plan={plan}
                  date={date}
                  selected={courtId}
                  onSelect={selectCourt}
                />
                <CourtGroup
                  label="Outdoor"
                  courts={outdoor}
                  plan={plan}
                  date={date}
                  selected={courtId}
                  onSelect={selectCourt}
                />

                <p className="mt-5 text-[11px] font-bold uppercase tracking-[0.16em] text-white">
                  Time slots
                </p>
                <p className="mt-1 min-h-5 text-sm text-white/45">
                  {!courtId
                    ? "Select a court to see open times."
                    : multiSlot
                      ? "Tap hours to add or remove."
                      : "Pick an open session."}
                </p>
                <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {slots.map((slot) => {
                    const openSlot =
                      Boolean(courtId) && isSlotOpen(plan, date, courtId, slot);
                    const selected = slotIds.includes(slot.id);
                    return (
                      <button
                        key={slot.id}
                        type="button"
                        disabled={!openSlot}
                        onClick={() => toggleSlot(slot.id)}
                        className={`h-10 px-3 text-[11px] font-bold uppercase tracking-[0.08em] transition ${
                          selected
                            ? "bg-yellow text-black"
                            : openSlot
                              ? "border border-white/20 text-white hover:border-yellow hover:text-yellow"
                              : "border border-white/10 text-white/25"
                        }`}
                      >
                        {slot.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <button
                type="button"
                disabled={!courtId || slotIds.length === 0}
                onClick={onBook}
                className="mt-4 h-12 w-full shrink-0 bg-yellow text-[12px] font-bold uppercase tracking-[0.16em] text-black transition hover:bg-white disabled:cursor-not-allowed disabled:bg-white/15 disabled:text-white/35"
              >
                {slotIds.length > 1
                  ? `Book · ${slotIds.length} hrs · ₱${total}`
                  : `Book · ₱${total || meta.price}`}
              </button>
            </div>
          </div>
        ) : null}

        {step === "pay" ? (
          <form
            onSubmit={onSubmit}
            className="-mt-[60px] grid lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]"
          >
            <div className="px-5 pt-6 sm:px-7 sm:pt-7 lg:border-r lg:border-white/10 lg:pr-6">
              <div className="pr-10">
                <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-yellow">
                  Payment
                </p>
                <h2
                  id="booking-modal-title"
                  className="display mt-2 text-[28px] text-white sm:text-[34px]"
                >
                  Pay to book.
                </h2>
                <p className="mt-1 text-sm text-white/60">
                  {courtLabel(courtId)} · {formatLongDate(date)}
                </p>

                <div className="mt-4 sm:mt-5">
                  <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-yellow">
                    Amount due
                  </p>
                  <p className="display mt-1 text-[36px] leading-none text-yellow sm:text-[48px]">
                    ₱{total}
                  </p>
                  <p className="mt-2 text-sm font-semibold text-white">
                    {slotIds.length}{" "}
                    {multiSlot
                      ? slotIds.length === 1
                        ? "hour"
                        : "hours"
                      : slotIds.length === 1
                        ? "session"
                        : "sessions"}{" "}
                    × ₱{meta.price}
                  </p>
                  <ul className="mt-2 space-y-0.5 text-sm text-white/55">
                    {selectedLabels.map((label) => (
                      <li key={label}>{label}</li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="mt-5 hidden lg:block">
                <img
                  src="/image.png"
                  alt="Pickle Era court map"
                  className="h-64 w-full object-contain object-center"
                />
              </div>
            </div>

            <div className="px-5 pb-5 pt-6 sm:px-7 sm:pb-7 lg:pt-7">
              <div className="grid items-start gap-4 sm:grid-cols-[168px_minmax(0,1fr)] sm:gap-8">
                <div className="mx-auto w-full max-w-[168px] border border-white/10 bg-white p-3 sm:mx-0">
                  <PaymentQr value={PAYMENT.number} />
                  <p className="mt-2 text-center text-[10px] font-bold uppercase tracking-[0.16em] text-black/70">
                    Scan to pay
                  </p>
                </div>

                <div className="min-w-0 text-center sm:text-left">
                  <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-yellow">
                    {PAYMENT.method}
                  </p>
                  <p className="mt-2 text-lg font-semibold text-white">
                    {PAYMENT.name}
                  </p>
                  <div className="mt-3 flex items-center justify-center gap-2 sm:justify-start">
                    <p className="text-lg font-bold tracking-wide text-white sm:text-[22px]">
                      {PAYMENT.number}
                    </p>
                    <button
                      type="button"
                      onClick={() => void copyNumber()}
                      className="grid h-9 w-9 shrink-0 place-items-center border border-white/20 text-white transition hover:border-yellow hover:text-yellow"
                      aria-label="Copy GCash number"
                    >
                      {copied ? <Check size={14} /> : <Copy size={14} />}
                    </button>
                  </div>
                  <p className="mt-2 text-sm font-semibold text-yellow">
                    Send ₱{total}, then upload your receipt.
                  </p>
                </div>
              </div>

              <div className="mt-6 grid gap-3 sm:mt-8 sm:grid-cols-2">
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Your name"
                  className="h-12 border border-white/10 bg-transparent px-4 text-sm text-white outline-none placeholder:text-white/40 focus:border-yellow"
                />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="Your email"
                  className="h-12 border border-white/10 bg-transparent px-4 text-sm text-white outline-none placeholder:text-white/40 focus:border-yellow"
                />
                <input
                  type="text"
                  required
                  value={referenceId}
                  onChange={(event) => setReferenceId(event.target.value)}
                  placeholder="Reference ID"
                  className="h-12 border border-white/10 bg-transparent px-4 text-sm text-white outline-none placeholder:text-white/40 focus:border-yellow sm:col-span-2"
                />
                <label className="flex h-12 cursor-pointer items-center gap-3 border border-white/10 bg-transparent px-4 text-sm text-white/70 transition hover:border-yellow sm:col-span-2">
                  <Upload size={16} />
                  <span className="truncate">
                    {receiptName || "Upload receipt"}
                  </span>
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    required
                    className="sr-only"
                    onChange={onReceipt}
                  />
                </label>
              </div>

              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={() => setStep("schedule")}
                  className="pay-action w-full border border-white/20 text-[12px] font-bold uppercase tracking-[0.16em] text-white transition hover:border-yellow hover:text-yellow sm:flex-1"
                >
                  Back
                </button>
                <button
                  type="submit"
                  className="pay-action w-full bg-yellow text-[12px] font-bold uppercase tracking-[0.16em] text-black transition hover:bg-white sm:flex-1"
                >
                  Submit proof · ₱{total}
                </button>
              </div>
            </div>
          </form>
        ) : null}
      </div>
    </div>
  );
}

function CourtGroup({
  label,
  courts,
  plan,
  date,
  selected,
  onSelect,
}: {
  label: string;
  courts: typeof COURTS;
  plan: BookingPlan;
  date: string;
  selected: string;
  onSelect: (id: string) => void;
}) {
  return (
    <div className="mt-4">
      <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/45">
        {label}
      </p>
      <div className="flex flex-wrap gap-2">
        {courts.map((court) => {
          const available = courtHasOpening(plan, date, court.id);
          const active = selected === court.id;
          return (
            <button
              key={court.id}
              type="button"
              disabled={!available}
              onClick={() => onSelect(court.id)}
              className={`h-10 px-3 text-[11px] font-bold uppercase tracking-[0.12em] transition ${
                active
                  ? "bg-yellow text-black"
                  : available
                    ? "border border-white/20 text-white hover:border-yellow hover:text-yellow"
                    : "border border-white/10 text-white/25"
              }`}
            >
              {court.name}
              {!available ? " · Full" : ""}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function PaymentQr({ value }: { value: string }) {
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
          grid[y + row][x + col] = edge || inner;
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
        if (grid[row][col]) continue;
        seed = (seed * 1103515245 + 12345) >>> 0;
        grid[row][col] = seed % 3 !== 0;
      }
    }

    return grid;
  }, [value]);

  return (
    <svg
      viewBox="0 0 21 21"
      className="aspect-square w-full"
      aria-hidden="true"
    >
      {cells.map((row, y) =>
        row.map((on, x) =>
          on ? (
            <rect
              key={`${x}-${y}`}
              x={x}
              y={y}
              width="1"
              height="1"
              fill="#1D1D1B"
            />
          ) : null,
        ),
      )}
    </svg>
  );
}

function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function addMonths(date: Date, count: number) {
  return new Date(date.getFullYear(), date.getMonth() + count, 1);
}

function monthCells(month: Date) {
  const first = startOfMonth(month);
  const offset = first.getDay();
  const lastDate = new Date(
    month.getFullYear(),
    month.getMonth() + 1,
    0,
  ).getDate();
  const cells: Array<Date | null> = Array.from({ length: offset }, () => null);
  for (let day = 1; day <= lastDate; day += 1) {
    cells.push(new Date(month.getFullYear(), month.getMonth(), day));
  }
  while (cells.length < 42) cells.push(null);
  return cells;
}
