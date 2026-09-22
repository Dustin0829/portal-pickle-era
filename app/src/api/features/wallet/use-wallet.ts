import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  createAdminManualCredit,
  createMeWalletTopUp,
  getAdminWalletProfile,
  getMeWallet,
  listAdminWalletTopUps,
  listMeWalletTransactions,
  patchAdminWalletTopUp,
} from "@/api/features/wallet/wallet.service";
import type {
  CreateAdminManualCreditBody,
  CreateWalletTopUpBody,
  ListAdminWalletTopUpsQuery,
  ListMeWalletTransactionsQuery,
  PatchAdminWalletTopUpBody,
} from "@/api/features/wallet/wallet.schema";
import { isApiValidationError } from "@/api/lib/apply-field-errors-to-form";
import { getUserFacingApiErrorMessage } from "@/api/lib/api-error-message";

export const meWalletQueryKey = ["me-wallet"] as const;
export const meWalletTransactionsQueryKey = ["me-wallet-transactions"] as const;
export const adminWalletTopUpsQueryKey = ["admin-wallet-top-ups"] as const;

export function useMeWallet(enabled = true) {
  return useQuery({
    queryKey: meWalletQueryKey,
    queryFn: ({ signal }) => getMeWallet(signal),
    enabled,
  });
}

export function useMeWalletTransactions(
  query: ListMeWalletTransactionsQuery = {},
  enabled = true,
) {
  return useQuery({
    queryKey: [...meWalletTransactionsQueryKey, query] as const,
    queryFn: ({ signal }) => listMeWalletTransactions(query, signal),
    enabled,
  });
}

export function useAdminWalletTopUps(query: ListAdminWalletTopUpsQuery = {}) {
  return useQuery({
    queryKey: [...adminWalletTopUpsQueryKey, query] as const,
    queryFn: ({ signal }) => listAdminWalletTopUps(query, signal),
  });
}

export function useCreateMeWalletTopUp() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (values: CreateWalletTopUpBody) => createMeWalletTopUp(values),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: meWalletQueryKey });
      void queryClient.invalidateQueries({
        queryKey: meWalletTransactionsQueryKey,
      });
      toast.success("Top-up submitted for review");
    },
    onError: (error) => {
      if (isApiValidationError(error)) return;
      toast.error(getUserFacingApiErrorMessage(error));
    },
  });
}

export function usePatchAdminWalletTopUp() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: { id: string } & PatchAdminWalletTopUpBody) =>
      patchAdminWalletTopUp(input.id, { status: input.status }),
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({
        queryKey: adminWalletTopUpsQueryKey,
      });
      toast.success(
        variables.status === "approved"
          ? "Top-up approved and credited"
          : "Top-up rejected",
      );
    },
    onError: (error) => {
      toast.error(getUserFacingApiErrorMessage(error));
    },
  });
}

export function useAdminWalletProfile(userId: string | null) {
  return useQuery({
    queryKey: ["admin-wallet-profile", userId] as const,
    queryFn: ({ signal }) => getAdminWalletProfile(userId!, signal),
    enabled: Boolean(userId),
  });
}

export function useCreateAdminManualCredit() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (values: CreateAdminManualCreditBody) =>
      createAdminManualCredit(values),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: adminWalletTopUpsQueryKey,
      });
      toast.success("Credits added to player wallet");
    },
    onError: (error) => {
      if (isApiValidationError(error)) return;
      toast.error(getUserFacingApiErrorMessage(error));
    },
  });
}
