import { Router } from "express";
import { asyncHandler } from "../../lib/api-response.js";
import { validateBody, validateParams, validateQuery } from "../../middleware/validate.js";
import { loadSession, requireSession } from "../auth/auth.middleware.js";
import {
  createAdminBookingController,
  createPublicBookingController,
  bookingReceiptUrlController,
  listAdminBookingsController,
  listAdminUsersController,
  adminOpenPlayFifoBoardController,
  myBookingReceiptUrlController,
  myBookingsController,
  myOpenPlayFifoBoardController,
  myOpenPlayFifoPositionController,
  occupancyController,
  openPlaySessionsController,
  patchBookingController,
} from "./bookings.controller.js";
import {
  bookingIdParamsSchema,
  createAdminBookingBodySchema,
  createPublicBookingBodySchema,
  listBookingsQuerySchema,
  listUsersQuerySchema,
  occupancyQuerySchema,
  openPlayFifoQueueQuerySchema,
  openPlaySessionsQuerySchema,
  patchBookingBodySchema,
} from "./bookings.schema.js";

export const bookingsPublicRouter = Router();
export const bookingsMeRouter = Router();
export const bookingsAdminRouter = Router();
export const usersAdminRouter = Router();

bookingsPublicRouter.use(loadSession);

bookingsPublicRouter.post(
  "/",
  validateBody(createPublicBookingBodySchema),
  asyncHandler(createPublicBookingController),
);

bookingsPublicRouter.get(
  "/occupancy",
  validateQuery(occupancyQuerySchema),
  asyncHandler(occupancyController),
);

bookingsPublicRouter.get(
  "/open-play-sessions",
  validateQuery(openPlaySessionsQuerySchema),
  asyncHandler(openPlaySessionsController),
);

bookingsMeRouter.use(loadSession, requireSession);
bookingsMeRouter.get("/", asyncHandler(myBookingsController));
bookingsMeRouter.get(
  "/open-play-queue",
  validateQuery(openPlayFifoQueueQuerySchema),
  asyncHandler(myOpenPlayFifoPositionController),
);
bookingsMeRouter.get(
  "/open-play-board",
  validateQuery(openPlayFifoQueueQuerySchema),
  asyncHandler(myOpenPlayFifoBoardController),
);
bookingsMeRouter.get(
  "/:id/receipt-url",
  validateParams(bookingIdParamsSchema),
  asyncHandler(myBookingReceiptUrlController),
);

bookingsAdminRouter.get(
  "/",
  validateQuery(listBookingsQuerySchema),
  asyncHandler(listAdminBookingsController),
);
bookingsAdminRouter.get(
  "/open-play-queue",
  validateQuery(openPlayFifoQueueQuerySchema),
  asyncHandler(adminOpenPlayFifoBoardController),
);
bookingsAdminRouter.post(
  "/",
  validateBody(createAdminBookingBodySchema),
  asyncHandler(createAdminBookingController),
);
bookingsAdminRouter.get(
  "/:id/receipt-url",
  validateParams(bookingIdParamsSchema),
  asyncHandler(bookingReceiptUrlController),
);
bookingsAdminRouter.patch(
  "/:id",
  validateParams(bookingIdParamsSchema),
  validateBody(patchBookingBodySchema),
  asyncHandler(patchBookingController),
);

usersAdminRouter.get(
  "/",
  validateQuery(listUsersQuerySchema),
  asyncHandler(listAdminUsersController),
);
