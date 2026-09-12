import { getActivityLog, listActivityLogs } from "../../lib/activity-logs/query.js";
import { toActivityLogDetailDto, toActivityLogListItemDto } from "./activity-logs.mapper.js";
import type { ListActivityLogsQuery } from "./activity-logs.schema.js";

export async function listAdminActivityLogs(query: ListActivityLogsQuery) {
  const result = await listActivityLogs(query);
  return {
    items: result.items.map(toActivityLogListItemDto),
    meta: result.meta,
  };
}

export async function getAdminActivityLog(id: string) {
  const record = await getActivityLog(id);
  return toActivityLogDetailDto(record);
}
