import { toast } from "sonner";
import { handleApiMutationError } from "@/api/lib/api-error-message";
import type { FieldValues, Path, UseFormSetError } from "react-hook-form";

/** Wire TanStack mutation `onError` to RHF `setError` + toast for non-validation failures. */
export function mapMutationErrorToForm<TFieldValues extends FieldValues>(
  setError: UseFormSetError<TFieldValues>,
) {
  return (error: unknown) => {
    handleApiMutationError(error, {
      setError: (name, fieldError) => {
        setError(name as Path<TFieldValues>, fieldError);
      },
      toastError: toast.error,
    });
  };
}
