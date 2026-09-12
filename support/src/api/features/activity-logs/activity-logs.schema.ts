import { z } from "zod";

export const activityLogKindSchema = z.enum(["http", "job"]);
export const activityLogListItemSchema = z.object({
  id: z.string().uuid(),
  timestamp: z.string(),
  kind: activityLogKindSchema,
  requestId: z.string().nullable(),
  durationMs: z.number().nullable(),
  truncated: z.boolean(),
  method: z.string().nullable(),
  path: z.string().nullable(),
  statusCode: z.number().nullable(),
  userId: z.string().nullable(),
  role: z.string().nullable(),
  remoteAddr: z.string().nullable(),
  userAgent: z.string().nullable(),
  queue: z.string().nullable(),
  jobName: z.string().nullable(),
  jobId: z.string().nullable(),
  jobStatus: z.enum(["completed", "failed"]).nullable(),
  error: z.string().nullable(),
});

export const activityLogDetailSchema = activityLogListItemSchema.extend({
  request: z.unknown().nullable(),
  response: z.unknown().nullable(),
  payload: z.unknown().nullable(),
});

export type ActivityLogKind = z.infer<typeof activityLogKindSchema>;
export type ActivityLogListItem = z.infer<typeof activityLogListItemSchema>;
export type ActivityLogDetail = z.infer<typeof activityLogDetailSchema>;

export type ListActivityLogsQuery = {
  page: number;
  limit: number;
  from: string;
  to: string;
  kind?: ActivityLogKind;
  method?: string;
  status_class?: string;
  path_contains?: string;
  queue?: string;
  job_name?: string;
  job_status?: string;
};
