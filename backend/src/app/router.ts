import { Router } from "express";
import { protectAdminTools, shouldMountAdminTools } from "../middleware/adminBasicAuth.js";
import { activityLogsRouter } from "../modules/activity-logs/activity-logs.routes.js";
import { examplesRouter } from "../modules/examples/examples.routes.js";
import { healthRouter } from "../modules/health/health.routes.js";
import { uploadsRouter } from "../modules/uploads/uploads.routes.js";
import { waitlistAdminRouter, waitlistPublicRouter } from "../modules/waitlist/waitlist.routes.js";

export function createApiRouter() {
  const apiRouter = Router();

  apiRouter.use("/health", healthRouter);
  apiRouter.use("/examples", examplesRouter);
  apiRouter.use("/uploads", uploadsRouter);
  apiRouter.use("/waitlist", waitlistPublicRouter);

  if (shouldMountAdminTools()) {
    apiRouter.use("/admin/activity-logs", protectAdminTools, activityLogsRouter);
    apiRouter.use("/admin/waitlist", protectAdminTools, waitlistAdminRouter);
  }

  return apiRouter;
}
