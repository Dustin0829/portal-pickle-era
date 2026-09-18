import type { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import {
  paginatedSuccessResponseSchema,
  standardErrorResponses,
  successResponseSchema,
} from "../../lib/openapi-helpers.js";
import { paginatedItemsSchema } from "../../lib/pagination.schema.js";
import { userDtoSchema } from "../auth/auth.schema.js";
import {
  bookingDtoSchema,
  bookingIdParamsSchema,
  bookingOccupancyItemSchema,
  bookingReceiptUrlResponseSchema,
  createAdminBookingBodySchema,
  createPublicBookingBodySchema,
  listBookingsQuerySchema,
  listUsersQuerySchema,
  occupancyQuerySchema,
  openPlaySessionItemSchema,
  openPlaySessionsQuerySchema,
  patchBookingBodySchema,
  patchBookingResponseSchema,
} from "./bookings.schema.js";
import { z } from "zod";

export function registerBookingsOpenApi(registry: OpenAPIRegistry) {
  registry.register("Booking", bookingDtoSchema);
  registry.register("BookingOccupancyItem", bookingOccupancyItemSchema);
  registry.register("OpenPlaySessionItem", openPlaySessionItemSchema);
  registry.register("BookingReceiptUrl", bookingReceiptUrlResponseSchema);
  registry.register("PatchBookingResponse", patchBookingResponseSchema);

  registry.registerPath({
    method: "post",
    path: "/bookings",
    operationId: "postBookings",
    tags: ["Bookings"],
    request: {
      body: {
        content: { "application/json": { schema: createPublicBookingBodySchema } },
      },
    },
    responses: {
      201: {
        description: "Created pending booking",
        content: { "application/json": { schema: successResponseSchema(bookingDtoSchema) } },
      },
      ...standardErrorResponses,
    },
  });

  registry.registerPath({
    method: "get",
    path: "/bookings/occupancy",
    operationId: "getBookingsOccupancy",
    tags: ["Bookings"],
    request: { query: occupancyQuerySchema },
    responses: {
      200: {
        description: "Day occupancy blocks",
        content: {
          "application/json": {
            schema: successResponseSchema(z.object({ items: z.array(bookingOccupancyItemSchema) })),
          },
        },
      },
      ...standardErrorResponses,
    },
  });

  registry.registerPath({
    method: "get",
    path: "/bookings/open-play-sessions",
    operationId: "getOpenPlaySessions",
    tags: ["Bookings"],
    request: { query: openPlaySessionsQuerySchema },
    responses: {
      200: {
        description: "Open Play session seat counts for a date",
        content: {
          "application/json": {
            schema: successResponseSchema(z.object({ items: z.array(openPlaySessionItemSchema) })),
          },
        },
      },
      ...standardErrorResponses,
    },
  });

  registry.registerPath({
    method: "get",
    path: "/me/bookings",
    operationId: "getMeBookings",
    tags: ["Bookings"],
    responses: {
      200: {
        description: "Current user bookings",
        content: {
          "application/json": {
            schema: successResponseSchema(z.object({ items: z.array(bookingDtoSchema) })),
          },
        },
      },
      ...standardErrorResponses,
    },
  });

  registry.registerPath({
    method: "get",
    path: "/admin/bookings",
    operationId: "getAdminBookings",
    tags: ["Bookings"],
    request: { query: listBookingsQuerySchema },
    responses: {
      200: {
        description: "Paginated bookings",
        content: {
          "application/json": {
            schema: paginatedSuccessResponseSchema(paginatedItemsSchema(bookingDtoSchema)),
          },
        },
      },
      ...standardErrorResponses,
    },
  });

  registry.registerPath({
    method: "post",
    path: "/admin/bookings",
    operationId: "postAdminBookings",
    tags: ["Bookings"],
    request: {
      body: {
        content: { "application/json": { schema: createAdminBookingBodySchema } },
      },
    },
    responses: {
      201: {
        description: "Created approved walk-in booking",
        content: { "application/json": { schema: successResponseSchema(bookingDtoSchema) } },
      },
      ...standardErrorResponses,
    },
  });

  registry.registerPath({
    method: "patch",
    path: "/admin/bookings/{id}",
    operationId: "patchAdminBooking",
    tags: ["Bookings"],
    request: {
      params: bookingIdParamsSchema,
      body: {
        content: { "application/json": { schema: patchBookingBodySchema } },
      },
    },
    responses: {
      200: {
        description:
          "Updated booking status (optional inviteEmailWarning when email skipped/failed)",
        content: {
          "application/json": { schema: successResponseSchema(patchBookingResponseSchema) },
        },
      },
      ...standardErrorResponses,
    },
  });

  registry.registerPath({
    method: "get",
    path: "/admin/bookings/{id}/receipt-url",
    operationId: "getAdminBookingReceiptUrl",
    tags: ["Bookings"],
    request: {
      params: bookingIdParamsSchema,
    },
    responses: {
      200: {
        description: "Short-lived presigned GET URL for the booking receipt",
        content: {
          "application/json": {
            schema: successResponseSchema(bookingReceiptUrlResponseSchema),
          },
        },
      },
      ...standardErrorResponses,
    },
  });

  registry.registerPath({
    method: "get",
    path: "/admin/users",
    operationId: "getAdminUsers",
    tags: ["Users"],
    request: { query: listUsersQuerySchema },
    responses: {
      200: {
        description: "Paginated users",
        content: {
          "application/json": {
            schema: paginatedSuccessResponseSchema(paginatedItemsSchema(userDtoSchema)),
          },
        },
      },
      ...standardErrorResponses,
    },
  });
}
