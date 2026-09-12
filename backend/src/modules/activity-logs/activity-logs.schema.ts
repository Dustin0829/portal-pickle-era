import { z } from "zod";
import { paginatedQuerySchema } from "../../lib/pagination.schema.js";

const ACTIVITY_LOG_MAX_RANGE_MS = 7 * 24 * 60 * 60 * 1000;

export const activityLogListItemSchema = z.object({
  id: z.string().uuid(),
  timestamp: z.string().datetime(),
  kind: z.enum(["http", "job"]),
  requestId: z.string().nullable(),
  durationMs: z.number().int().nullable(),
  truncated: z.boolean(),
  method: z.string().nullable(),
  path: z.string().nullable(),
  statusCode: z.number().int().nullable(),
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

export const activityLogParamsSchema = z.object({
  id: z.string().uuid(),
});

export const listActivityLogsQuerySchema = paginatedQuerySchema
  .extend({
    limit: z.coerce.number().int().positive().max(100).default(50),
    from: z.coerce.date(),
    to: z.coerce.date(),
    kind: z.enum(["http", "job"]).optional(),
    method: z.enum(["GET", "POST", "PUT", "PATCH", "DELETE", "HEAD"]).optional(),
    status_class: z.enum(["2xx", "3xx", "4xx", "5xx"]).optional(),
    path_contains: z.string().trim().min(1).optional(),
    user_id: z.string().uuid().optional(),
    queue: z.string().trim().min(1).optional(),
    job_name: z.string().trim().min(1).optional(),
    job_status: z.enum(["completed", "failed"]).optional(),
  })
  .superRefine((data, ctx) => {
    if (data.from.getTime() > data.to.getTime()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "from must be before to",
        path: ["from"],
      });
    }
    if (data.to.getTime() - data.from.getTime() > ACTIVITY_LOG_MAX_RANGE_MS) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Time range must be at most 7 days",
        path: ["to"],
      });
    }
  });

export type ActivityLogListItemDto = z.infer<typeof activityLogListItemSchema>;
export type ActivityLogDetailDto = z.infer<typeof activityLogDetailSchema>;
export type ListActivityLogsQuery = z.infer<typeof listActivityLogsQuerySchema>;
export type ActivityLogParams = z.infer<typeof activityLogParamsSchema>;
