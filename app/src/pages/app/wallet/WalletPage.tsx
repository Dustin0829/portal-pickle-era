import { useRef, useState } from "react";
import { Upload, Wallet } from "lucide-react";
import {
  createWalletTopUpFormSchema,
  type CreateWalletTopUpFormValues,
  type WalletLedgerEntryDto,
  type WalletLedgerType,
} from "@/api/features/wallet/wallet.schema";
import {
  useCreateMeWalletTopUp,
  useMeWallet,
  useMeWalletTransactions,
} from "@/api/features/wallet/use-wallet";
import { uploadReceiptFile } from "@/api/features/uploads/uploads.service";
import { PaymentMethodPicker } from "@/components/booking/PaymentMethodCarousel";
import { AppPageShell } from "@/components/layout/AppPageShell";
import { PortalListSkeleton } from "@/components/portal/portal-skeletons";
import { useZodForm } from "@/lib/forms/useZodForm";
import { mapMutationErrorToForm } from "@/lib/forms/mapMutationErrorToForm";
import {
  formatCentsAsPesos,
  pesosToCents,
} from "@/lib/wallet/formatWalletMoney";
import { usePaymentMethods } from "@/lib/wallet/paymentSettings";
import { getWalletPageStatus } from "@/lib/wallet/walletListStatus";
import { cn } from "@/lib/utils";

type WalletTab = "wallet" | "history";

const LEDGER_TYPE_LABELS: Record<WalletLedgerType, string> = {
  top_up: "Top-up credit",
  booking_debit: "Booking credit hold",
  booking_refund: "Booking credit refund",
  food_debit: "Food order",
};

export function WalletPage() {
  const [tab, setTab] = useState<WalletTab>("wallet");

  return (
    <div className="relative min-h-full overflow-hidden">
      <AppPageShell width="wide" className="relative z-10">
        <header className="mb-6 flex flex-col gap-2">
          <h1 className="display text-[28px] text-zinc-900 sm:text-[32px]">
            Wallet
          </h1>
          <p className="text-sm text-zinc-500">
            Check your balance, top up, and review wallet activity.
          </p>
        </header>

        <div
          role="tablist"
          aria-label="Wallet sections"
          className="mb-6 flex flex-wrap gap-1.5 border-b border-zinc-200"
        >
          {(
            [
              { id: "wallet" as const, label: "Wallet" },
              { id: "history" as const, label: "Transaction history" },
            ] as const
          ).map((item) => (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={tab === item.id}
              id={`wallet-tab-${item.id}`}
              onClick={() => setTab(item.id)}
              className={cn(
                "px-3 py-2 text-[11px] font-bold uppercase tracking-[0.14em] transition",
                tab === item.id
                  ? "border-b-2 border-yellow text-zinc-900"
                  : "text-zinc-500 hover:text-zinc-800",
              )}
            >
              {item.label}
            </button>
          ))}
        </div>

        {tab === "wallet" ? (
          <div role="tabpanel" aria-labelledby="wallet-tab-wallet">
            <WalletTabPanel />
          </div>
        ) : (
          <div role="tabpanel" aria-labelledby="wallet-tab-history">
            <HistoryTabPanel />
          </div>
        )}
      </AppPageShell>
    </div>
  );
}

