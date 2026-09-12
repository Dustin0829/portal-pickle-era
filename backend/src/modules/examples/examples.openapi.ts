import type { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import {
  paginatedSuccessResponseSchema,
  standardErrorResponses,
  successResponseSchema,
} from "../../lib/openapi-helpers.js";
import { paginatedItemsSchema } from "../../lib/pagination.schema.js";
import {
  createExampleBodySchema,
  exampleParamsSchema,
  exampleSchema,
  listExamplesQuerySchema,
} from "./examples.schema.js";

export function registerExamplesOpenApi(registry: OpenAPIRegistry) {
  registry.register("Example", exampleSchema);

  registry.registerPath({
    method: "get",
    path: "/examples",
    operationId: "getExamples",
    tags: ["Examples"],
    request: {
      query: listExamplesQuerySchema,
    },
    responses: {
      200: {
        description: "Paginated examples",
        content: {
          "application/json": {
            schema: paginatedSuccessResponseSchema(paginatedItemsSchema(exampleSchema)),
          },
        },
      },
      ...standardErrorResponses,
    },
  });

  registry.registerPath({
    method: "get",
    path: "/examples/{id}",
    operationId: "getExample",
    tags: ["Examples"],
    request: {
      params: exampleParamsSchema,
    },
    responses: {
      200: {
        description: "Example",
        content: {
          "application/json": {
            schema: successResponseSchema(exampleSchema),
          },
        },
      },
      ...standardErrorResponses,
    },
  });

  registry.registerPath({
    method: "post",
    path: "/examples",
    operationId: "postExamples",
    tags: ["Examples"],
    request: {
      body: {
        content: {
          "application/json": {
            schema: createExampleBodySchema,
          },
        },
      },
    },
    responses: {
      201: {
        description: "Created example",
        content: {
          "application/json": {
            schema: successResponseSchema(exampleSchema),
          },
        },
      },
      ...standardErrorResponses,
    },
  });
}
