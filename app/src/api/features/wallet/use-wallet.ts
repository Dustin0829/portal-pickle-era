import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  createMeWalletTopUp,
  getMeWallet,
  listAdminWalletTopUps,
  patchAdminWalletTopUp,
} from "@/api/features/wallet/wallet.service";
import type {
  CreateWalletTopUpBody,
  ListAdminWalletTopUpsQuery,
  PatchAdminWalletTopUpBody,
} from "@/api/features/wallet/wallet.schema";
import { isApiValidationError } from "@/api/lib/apply-field-errors-to-form";
import { getUserFacingApiErrorMessage } from "@/api/lib/api-error-message";

export const meWalletQueryKey = ["me-wallet"] as const;
export const adminWalletTopUpsQueryKey = ["admin-wallet-top-ups"] as const;

export function useMeWallet(enabled = true) {
  return useQuery({
    queryKey: meWalletQueryKey,
    queryFn: ({ signal }) => getMeWallet(signal),
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
