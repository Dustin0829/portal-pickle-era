import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  createExample,
  listExamples,
} from "@/api/features/examples/examples.service";
import type { CreateExampleFormValues } from "@/api/features/examples/examples.schema";
import { isApiValidationError } from "@/api/lib/apply-field-errors-to-form";
import { getUserFacingApiErrorMessage } from "@/api/lib/api-error-message";

export const examplesQueryKey = ["examples"] as const;

export function useExamplesList() {
  return useQuery({
    queryKey: examplesQueryKey,
    queryFn: ({ signal }) => listExamples(signal),
  });
}

export function useCreateExample() {
  const queryClient = useQueryClient();
  const { mutate, isPending, isError, isSuccess } = useMutation({
    mutationFn: (values: CreateExampleFormValues) => createExample(values),
    onSuccess: (example) => {
      void queryClient.invalidateQueries({ queryKey: examplesQueryKey });
      toast.success("Example created", {
        description: example.label ?? example.id,
      });
    },
    onError: (error) => {
      if (isApiValidationError(error)) return;
      toast.error(getUserFacingApiErrorMessage(error));
    },
  });

  return {
    createExample: mutate,
    isCreatingExample: isPending,
    createSucceeded: isSuccess && !isError,
  };
}
