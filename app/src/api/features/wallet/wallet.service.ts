import api from "@/api/client";
import {
  adminManualCreditResponseSchema,
  adminWalletProfileDtoSchema,
  adminWalletTopUpDtoSchema,
  createAdminManualCreditBodySchema,
  createWalletTopUpBodySchema,
  listAdminWalletTopUpsQuerySchema,
  listMeWalletTransactionsQuerySchema,
  meWalletDtoSchema,
  patchAdminWalletTopUpBodySchema,
  walletLedgerEntryDtoSchema,
  walletReceiptUrlSchema,
  walletTopUpDtoSchema,
  type CreateAdminManualCreditBody,
  type CreateWalletTopUpBody,
  type ListAdminWalletTopUpsQuery,
  type ListMeWalletTransactionsQuery,
  type PatchAdminWalletTopUpBody,
} from "@/api/features/wallet/wallet.schema";
import { paginationMetaSchema } from "@/api/schema/primitives.schema";
import { z } from "zod";

export async function getMeWallet(signal?: AbortSignal) {
  const { data } = await api.get("/me/wallet", { signal });
  return meWalletDtoSchema.parse(data);
}

export async function listMeWalletTransactions(
  query: ListMeWalletTransactionsQuery = {},
  signal?: AbortSignal,
) {
  const params = listMeWalletTransactionsQuerySchema.parse(query);
  const response = await api.get("/me/wallet/transactions", { params, signal });
  const payload = response.data as { items: unknown };
  const items = z.array(walletLedgerEntryDtoSchema).parse(payload.items);
  const metaRaw = (response as { meta?: unknown }).meta;
  const meta = metaRaw ? paginationMetaSchema.parse(metaRaw) : undefined;
  return { items, meta };
}

export async function createMeWalletTopUp(input: CreateWalletTopUpBody) {
  const body = createWalletTopUpBodySchema.parse(input);
  const { data } = await api.post("/me/wallet/top-ups", body);
  return walletTopUpDtoSchema.parse(data);
}

export async function listAdminWalletTopUps(
  query: ListAdminWalletTopUpsQuery = {},
  signal?: AbortSignal,
) {
  const params = listAdminWalletTopUpsQuerySchema.parse(query);
  const response = await api.get("/admin/wallet/top-ups", { params, signal });
  const payload = response.data as { items: unknown };
  const items = z.array(adminWalletTopUpDtoSchema).parse(payload.items);
  const metaRaw = (response as { meta?: unknown }).meta;
  const meta = metaRaw ? paginationMetaSchema.parse(metaRaw) : undefined;
  return { items, meta };
}

export async function patchAdminWalletTopUp(
  id: string,
  input: PatchAdminWalletTopUpBody,
) {
  const body = patchAdminWalletTopUpBodySchema.parse(input);
  const { data } = await api.patch(`/admin/wallet/top-ups/${id}`, body);
  return adminWalletTopUpDtoSchema.parse(data);
}

export async function getAdminWalletTopUpReceiptUrl(
  id: string,
  signal?: AbortSignal,
) {
  const { data } = await api.get(`/admin/wallet/top-ups/${id}/receipt-url`, {
    signal,
  });
  return walletReceiptUrlSchema.parse(data);
}

export async function getAdminWalletProfile(
  userId: string,
  signal?: AbortSignal,
) {
  const { data } = await api.get(`/admin/wallet/users/${userId}/profile`, {
    signal,
  });
  return adminWalletProfileDtoSchema.parse(data);
}

export async function createAdminManualCredit(
  input: CreateAdminManualCreditBody,
) {
  const body = createAdminManualCreditBodySchema.parse(input);
  const { data } = await api.post("/admin/wallet/manual-credits", body);
  return adminManualCreditResponseSchema.parse(data);
}
