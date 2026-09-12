import type { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import { z } from "zod";
import { standardErrorResponses, successResponseSchema } from "../../lib/openapi-helpers.js";
import { create{{Name}}BodySchema, {{camelName}}ParamsSchema } from "./{{name}}.schema.js";

const {{camelName}}Schema = z.object({
  id: z.string(),
  label: z.string().optional(),
});

export function register{{Name}}OpenApi(registry: OpenAPIRegistry) {
  registry.registerPath({
    method: "get",
    path: "{{route}}",
    tags: ["{{Name}}"],
    responses: {
      200: {
        description: "List {{name}}",
        content: {
          "application/json": {
            schema: successResponseSchema(z.object({ items: z.array({{camelName}}Schema) })),
          },
        },
      },
      ...standardErrorResponses,
    },
  });

  registry.registerPath({
    method: "get",
    path: "{{route}}/{id}",
    tags: ["{{Name}}"],
    request: { params: {{camelName}}ParamsSchema },
    responses: {
      200: {
        description: "Get {{name}} item",
        content: {
          "application/json": {
            schema: successResponseSchema({{camelName}}Schema),
          },
        },
      },
      ...standardErrorResponses,
    },
  });

  registry.registerPath({
    method: "post",
    path: "{{route}}",
    tags: ["{{Name}}"],
    request: {
      body: {
        content: {
          "application/json": {
            schema: create{{Name}}BodySchema,
          },
        },
      },
    },
    responses: {
      201: {
        description: "Create {{name}} item",
        content: {
          "application/json": {
            schema: successResponseSchema({{camelName}}Schema),
          },
        },
      },
      ...standardErrorResponses,
    },
  });
}
