import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  createAdminFoodMenuItem,
  createMyFoodOrder,
  listAdminFoodMenu,
  listAdminFoodOrders,
  listMyFoodMenu,
  listMyFoodOrders,
  patchAdminFoodMenuItem,
  patchAdminFoodOrder,
} from "@/api/features/food/food.service";
import type {
  CreateFoodMenuItemBody,
  CreateFoodOrderBody,
  ListAdminFoodOrdersQuery,
  PatchFoodMenuItemBody,
  PatchFoodOrderBody,
} from "@/api/features/food/food.schema";
import { isApiValidationError } from "@/api/lib/apply-field-errors-to-form";
import { getUserFacingApiErrorMessage } from "@/api/lib/api-error-message";

export const meFoodMenuQueryKey = ["me-food-menu"] as const;
export const meFoodOrdersQueryKey = ["me-food-orders"] as const;
export const adminFoodMenuQueryKey = ["admin-food-menu"] as const;
export const adminFoodOrdersQueryKey = ["admin-food-orders"] as const;

export function useMyFoodMenu(enabled = true) {
  return useQuery({
    queryKey: meFoodMenuQueryKey,
    queryFn: ({ signal }) => listMyFoodMenu(signal),
    enabled,
  });
}

export function useMyFoodOrders(enabled = true) {
  return useQuery({
    queryKey: meFoodOrdersQueryKey,
    queryFn: ({ signal }) => listMyFoodOrders(signal),
    enabled,
    refetchOnWindowFocus: true,
  });
}

export function useCreateMyFoodOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (values: CreateFoodOrderBody) => createMyFoodOrder(values),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: meFoodMenuQueryKey });
      void queryClient.invalidateQueries({ queryKey: meFoodOrdersQueryKey });
      toast.success("Order placed");
    },
    onError: (error) => {
      if (isApiValidationError(error)) return;
      toast.error(getUserFacingApiErrorMessage(error));
    },
  });
}

export function useAdminFoodMenu() {
  return useQuery({
    queryKey: adminFoodMenuQueryKey,
    queryFn: ({ signal }) => listAdminFoodMenu(signal),
  });
}

export function useCreateAdminFoodMenuItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (values: CreateFoodMenuItemBody) =>
      createAdminFoodMenuItem(values),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: adminFoodMenuQueryKey });
      toast.success("Menu item added");
    },
    onError: (error) => {
      if (isApiValidationError(error)) return;
      toast.error(getUserFacingApiErrorMessage(error));
    },
  });
}

export function usePatchAdminFoodMenuItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: { id: string } & PatchFoodMenuItemBody) => {
      const { id, ...body } = input;
      return patchAdminFoodMenuItem(id, body);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: adminFoodMenuQueryKey });
      toast.success("Menu item updated");
    },
    onError: (error) => {
      if (isApiValidationError(error)) return;
      toast.error(getUserFacingApiErrorMessage(error));
    },
  });
}

export function useAdminFoodOrders(query: ListAdminFoodOrdersQuery = {}) {
  return useQuery({
    queryKey: [...adminFoodOrdersQueryKey, query] as const,
    queryFn: ({ signal }) => listAdminFoodOrders(query, signal),
  });
}

export function usePatchAdminFoodOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: { id: string } & PatchFoodOrderBody) =>
      patchAdminFoodOrder(input.id, { status: input.status }),
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({
        queryKey: adminFoodOrdersQueryKey,
      });
      toast.success(
        variables.status === "preparing"
          ? "Marked preparing"
          : variables.status === "ready"
            ? "Marked ready"
            : "Order updated",
      );
    },
    onError: (error) => {
      toast.error(getUserFacingApiErrorMessage(error));
    },
  });
}
