import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  createWaitlistEntry,
  listAdminWaitlist,
} from "@/api/features/waitlist/waitlist.service";
import type { CreateWaitlistFormValues } from "@/api/features/waitlist/waitlist.schema";
import { isApiValidationError } from "@/api/lib/apply-field-errors-to-form";
import { getUserFacingApiErrorMessage } from "@/api/lib/api-error-message";

export const adminWaitlistQueryKey = ["admin-waitlist"] as const;

export function useAdminWaitlistList(search: string) {
  return useQuery({
    queryKey: [...adminWaitlistQueryKey, search] as const,
    queryFn: ({ signal }) => listAdminWaitlist(signal, search),
  });
}

export function useCreateWaitlistEntry() {
  const queryClient = useQueryClient();
  const { mutateAsync, isPending, isError, isSuccess } = useMutation({
    mutationFn: (values: CreateWaitlistFormValues) =>
      createWaitlistEntry(values),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: adminWaitlistQueryKey });
    },
    onError: (error) => {
      if (isApiValidationError(error)) return;
      toast.error(getUserFacingApiErrorMessage(error));
    },
  });

  return {
    createWaitlistEntry: mutateAsync,
    isCreatingWaitlist: isPending,
    createSucceeded: isSuccess && !isError,
  };
}
