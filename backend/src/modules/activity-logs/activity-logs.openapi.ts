import type { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import {
  errorResponseSchema,
  paginatedSuccessResponseSchema,
  standardErrorResponses,
  successResponseSchema,
} from "../../lib/openapi-helpers.js";
import { paginatedItemsSchema } from "../../lib/pagination.schema.js";
import {
  activityLogDetailSchema,
  activityLogListItemSchema,
  activityLogParamsSchema,
  listActivityLogsQuerySchema,
} from "./activity-logs.schema.js";

const adminAuthErrorResponses = {
  401: {
    description: "Unauthorized",
    content: {
      "application/json": {
        schema: errorResponseSchema,
      },
    },
  },
  503: {
    description: "Activity log store unavailable",
    content: {
      "application/json": {
        schema: errorResponseSchema,
      },
    },
  },
};

export function registerActivityLogsOpenApi(registry: OpenAPIRegistry) {
  registry.register("ActivityLogListItem", activityLogListItemSchema);
  registry.register("ActivityLogDetail", activityLogDetailSchema);

  registry.registerPath({
    method: "get",
    path: "/admin/activity-logs",
    operationId: "getAdminActivityLogs",
    tags: ["Activity logs"],
    request: {
      query: listActivityLogsQuerySchema,
    },
    responses: {
      200: {
        description: "Paginated activity logs (metadata only)",
        content: {
          "application/json": {
            schema: paginatedSuccessResponseSchema(paginatedItemsSchema(activityLogListItemSchema)),
          },
        },
      },
      ...adminAuthErrorResponses,
      ...standardErrorResponses,
    },
  });

  registry.registerPath({
    method: "get",
    path: "/admin/activity-logs/{id}",
    operationId: "getAdminActivityLog",
    tags: ["Activity logs"],
    request: {
      params: activityLogParamsSchema,
    },
    responses: {
      200: {
        description: "Activity log detail including bodies",
        content: {
          "application/json": {
            schema: successResponseSchema(activityLogDetailSchema),
          },
        },
      },
      ...adminAuthErrorResponses,
      ...standardErrorResponses,
    },
  });
}
