import type { WalletTopUpDto } from "@/api/features/wallet/wallet.schema";

export type WalletPageStatus = "loading" | "error" | "ready";

export function getWalletPageStatus({
  isPending,
  isError,
  data,
}: {
  isPending: boolean;
  isError: boolean;
  data: { balanceCents: number; topUps: WalletTopUpDto[] } | undefined;
}): WalletPageStatus {
  if (isPending && !data) return "loading";
  if (isError && !data) return "error";
  return "ready";
}

export type AdminTopUpsListStatus = "loading" | "error" | "empty" | "ready";

export function getAdminTopUpsListStatus({
  isPending,
  isError,
  items,
}: {
  isPending: boolean;
  isError: boolean;
  items: unknown[] | undefined;
}): AdminTopUpsListStatus {
  if (isPending) return "loading";
  if (isError) return "error";
  if (!items?.length) return "empty";
  return "ready";
}
