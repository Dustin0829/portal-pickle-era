import api from "@/api/client";
import {
  activityLogDetailSchema,
  activityLogListItemSchema,
  type ListActivityLogsQuery,
} from "@/api/features/activity-logs/activity-logs.schema";
import { paginationMetaSchema } from "@/api/schema/primitives.schema";
import { z } from "zod";

export async function listActivityLogs(
  query: ListActivityLogsQuery,
  signal?: AbortSignal,
) {
  const response = await api.get("/admin/activity-logs", {
    params: query,
    signal,
  });
  const payload = response.data as { items: unknown };
  const items = z.array(activityLogListItemSchema).parse(payload.items);
  const metaRaw = (response as { meta?: unknown }).meta;
  const meta = metaRaw ? paginationMetaSchema.parse(metaRaw) : undefined;
  return { items, meta };
}

export async function getActivityLog(id: string, signal?: AbortSignal) {
  const { data } = await api.get(`/admin/activity-logs/${id}`, { signal });
  return activityLogDetailSchema.parse(data);
}
