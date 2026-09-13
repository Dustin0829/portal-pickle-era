import type { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import {
  paginatedSuccessResponseSchema,
  standardErrorResponses,
  successResponseSchema,
} from "../../lib/openapi-helpers.js";
import { paginatedItemsSchema } from "../../lib/pagination.schema.js";
import {
  createWaitlistBodySchema,
  listWaitlistQuerySchema,
  waitlistEntrySchema,
} from "./waitlist.schema.js";

export function registerWaitlistOpenApi(registry: OpenAPIRegistry) {
  registry.register("WaitlistEntry", waitlistEntrySchema);

  registry.registerPath({
    method: "post",
    path: "/waitlist",
    operationId: "postWaitlist",
    tags: ["Waitlist"],
    request: {
      body: {
        content: {
          "application/json": {
            schema: createWaitlistBodySchema,
          },
        },
      },
    },
    responses: {
      200: {
        description: "Upserted waitlist entry",
        content: {
          "application/json": {
            schema: successResponseSchema(waitlistEntrySchema),
          },
        },
      },
      ...standardErrorResponses,
    },
  });

  registry.registerPath({
    method: "get",
    path: "/admin/waitlist",
    operationId: "getAdminWaitlist",
    tags: ["Waitlist"],
    request: {
      query: listWaitlistQuerySchema,
    },
    responses: {
      200: {
        description: "Paginated waitlist entries",
        content: {
          "application/json": {
            schema: paginatedSuccessResponseSchema(paginatedItemsSchema(waitlistEntrySchema)),
          },
        },
      },
      ...standardErrorResponses,
    },
  });
}
