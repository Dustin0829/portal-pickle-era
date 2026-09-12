import type { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import { standardErrorResponses, successResponseSchema } from "../../lib/openapi-helpers.js";
import { presignUploadBodySchema, presignUploadResponseSchema } from "./uploads.schema.js";

export function registerUploadsOpenApi(registry: OpenAPIRegistry) {
  registry.registerPath({
    method: "post",
    path: "/uploads/presign",
    operationId: "postUploadsPresign",
    tags: ["Uploads"],
    request: {
      body: {
        content: {
          "application/json": {
            schema: presignUploadBodySchema,
          },
        },
      },
    },
    responses: {
      200: {
        description: "Presigned R2 upload URL",
        content: {
          "application/json": {
            schema: successResponseSchema(presignUploadResponseSchema),
          },
        },
      },
      ...standardErrorResponses,
    },
  });
}
