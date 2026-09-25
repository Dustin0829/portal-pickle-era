import { Router } from "express";
import { protectAdminTools, shouldMountAdminTools } from "../middleware/adminBasicAuth.js";
import { protectProductAdmin } from "../middleware/protectProductAdmin.js";
import { activityLogsRouter } from "../modules/activity-logs/activity-logs.routes.js";
import { authRouter } from "../modules/auth/auth.routes.js";
import {
  bookingsAdminRouter,
  bookingsMeRouter,
  bookingsPublicRouter,
  usersAdminRouter,
} from "../modules/bookings/bookings.routes.js";
import { examplesRouter } from "../modules/examples/examples.routes.js";
import {
  openPlayLiveAdminRouter,
  openPlayLiveMeRouter,
} from "../modules/open-play-live/open-play-live.routes.js";
import { healthRouter } from "../modules/health/health.routes.js";
import { uploadsRouter } from "../modules/uploads/uploads.routes.js";
import { waitlistAdminRouter, waitlistPublicRouter } from "../modules/waitlist/waitlist.routes.js";
import { foodAdminRouter, foodMeRouter } from "../modules/food/food.routes.js";
import {
  facilitySettingsAdminRouter,
  facilitySettingsPublicRouter,
} from "../modules/facility-settings/facility-settings.routes.js";
import { walletAdminRouter, walletMeRouter } from "../modules/wallet/wallet.routes.js";

export function createApiRouter() {
  const apiRouter = Router();

  apiRouter.use("/health", healthRouter);
  apiRouter.use("/examples", examplesRouter);
  apiRouter.use("/uploads", uploadsRouter);
  apiRouter.use("/waitlist", waitlistPublicRouter);
  apiRouter.use("/facility-settings", facilitySettingsPublicRouter);
  apiRouter.use("/auth", authRouter);
  apiRouter.use("/bookings", bookingsPublicRouter);
  apiRouter.use("/me/bookings", bookingsMeRouter);
  apiRouter.use("/me/wallet", walletMeRouter);
  apiRouter.use("/me/food", foodMeRouter);
  apiRouter.use("/me/open-play", openPlayLiveMeRouter);

  if (shouldMountAdminTools()) {
    apiRouter.use("/admin/activity-logs", protectAdminTools, activityLogsRouter);
    apiRouter.use("/admin/waitlist", protectProductAdmin, waitlistAdminRouter);
    apiRouter.use("/admin/bookings", protectProductAdmin, bookingsAdminRouter);
    apiRouter.use("/admin/users", protectProductAdmin, usersAdminRouter);
    apiRouter.use("/admin/wallet", protectProductAdmin, walletAdminRouter);
    apiRouter.use("/admin/food", protectProductAdmin, foodAdminRouter);
    apiRouter.use("/admin/facility-settings", protectProductAdmin, facilitySettingsAdminRouter);
    apiRouter.use("/admin/open-play", protectProductAdmin, openPlayLiveAdminRouter);
  }

  return apiRouter;
}
