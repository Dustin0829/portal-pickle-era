import { z } from "zod";
import { paginationMetaSchema } from "./pagination.schema.js";

export function successResponseSchema<T extends z.ZodTypeAny>(dataSchema: T) {
  return z.object({
    success: z.literal(true),
    message: z.string().optional(),
    data: dataSchema,
  });
}

export function paginatedSuccessResponseSchema<T extends z.ZodTypeAny>(dataSchema: T) {
  return successResponseSchema(dataSchema).extend({
    meta: paginationMetaSchema,
  });
}

export const errorResponseSchema = z.object({
  success: z.literal(false),
  message: z.string(),
  code: z.string().optional(),
  errors: z.unknown().optional(),
});

export const standardErrorResponses = {
  400: {
    description: "Bad request",
    content: {
      "application/json": {
        schema: errorResponseSchema,
      },
    },
  },
  404: {
    description: "Not found",
    content: {
      "application/json": {
        schema: errorResponseSchema,
      },
    },
  },
  422: {
    description: "Validation error",
    content: {
      "application/json": {
        schema: errorResponseSchema,
      },
    },
  },
  500: {
    description: "Internal server error",
    content: {
      "application/json": {
        schema: errorResponseSchema,
      },
    },
  },
};
