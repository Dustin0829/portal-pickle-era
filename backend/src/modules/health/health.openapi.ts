import type { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import { z } from "zod";
import { standardErrorResponses, successResponseSchema } from "../../lib/openapi-helpers.js";

const healthResponseSchema = z.object({
  status: z.literal("ok"),
});

const dbHealthResponseSchema = z.object({
  postgres: z.literal("ok"),
  redis: z.string(),
});

export function registerHealthOpenApi(registry: OpenAPIRegistry) {
  registry.registerPath({
    method: "get",
    path: "/health",
    operationId: "getHealth",
    tags: ["Health"],
    responses: {
      200: {
        description: "Health check",
        content: {
          "application/json": {
            schema: successResponseSchema(healthResponseSchema),
          },
        },
      },
    },
  });

  registry.registerPath({
    method: "get",
    path: "/health/db",
    operationId: "getHealthDb",
    tags: ["Health"],
    responses: {
      200: {
        description: "Database readiness check",
        content: {
          "application/json": {
            schema: successResponseSchema(dbHealthResponseSchema),
          },
        },
      },
      ...standardErrorResponses,
    },
  });
}
