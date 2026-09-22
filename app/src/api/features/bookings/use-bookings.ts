import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  createAdminBooking,
  createPublicBooking,
  listAdminBookings,
  listAdminUsers,
  listMyBookings,
  listOccupancy,
  patchAdminBooking,
} from "@/api/features/bookings/bookings.service";
import type {
  CreateAdminBookingBody,
  CreatePublicBookingBody,
  ListBookingsQuery,
  ListUsersQuery,
  OccupancyQuery,
  PatchBookingBody,
} from "@/api/features/bookings/bookings.schema";
import { isApiValidationError } from "@/api/lib/apply-field-errors-to-form";
import { getUserFacingApiErrorMessage } from "@/api/lib/api-error-message";

export const myBookingsQueryKey = ["me-bookings"] as const;
export const occupancyQueryKey = ["bookings-occupancy"] as const;
export const adminBookingsQueryKey = ["admin-bookings"] as const;
export const adminUsersQueryKey = ["admin-users"] as const;

export function useMyBookings(enabled = true) {
  return useQuery({
    queryKey: myBookingsQueryKey,
    queryFn: ({ signal }) => listMyBookings(signal),
    enabled,
  });
}

export function useOccupancy(query: OccupancyQuery, enabled = true) {
  return useQuery({
    queryKey: [...occupancyQueryKey, query] as const,
    queryFn: ({ signal }) => listOccupancy(query, signal),
    enabled: enabled && Boolean(query.date || (query.from && query.to)),
  });
}

export function useAdminBookings(query: ListBookingsQuery = {}) {
  return useQuery({
    queryKey: [...adminBookingsQueryKey, query] as const,
    queryFn: ({ signal }) => listAdminBookings(query, signal),
  });
}

export function useAdminUsers(query: ListUsersQuery = {}, enabled = true) {
  return useQuery({
    queryKey: [...adminUsersQueryKey, query] as const,
    queryFn: ({ signal }) => listAdminUsers(query, signal),
    enabled,
  });
}

export function useCreatePublicBooking() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (values: CreatePublicBookingBody) =>
      createPublicBooking(values),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: myBookingsQueryKey });
      void queryClient.invalidateQueries({ queryKey: occupancyQueryKey });
      void queryClient.invalidateQueries({ queryKey: adminBookingsQueryKey });
    },
    onError: (error) => {
      if (isApiValidationError(error)) return;
      toast.error(getUserFacingApiErrorMessage(error));
    },
  });
}

export function useCreateAdminBooking() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (values: CreateAdminBookingBody) => createAdminBooking(values),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: occupancyQueryKey });
      void queryClient.invalidateQueries({ queryKey: adminBookingsQueryKey });
    },
    onError: (error) => {
      if (isApiValidationError(error)) return;
      toast.error(getUserFacingApiErrorMessage(error));
    },
  });
}

export function usePatchAdminBooking() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: { id: string } & PatchBookingBody) =>
      patchAdminBooking(input.id, { status: input.status }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: adminBookingsQueryKey });
      void queryClient.invalidateQueries({ queryKey: occupancyQueryKey });
      void queryClient.invalidateQueries({ queryKey: myBookingsQueryKey });
    },
    onError: (error) => {
      toast.error(getUserFacingApiErrorMessage(error));
    },
  });
}
