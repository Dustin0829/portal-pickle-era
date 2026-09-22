import {
  listOccupancy,
  listOpenPlaySessions,
} from "@/api/features/bookings/bookings.service";
import { useCreatePublicBooking } from "@/api/features/bookings/use-bookings";
import { uploadReceiptFile } from "@/api/features/uploads/uploads.service";
import { useLenis } from "lenis/react";
import { Upload, X } from "lucide-react";
import { type ChangeEvent, type FormEvent, useEffect, useState } from "react";
import {
  PLAN_META,
  allowsMultiSlot,
  bookingTotal,
  courtsFullLabel,
  earliestBookableDateKey,
  formatLongDate,
  parseDateKey,
  type BookablePlan,
} from "@/lib/booking/booking";
import { coveredHoursForOpenPlaySlotIds } from "@/lib/booking/openPlayHours";
import { useOpenPlaySlots } from "@/lib/booking/openPlaySlots";
import { usePlanUnitPrice } from "@/lib/booking/planPrices";
import {
  EMPTY_UNIFIED_SELECTION,
  toConfirmSelection,
  totalSelectedCourtHours,
  type UnifiedBookingSelection,
} from "@/lib/booking/unifiedBookingSelection";
import { walletAppliedAndRemaining } from "@/lib/booking/walletBookingPay";
import { formatCentsAsPesos } from "@/lib/wallet/formatWalletMoney";
import { useMeWallet } from "@/api/features/wallet/use-wallet";
import { useAuth } from "@/providers/AuthProvider";
import { getUserFacingApiErrorMessage } from "@/api/lib/api-error-message";
import { PaymentMethodPicker } from "@/components/booking/PaymentMethodCarousel";
import { UnifiedBookingSchedule } from "@/components/booking/UnifiedBookingSchedule";
import { usePaymentMethods } from "@/lib/wallet/paymentSettings";
import { cn } from "@/lib/utils";

type Step = "schedule" | "pay" | "done";
type PayMethod = "cash" | "credits";

export type BookingModalPreset = {
  date: string;
  courtId: string;
  slotIds: string[];
  step?: "schedule" | "pay";
};

type BookingModalProps = {
  prefer?: BookablePlan;
  preset?: BookingModalPreset;
  /** Player portal only — show Pay with credits (partial wallet + GCash). */
  allowCreditsPay?: boolean;
  onClose: () => void;
};

