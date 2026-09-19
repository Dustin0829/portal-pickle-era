import type { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import { standardErrorResponses, successResponseSchema } from "../../lib/openapi-helpers.js";
import {
  createFoodMenuItemBodySchema,
  createFoodOrderBodySchema,
  foodMenuItemDtoSchema,
  foodOrderDtoSchema,
  listAdminFoodOrdersQuerySchema,
  patchFoodMenuItemBodySchema,
  patchFoodOrderBodySchema,
} from "./food.schema.js";
import { z } from "zod";

export function registerFoodOpenApi(registry: OpenAPIRegistry) {
  registry.register("FoodMenuItem", foodMenuItemDtoSchema);
  registry.register("FoodOrder", foodOrderDtoSchema);

  registry.registerPath({
    method: "get",
    path: "/me/food/menu",
    operationId: "getMeFoodMenu",
    tags: ["Food"],
    responses: {
      200: {
        description: "Available menu",
        content: {
          "application/json": {
            schema: successResponseSchema(z.array(foodMenuItemDtoSchema)),
          },
        },
      },
      ...standardErrorResponses,
    },
  });

  registry.registerPath({
    method: "post",
    path: "/me/food/orders",
    operationId: "postMeFoodOrder",
    tags: ["Food"],
    request: {
      body: { content: { "application/json": { schema: createFoodOrderBodySchema } } },
    },
    responses: {
      201: {
        description: "Created order",
        content: { "application/json": { schema: successResponseSchema(foodOrderDtoSchema) } },
      },
      ...standardErrorResponses,
    },
  });

  registry.registerPath({
    method: "get",
    path: "/admin/food/menu",
    operationId: "getAdminFoodMenu",
    tags: ["Food"],
    responses: {
      200: {
        description: "All menu items",
        content: {
          "application/json": {
            schema: successResponseSchema(z.array(foodMenuItemDtoSchema)),
          },
        },
      },
      ...standardErrorResponses,
    },
  });

  registry.registerPath({
    method: "post",
    path: "/admin/food/menu",
    operationId: "postAdminFoodMenu",
    tags: ["Food"],
    request: {
      body: { content: { "application/json": { schema: createFoodMenuItemBodySchema } } },
    },
    responses: {
      201: {
        description: "Created menu item",
        content: {
          "application/json": { schema: successResponseSchema(foodMenuItemDtoSchema) },
        },
      },
      ...standardErrorResponses,
    },
  });

  registry.registerPath({
    method: "patch",
    path: "/admin/food/menu/{id}",
    operationId: "patchAdminFoodMenu",
    tags: ["Food"],
    request: {
      params: z.object({ id: z.string() }),
      body: { content: { "application/json": { schema: patchFoodMenuItemBodySchema } } },
    },
    responses: {
      200: {
        description: "Updated menu item",
        content: {
          "application/json": { schema: successResponseSchema(foodMenuItemDtoSchema) },
        },
      },
      ...standardErrorResponses,
    },
  });

  registry.registerPath({
    method: "get",
    path: "/admin/food/orders",
    operationId: "getAdminFoodOrders",
    tags: ["Food"],
    request: { query: listAdminFoodOrdersQuerySchema },
    responses: {
      200: {
        description: "Food orders",
        content: {
          "application/json": {
            schema: successResponseSchema(
              z.object({
                items: z.array(foodOrderDtoSchema),
                meta: z.object({
                  page: z.number(),
                  limit: z.number(),
                  total: z.number(),
                  totalPages: z.number(),
                }),
              }),
            ),
          },
        },
      },
      ...standardErrorResponses,
    },
  });

  registry.registerPath({
    method: "patch",
    path: "/admin/food/orders/{id}",
    operationId: "patchAdminFoodOrder",
    tags: ["Food"],
    request: {
      params: z.object({ id: z.string() }),
      body: { content: { "application/json": { schema: patchFoodOrderBodySchema } } },
    },
    responses: {
      200: {
        description: "Updated order",
        content: { "application/json": { schema: successResponseSchema(foodOrderDtoSchema) } },
      },
      ...standardErrorResponses,
    },
  });
}
