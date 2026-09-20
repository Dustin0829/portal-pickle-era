import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  getFacilitySettings,
  patchFacilitySettings,
} from "@/api/features/facility-settings/facility-settings.service";
import type { PatchFacilitySettingsBody } from "@/api/features/facility-settings/facility-settings.schema";
import { isApiValidationError } from "@/api/lib/apply-field-errors-to-form";
import { getUserFacingApiErrorMessage } from "@/api/lib/api-error-message";

export const facilitySettingsQueryKey = ["facility-settings"] as const;

export function useFacilitySettings(enabled = true) {
  return useQuery({
    queryKey: facilitySettingsQueryKey,
    queryFn: ({ signal }) => getFacilitySettings(signal),
    enabled,
    staleTime: 60_000,
  });
}

export function usePatchFacilitySettings() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (values: PatchFacilitySettingsBody) =>
      patchFacilitySettings(values),
    onSuccess: (data) => {
      queryClient.setQueryData(facilitySettingsQueryKey, data);
      toast.success("Settings saved");
    },
    onError: (error) => {
      if (isApiValidationError(error)) return;
      toast.error(getUserFacingApiErrorMessage(error));
    },
  });
}
