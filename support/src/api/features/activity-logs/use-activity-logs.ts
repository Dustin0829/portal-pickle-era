import { useQuery } from "@tanstack/react-query";
import {
  getActivityLog,
  listActivityLogs,
} from "@/api/features/activity-logs/activity-logs.service";
import type { ListActivityLogsQuery } from "@/api/features/activity-logs/activity-logs.schema";

export const activityLogsQueryKey = ["activity-logs"] as const;

export function useActivityLogsList(
  query: ListActivityLogsQuery,
  refetchInterval?: number,
) {
  return useQuery({
    queryKey: [...activityLogsQueryKey, query],
    queryFn: ({ signal }) => listActivityLogs(query, signal),
    refetchInterval,
  });
}

export function useActivityLogDetail(id: string | null) {
  return useQuery({
    queryKey: [...activityLogsQueryKey, "detail", id],
    queryFn: ({ signal }) => getActivityLog(id!, signal),
    enabled: Boolean(id),
  });
}