export function BookingModal({
  prefer,
  preset,
  allowCreditsPay = false,
  onClose,
}: BookingModalProps) {
  const lenis = useLenis();
  const { user, status: authStatus } = useAuth();
  const isAuthenticated = authStatus === "authenticated";
  const creditsPayAvailable = allowCreditsPay && isAuthenticated;
  const { data: wallet } = useMeWallet(creditsPayAvailable);
  const { mutateAsync: createPublicBooking } = useCreatePublicBooking();
  const bookableFloor = earliestBookableDateKey();
  const initialDate =
    preset?.date && preset.date >= bookableFloor ? preset.date : bookableFloor;
  const [step, setStep] = useState<Step>(preset?.step ?? "schedule");
  const [month, setMonth] = useState(() =>
    startOfMonth(parseDateKey(initialDate)),
  );
  const [date, setDate] = useState(() => initialDate);
  const [selection, setSelection] = useState<UnifiedBookingSelection>(() =>
    preset?.courtId && preset.slotIds?.length
      ? {
          plan: "court",
          courtId: preset.courtId,
          slotIds: preset.slotIds,
          courtSlots: [
            {
              courtId: preset.courtId as
                | "in-1"
                | "in-2"
                | "in-3"
                | "out-1"
                | "out-2"
                | "out-3",
              slotIds: preset.slotIds,
            },
          ],
        }
      : EMPTY_UNIFIED_SELECTION,
  );
  const [name, setName] = useState(() => user?.name ?? "");
  const [email, setEmail] = useState(() => user?.email ?? "");
  const [referenceId, setReferenceId] = useState("");
  const [receiptName, setReceiptName] = useState("");
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [submitError, setSubmitError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [payMethod, setPayMethod] = useState<PayMethod>("cash");
  const paymentMethods = usePaymentMethods();
  const [cashMethodSelected, setCashMethodSelected] = useState(
    () => paymentMethods.length <= 1,
  );
  const [slotStatusByKey, setSlotStatusByKey] = useState<
    Map<string, "pending" | "approved">
  >(() => new Map());
  const [hoursBlockedByOpenPlay, setHoursBlockedByOpenPlay] = useState<
    Set<string>
  >(() => new Set());
  const [occupancyLoading, setOccupancyLoading] = useState(false);
  const [occupancyError, setOccupancyError] = useState("");
  const [bookedCountBySlotId, setBookedCountBySlotId] = useState<
    Map<string, number>
  >(() => new Map());
  const [capacityLoading, setCapacityLoading] = useState(false);
  const [capacityError, setCapacityError] = useState("");
  const openPlaySlots = useOpenPlaySlots();

  const plan = selection.plan;
  const courtId = selection.courtId;
  const slotIds = selection.slotIds;
  const courtSlots = selection.courtSlots;
  const isOpenPlay = plan === "open-play";
  const meta = plan ? PLAN_META[plan] : null;
  const unitPrice = usePlanUnitPrice(plan ?? prefer ?? "court");
  const multiSlot = plan ? allowsMultiSlot(plan) : false;
  const billedUnits = plan ? totalSelectedCourtHours(selection) : 0;
  const total = plan ? bookingTotal(plan, billedUnits, unitPrice) : 0;
  const balanceCents = wallet?.balanceCents ?? 0;
  const useCredits = creditsPayAvailable && payMethod === "credits";
  const walletPay = useCredits
    ? walletAppliedAndRemaining({
        balanceCents,
        totalPesos: total,
      })
    : null;
  const walletAppliedCents = walletPay?.walletAppliedCents ?? 0;
  const remainingCashPesos = walletPay
    ? walletPay.remainingCashCents / 100
    : total;
  const needsReceipt = !walletPay || walletPay.remainingCashCents > 0;
  const showPayDetails = !needsReceipt || cashMethodSelected;
  const canUseCredits = creditsPayAvailable && balanceCents > 0;
  const displayLabels = isOpenPlay
    ? openPlaySlots
        .filter((slot) => slotIds.includes(slot.id))
        .map((slot) => slot.label)
    : slotIds.map((id) => {
        const hour = Number(id.slice(0, 2));
        if (Number.isNaN(hour)) return id;
        const suffix = hour >= 12 ? "PM" : "AM";
        const h = hour % 12 === 0 ? 12 : hour % 12;
        return `${h}:00 ${suffix}`;
      });

  useEffect(() => {
    if (!user) return;
    setName((current) => current || user.name);
    setEmail((current) => current || user.email);
  }, [user]);

  useEffect(() => {
    const controller = new AbortController();
    setOccupancyLoading(true);
    setOccupancyError("");
    void listOccupancy({ date }, controller.signal)
      .then((items) => {
        const next = new Map<string, "pending" | "approved">();
        const openPlaySlotIds: string[] = [];
        for (const item of items) {
          if (item.plan === "open-play") {
            openPlaySlotIds.push(...item.slotIds);
            continue;
          }
          for (const slotId of item.slotIds) {
            const key = `${item.courtId}|${slotId}`;
            const existing = next.get(key);
            if (existing === "approved") continue;
            next.set(key, item.status);
          }
        }
        setSlotStatusByKey(next);
        setHoursBlockedByOpenPlay(
          new Set(coveredHoursForOpenPlaySlotIds(openPlaySlotIds)),
        );
      })
      .catch(() => {
        setSlotStatusByKey(new Map());
        setHoursBlockedByOpenPlay(new Set());
        setOccupancyError(
          "Couldn’t load court availability. Check your connection and try again.",
        );
      })
      .finally(() => {
        if (!controller.signal.aborted) setOccupancyLoading(false);
      });
    return () => controller.abort();
  }, [date]);

  useEffect(() => {
    const controller = new AbortController();
    setCapacityLoading(true);
    setCapacityError("");
    void listOpenPlaySessions({ date }, controller.signal)
      .then((items) => {
        const next = new Map<string, number>();
        for (const item of items) {
          next.set(item.slotId, item.bookedCount);
        }
        setBookedCountBySlotId(next);
      })
      .catch(() => {
        setBookedCountBySlotId(new Map());
        setCapacityError(
          "Couldn’t load session availability. Check your connection and try again.",
        );
      })
      .finally(() => {
        if (!controller.signal.aborted) setCapacityLoading(false);
      });
    return () => controller.abort();
  }, [date]);

  useEffect(() => {
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
  }, [onClose, lenis]);

  function selectDate(next: string) {
    setDate(next);
    setSelection(EMPTY_UNIFIED_SELECTION);
  }

  function onReceipt(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null;
    setReceiptFile(file);
    setReceiptName(file?.name ?? "");
  }

  function onBook() {
    const confirmed = toConfirmSelection(date, selection);
    if (!confirmed) return;
    setStep("pay");
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const confirmed = toConfirmSelection(date, selection);
    if (!confirmed || !name.trim() || !email.trim()) return;
    if (needsReceipt) {
      if (!referenceId.trim() || !receiptName || !receiptFile) return;
    }

    setSubmitError("");
    setSubmitting(true);
    try {
      const upload =
        needsReceipt && receiptFile
          ? await uploadReceiptFile(receiptFile)
          : null;
      await createPublicBooking({
        plan: confirmed.plan,
        date: confirmed.date,
        ...(confirmed.courtSlots?.length
          ? { courtSlots: confirmed.courtSlots }
          : {
              courtId: confirmed.courtId as
                | "in-1"
                | "in-2"
                | "in-3"
                | "out-1"
                | "out-2"
                | "out-3",
              slotIds: confirmed.slotIds,
            }),
        name: name.trim(),
        email: email.trim().toLowerCase(),
        ...(needsReceipt
          ? {
              referenceId: referenceId.trim(),
              receiptName,
              receiptKey: upload!.receiptKey,
              receiptMimeType: upload!.receiptMimeType,
            }
          : {
              referenceId: referenceId.trim() || undefined,
            }),
        ...(isAuthenticated
          ? {
              unitPricePesos: unitPrice,
              walletAppliedCents: useCredits ? walletAppliedCents : 0,
            }
          : {}),
      });
      setStep("done");
    } catch (error) {
      setSubmitError(getUserFacingApiErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  }

  const scheduleBlocked =
    occupancyLoading ||
    capacityLoading ||
    Boolean(occupancyError) ||
    Boolean(capacityError);
  const canContinue =
    Boolean(toConfirmSelection(date, selection)) && !scheduleBlocked;

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
            : step === "schedule"
              ? "relative flex h-[min(92svh,840px)] w-full max-w-6xl flex-col overflow-hidden border border-zinc-300 bg-[#f5f0e8]"
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
          <div className="-mt-[60px] flex min-h-0 flex-1 flex-col">
            <UnifiedBookingSchedule
              date={date}
              month={month}
              onMonthChange={setMonth}
              onDateChange={selectDate}
              bookableFloor={bookableFloor}
              selection={selection}
              onSelectionChange={setSelection}
              prefer={prefer}
              openPlaySlots={openPlaySlots}
              slotStatusByKey={slotStatusByKey}
              hoursBlockedByOpenPlay={hoursBlockedByOpenPlay}
              bookedCountBySlotId={bookedCountBySlotId}
              occupancyLoading={occupancyLoading}
              capacityLoading={capacityLoading}
              occupancyError={occupancyError}
              capacityError={capacityError}
              onBack={onClose}
            />
            <div className="shrink-0 border-t border-zinc-200 bg-[#f5f0e8] px-5 py-4 sm:px-7">
              <button
                type="button"
                disabled={!canContinue}
                onClick={onBook}
                className="h-12 w-full bg-yellow text-[12px] font-bold uppercase tracking-[0.16em] text-black transition hover:bg-zinc-900 hover:text-yellow disabled:cursor-not-allowed disabled:bg-zinc-200 disabled:text-zinc-400"
              >
                {plan === "court" && billedUnits > 1
                  ? `Continue · ${billedUnits} hrs · ₱${total}`
                  : plan
                    ? `Continue · ₱${total || unitPrice}`
                    : `Continue · ₱${unitPrice}`}
              </button>
            </div>
          </div>
        ) : null}

        {step === "pay" && plan && meta ? (
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
                  {meta.title} · {courtsFullLabel(courtId, courtSlots)} ·{" "}
                  {formatLongDate(date)}
                </p>

                <div className="mt-4 sm:mt-5">
                  <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-yellow">
                    Amount due
                  </p>
                  <p className="display mt-1 text-[36px] leading-none text-yellow sm:text-[48px]">
                    ₱{needsReceipt ? remainingCashPesos : 0}
                  </p>
                  <p className="mt-2 text-sm font-semibold text-white">
                    {billedUnits}{" "}
                    {multiSlot
                      ? billedUnits === 1
                        ? "hour"
                        : "hours"
                      : billedUnits === 1
                        ? "session"
                        : "sessions"}{" "}
                    × ₱{unitPrice}
                    {total !== remainingCashPesos ? ` · Total ₱${total}` : ""}
                  </p>
                  {walletPay && walletPay.walletAppliedCents > 0 ? (
                    <p className="mt-2 text-sm text-white/70">
                      Credits apply{" "}
                      {formatCentsAsPesos(walletPay.walletAppliedCents)}
                      {walletPay.remainingCashCents > 0
                        ? ` · Pay ${formatCentsAsPesos(walletPay.remainingCashCents)} via cash`
                        : " · Covered in full"}
                    </p>
                  ) : null}
                  <ul className="mt-2 space-y-0.5 text-sm text-white/55">
                    {displayLabels.map((label) => (
                      <li key={label}>{label}</li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="mt-5 hidden lg:block">
                <img
                  src="/image.png"
                  alt="Pickle Era court map: indoor courts 1 to 3, outdoor courts 4 to 6"
                  className="h-64 w-full object-contain object-center"
                />
              </div>
            </div>

            <div className="px-5 pb-5 pt-6 sm:px-7 sm:pb-7 lg:pt-7">
              {creditsPayAvailable ? (
                <fieldset className="mb-5">
                  <legend className="text-[11px] font-bold uppercase tracking-[0.16em] text-yellow">
                    Pay with
                  </legend>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => setPayMethod("cash")}
                      className={cn(
                        "h-9 px-3 text-[10px] font-bold uppercase tracking-[0.12em] transition",
                        payMethod === "cash"
                          ? "bg-yellow text-black"
                          : "border border-white/20 text-white/70 hover:border-yellow hover:text-yellow",
                      )}
                    >
                      Cash / transfer
                    </button>
                    <button
                      type="button"
                      disabled={!canUseCredits}
                      onClick={() => setPayMethod("credits")}
                      className={cn(
                        "h-9 px-3 text-[10px] font-bold uppercase tracking-[0.12em] transition",
                        payMethod === "credits"
                          ? "bg-yellow text-black"
                          : "border border-white/20 text-white/70 hover:border-yellow hover:text-yellow",
                        !canUseCredits && "cursor-not-allowed opacity-40",
                      )}
                    >
                      Pay with credits
                      {creditsPayAvailable
                        ? ` · ${formatCentsAsPesos(balanceCents)}`
                        : ""}
                    </button>
                  </div>
                </fieldset>
              ) : null}

              {needsReceipt ? (
                <PaymentMethodPicker
                  methods={paymentMethods}
                  variant="dark"
                  amountHint={
                    showPayDetails
                      ? `Send ₱${remainingCashPesos}, then upload your receipt.`
                      : null
                  }
                  onActiveChange={(method) =>
                    setCashMethodSelected(Boolean(method))
                  }
                />
              ) : (
                <p className="text-sm text-white/70">
                  Your credits cover this booking. No cash receipt needed —
                  we&apos;ll confirm after review.
                </p>
              )}

              {showPayDetails ? (
                <>
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
                    {needsReceipt ? (
                      <>
                        <input
                          type="text"
                          required
                          value={referenceId}
                          onChange={(event) =>
                            setReferenceId(event.target.value)
                          }
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
                      </>
                    ) : null}
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
                      disabled={submitting}
                      className="pay-action w-full bg-yellow text-[12px] font-bold uppercase tracking-[0.16em] text-black transition hover:bg-white disabled:opacity-60 sm:flex-1"
                    >
                      {submitting
                        ? "Submitting…"
                        : needsReceipt
                          ? `Submit proof · ₱${remainingCashPesos}`
                          : "Submit booking"}
                    </button>
                  </div>
                </>
              ) : (
                <div className="mt-6">
                  <button
                    type="button"
                    onClick={() => setStep("schedule")}
                    className="pay-action w-full border border-white/20 text-[12px] font-bold uppercase tracking-[0.16em] text-white transition hover:border-yellow hover:text-yellow sm:w-auto sm:min-w-[8rem]"
                  >
                    Back
                  </button>
                </div>
              )}
              {submitError ? (
                <p className="mt-3 text-sm text-red-400" role="alert">
                  {submitError}
                </p>
              ) : null}
            </div>
          </form>
        ) : null}
      </div>
    </div>
  );
}

function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}