function WalletTabPanel() {
  const { data, isPending, isError, refetch, error } = useMeWallet();
  const status = getWalletPageStatus({ isPending, isError, data });

  if (status === "loading") {
    return <PortalListSkeleton rows={3} />;
  }

  if (status === "error") {
    return (
      <div
        className="rounded-2xl border border-zinc-200/80 bg-white px-5 py-8 text-sm text-zinc-500"
        role="alert"
      >
        <p>Could not load your wallet.</p>
        <button
          type="button"
          onClick={() => void refetch()}
          className="mt-3 text-[11px] font-bold uppercase tracking-[0.14em] text-amber-700 hover:text-zinc-900"
        >
          Try again
        </button>
        {error ? (
          <p className="mt-2 text-xs text-zinc-400">{String(error.message)}</p>
        ) : null}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <section className="rounded-2xl border border-zinc-200/80 bg-white p-5 sm:p-6">
        <div className="flex items-center gap-3">
          <span className="grid size-11 place-items-center rounded-full bg-amber-100 text-amber-800">
            <Wallet size={22} aria-hidden />
          </span>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-zinc-400">
              Balance
            </p>
            <p className="display mt-1 text-[36px] leading-none text-zinc-900">
              {formatCentsAsPesos(data?.balanceCents ?? 0)}
            </p>
          </div>
        </div>
      </section>

      <WalletTopUpForm />

      <section className="rounded-2xl border border-zinc-200/80 bg-white p-5 sm:p-6">
        <h2 className="text-sm font-semibold text-zinc-900">Recent top-ups</h2>
        {(data?.topUps.length ?? 0) === 0 ? (
          <p className="mt-3 text-sm text-zinc-500">
            No top-ups yet. Submit one above after paying via a listed method.
          </p>
        ) : (
          <ul className="mt-4 flex flex-col gap-2">
            {data!.topUps.map((item) => (
              <li
                key={item.id}
                className="flex items-center justify-between gap-3 border-t border-zinc-100 py-3 first:border-t-0 first:pt-0"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium text-zinc-900">
                    {formatCentsAsPesos(item.amountCents)}
                  </p>
                  <p className="mt-0.5 text-xs text-zinc-500">
                    {new Date(item.createdAt).toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                    {item.receiptName ? ` · ${item.receiptName}` : ""}
                  </p>
                </div>
                <TopUpStatusBadge status={item.status} />
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function HistoryTabPanel() {
  const { data, isPending, isError, refetch, error } = useMeWalletTransactions({
    limit: 50,
    order: "desc",
  });

  if (isPending) {
    return <PortalListSkeleton rows={4} />;
  }

  if (isError) {
    return (
      <div
        className="rounded-2xl border border-zinc-200/80 bg-white px-5 py-8 text-sm text-zinc-500"
        role="alert"
      >
        <p>Could not load transaction history.</p>
        <button
          type="button"
          onClick={() => void refetch()}
          className="mt-3 text-[11px] font-bold uppercase tracking-[0.14em] text-amber-700 hover:text-zinc-900"
        >
          Try again
        </button>
        {error ? (
          <p className="mt-2 text-xs text-zinc-400">{String(error.message)}</p>
        ) : null}
      </div>
    );
  }

  const items = data?.items ?? [];
  if (items.length === 0) {
    return (
      <div className="rounded-2xl border border-zinc-200/80 bg-white px-5 py-8 text-sm text-zinc-500">
        <p>
          No wallet activity yet. Approved top-ups and spends will show up here.
        </p>
      </div>
    );
  }

  return (
    <section className="rounded-2xl border border-zinc-200/80 bg-white p-5 sm:p-6">
      <h2 className="sr-only">Transaction history</h2>
      <ul className="flex flex-col">
        {items.map((item) => (
          <HistoryRow key={item.id} item={item} />
        ))}
      </ul>
    </section>
  );
}

function HistoryRow({ item }: { item: WalletLedgerEntryDto }) {
  const credit = item.amountCents > 0;
  const signed = `${credit ? "+" : "−"}${formatCentsAsPesos(Math.abs(item.amountCents))}`;

  return (
    <li className="flex items-start justify-between gap-3 border-t border-zinc-100 py-3 first:border-t-0 first:pt-0">
      <div className="min-w-0">
        <p className="text-sm font-medium text-zinc-900">
          {LEDGER_TYPE_LABELS[item.type]}
        </p>
        <p className="mt-0.5 text-xs text-zinc-500">
          {new Date(item.createdAt).toLocaleString(undefined, {
            month: "short",
            day: "numeric",
            year: "numeric",
            hour: "numeric",
            minute: "2-digit",
          })}
        </p>
      </div>
      <p
        className={cn(
          "shrink-0 text-sm font-semibold tabular-nums",
          credit ? "text-green" : "text-zinc-900",
        )}
      >
        {signed}
      </p>
    </li>
  );
}

function WalletTopUpForm() {
  const paymentMethods = usePaymentMethods();
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [receiptError, setReceiptError] = useState("");
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useZodForm(createWalletTopUpFormSchema, {
    defaultValues: { amountPesos: undefined as unknown as number },
  });
  const { mutateAsync: createTopUp, isPending: isCreating } =
    useCreateMeWalletTopUp();

  const busy = uploading || isCreating;
  const amountPesos = form.watch("amountPesos");
  const amountHint =
    Number.isFinite(amountPesos) && amountPesos >= 1
      ? `Send ₱${Number(amountPesos).toLocaleString("en-PH")}, then upload your receipt.`
      : "Enter an amount, send payment, then upload your receipt.";

  async function onSubmit(values: CreateWalletTopUpFormValues) {
    setReceiptError("");
    if (!receiptFile) {
      setReceiptError("Upload your payment receipt.");
      return;
    }

    setUploading(true);
    try {
      const upload = await uploadReceiptFile(receiptFile);
      await createTopUp({
        amountCents: pesosToCents(values.amountPesos),
        receiptKey: upload.receiptKey,
        receiptMimeType: upload.receiptMimeType,
        receiptName: receiptFile.name,
      });
      form.reset({ amountPesos: undefined as unknown as number });
      setReceiptFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (error) {
      if (error instanceof Error && error.message.includes("Receipt")) {
        setReceiptError(error.message);
        return;
      }
      mapMutationErrorToForm(form.setError)(error);
    } finally {
      setUploading(false);
    }
  }

  return (
    <section className="rounded-2xl border border-zinc-200/80 bg-white p-5 sm:p-6">
      <h2 className="text-sm font-semibold text-zinc-900">Top up</h2>
      <p className="mt-1 text-sm text-zinc-500">
        Pay any amount via a listed method, then upload your receipt for admin
        review.
      </p>

      <div className="mt-5 rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-4">
        <PaymentMethodPicker
          methods={paymentMethods}
          amountHint={amountHint}
          variant="light"
        />
      </div>

      <form
        className="mt-5 flex flex-col gap-4"
        onSubmit={form.handleSubmit((values) => void onSubmit(values))}
        noValidate
      >
        <div>
          <label
            htmlFor="wallet-amount"
            className="text-[10px] font-semibold uppercase tracking-[0.16em] text-zinc-400"
          >
            Amount (₱)
          </label>
          <div className="relative mt-1.5">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">
              ₱
            </span>
            <input
              id="wallet-amount"
              type="number"
              inputMode="decimal"
              min={1}
              max={50_000}
              step="1"
              placeholder="500"
              aria-invalid={Boolean(form.formState.errors.amountPesos)}
              aria-describedby={
                form.formState.errors.amountPesos
                  ? "wallet-amount-error"
                  : undefined
              }
              className="h-11 w-full rounded-xl border border-zinc-200 bg-white pl-8 pr-3 text-sm text-zinc-900 outline-none placeholder:text-zinc-400 focus:border-amber-400"
              {...form.register("amountPesos")}
            />
          </div>
          {form.formState.errors.amountPesos ? (
            <p
              id="wallet-amount-error"
              className="mt-1.5 text-xs text-maroon"
              role="alert"
            >
              {form.formState.errors.amountPesos.message}
            </p>
          ) : null}
        </div>

        <div>
          <label
            htmlFor="wallet-receipt"
            className="text-[10px] font-semibold uppercase tracking-[0.16em] text-zinc-400"
          >
            Receipt
          </label>
          <label className="mt-1.5 flex h-11 cursor-pointer items-center gap-3 rounded-xl border border-zinc-200 bg-white px-4 text-sm text-zinc-600 transition hover:border-amber-400">
            <Upload size={16} aria-hidden />
            <span className="truncate">
              {receiptFile?.name || "Upload receipt (JPEG, PNG, WebP, or PDF)"}
            </span>
            <input
              id="wallet-receipt"
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,application/pdf,.pdf"
              className="sr-only"
              aria-invalid={Boolean(receiptError)}
              aria-describedby={
                receiptError ? "wallet-receipt-error" : undefined
              }
              onChange={(event) => {
                const file = event.target.files?.[0] ?? null;
                setReceiptFile(file);
                setReceiptError("");
              }}
            />
          </label>
          {receiptError ? (
            <p
              id="wallet-receipt-error"
              className="mt-1.5 text-xs text-maroon"
              role="alert"
            >
              {receiptError}
            </p>
          ) : null}
        </div>

        <button
          type="submit"
          disabled={busy}
          aria-busy={busy}
          className="inline-flex h-11 w-full items-center justify-center rounded-xl bg-amber-400 px-4 text-[11px] font-bold uppercase tracking-[0.14em] text-zinc-900 transition hover:bg-amber-500 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
        >
          {busy ? "Submitting…" : "Submit top-up"}
        </button>
      </form>
    </section>
  );
}

function TopUpStatusBadge({
  status,
}: {
  status: "pending" | "approved" | "rejected";
}) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-[0.12em]",
        status === "pending" && "bg-amber-100 text-amber-900",
        status === "approved" && "bg-green/15 text-green",
        status === "rejected" && "bg-maroon/10 text-maroon",
      )}
    >
      {status}
    </span>
  );
}
