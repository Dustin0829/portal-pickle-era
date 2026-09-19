import { useRef, useState } from "react";
import { Check, Copy, Upload, Wallet } from "lucide-react";
import {
  createWalletTopUpFormSchema,
  type CreateWalletTopUpFormValues,
} from "@/api/features/wallet/wallet.schema";
import {
  useCreateMeWalletTopUp,
  useMeWallet,
} from "@/api/features/wallet/use-wallet";
import { uploadReceiptFile } from "@/api/features/uploads/uploads.service";
import { AppPageShell } from "@/components/layout/AppPageShell";
import { PortalBackdrop } from "@/components/portal/PortalBackdrop";
import { PortalListSkeleton } from "@/components/portal/portal-skeletons";
import { useZodForm } from "@/lib/forms/useZodForm";
import { mapMutationErrorToForm } from "@/lib/forms/mapMutationErrorToForm";
import {
  formatCentsAsPesos,
  pesosToCents,
} from "@/lib/wallet/formatWalletMoney";
import { usePaymentSettings } from "@/lib/wallet/paymentSettings";
import { getWalletPageStatus } from "@/lib/wallet/walletListStatus";
import { cn } from "@/lib/utils";

export function WalletPage() {
  const { data, isPending, isError, refetch, error } = useMeWallet();
  const status = getWalletPageStatus({ isPending, isError, data });

  return (
    <div className="relative min-h-full overflow-hidden">
      <PortalBackdrop />

      <AppPageShell width="full" className="relative z-10 max-w-3xl">
        <header className="mb-8 flex flex-col gap-2">
          <h1 className="display text-[42px] text-zinc-900 sm:text-[52px]">
            Wallet
          </h1>
          <p className="text-sm text-zinc-500">
            Check your balance and top up via GCash for future spend.
          </p>
        </header>

        {status === "loading" ? (
          <PortalListSkeleton rows={3} />
        ) : status === "error" ? (
          <div
            className="rounded-2xl border border-zinc-200/80 bg-white px-5 py-8 text-sm text-zinc-500 shadow-sm"
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
              <p className="mt-2 text-xs text-zinc-400">
                {String(error.message)}
              </p>
            ) : null}
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            <section className="rounded-2xl border border-zinc-200/80 bg-white p-5 shadow-sm sm:p-6">
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

            <section className="rounded-2xl border border-zinc-200/80 bg-white p-5 shadow-sm sm:p-6">
              <h2 className="text-sm font-semibold text-zinc-900">
                Recent top-ups
              </h2>
              {(data?.topUps.length ?? 0) === 0 ? (
                <p className="mt-3 text-sm text-zinc-500">
                  No top-ups yet. Submit one above after paying via GCash.
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
                          {new Date(item.createdAt).toLocaleDateString(
                            undefined,
                            {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            },
                          )}
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
        )}
      </AppPageShell>
    </div>
  );
}

function WalletTopUpForm() {
  const payment = usePaymentSettings();
  const [copied, setCopied] = useState(false);
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

  async function copyNumber() {
    try {
      await navigator.clipboard.writeText(payment.number.replaceAll(" ", ""));
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  async function onSubmit(values: CreateWalletTopUpFormValues) {
    setReceiptError("");
    if (!receiptFile) {
      setReceiptError("Upload your GCash receipt.");
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
    <section className="rounded-2xl border border-zinc-200/80 bg-white p-5 shadow-sm sm:p-6">
      <h2 className="text-sm font-semibold text-zinc-900">Top up</h2>
      <p className="mt-1 text-sm text-zinc-500">
        Pay any amount via GCash, then upload your receipt for admin review.
      </p>

      <div className="mt-5 rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-4">
        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-zinc-400">
          {payment.method}
        </p>
        <p className="mt-1 text-sm font-medium text-zinc-900">{payment.name}</p>
        <div className="mt-2 flex items-center gap-2">
          <p className="font-mono text-lg font-bold tracking-wide text-zinc-900">
            {payment.number}
          </p>
          <button
            type="button"
            onClick={() => void copyNumber()}
            className="grid size-9 place-items-center rounded-lg border border-zinc-200 bg-white text-zinc-600 transition hover:border-amber-400 hover:text-zinc-900"
            aria-label="Copy GCash number"
          >
            {copied ? <Check size={14} /> : <Copy size={14} />}
          </button>
        </div>
        {Number.isFinite(amountPesos) && amountPesos >= 1 ? (
          <p className="mt-2 text-sm text-amber-800">
            Send ₱{Number(amountPesos).toLocaleString("en-PH")}, then upload
            your receipt.
          </p>
        ) : (
          <p className="mt-2 text-sm text-zinc-500">
            Enter an amount, send via GCash, then upload your receipt.
          </p>
        )}
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
