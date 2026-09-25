import { Router } from "express";
import { asyncHandler } from "../../lib/api-response.js";
import { validateBody, validateParams, validateQuery } from "../../middleware/validate.js";
import { loadSession, requireSession } from "../auth/auth.middleware.js";
import {
  adminOpenPlayLiveSessionController,
  availableOpenPlayLiveCourtController,
  checkInOpenPlayLiveParticipantController,
  endAdminOpenPlayLiveGameController,
  endMyOpenPlayLiveGameController,
  leftOpenPlayLiveParticipantController,
  myOpenPlayLiveSessionController,
  noShowOpenPlayLiveParticipantController,
  patchAdminOpenPlayLiveSessionController,
  startOpenPlayLiveGameController,
  unavailableOpenPlayLiveCourtController,
} from "./open-play-live.controller.js";
import {
  openPlayLiveCourtParamsSchema,
  openPlayLiveGameParamsSchema,
  openPlayLiveParticipantParamsSchema,
  openPlayLiveSessionKeySchema,
  openPlayLiveSessionQuerySchema,
  patchOpenPlayLiveSessionBodySchema,
  startOpenPlayLiveGameBodySchema,
} from "./open-play-live.schema.js";

export const openPlayLiveMeRouter = Router();
export const openPlayLiveAdminRouter = Router();

openPlayLiveMeRouter.use(loadSession, requireSession);

openPlayLiveMeRouter.get(
  "/session",
  validateQuery(openPlayLiveSessionQuerySchema),
  asyncHandler(myOpenPlayLiveSessionController),
);
openPlayLiveMeRouter.post(
  "/games/:gameId/end",
  validateParams(openPlayLiveGameParamsSchema),
  asyncHandler(endMyOpenPlayLiveGameController),
);

openPlayLiveAdminRouter.get(
  "/session",
  validateQuery(openPlayLiveSessionQuerySchema),
  asyncHandler(adminOpenPlayLiveSessionController),
);
openPlayLiveAdminRouter.patch(
  "/session",
  validateBody(patchOpenPlayLiveSessionBodySchema),
  asyncHandler(patchAdminOpenPlayLiveSessionController),
);
openPlayLiveAdminRouter.post(
  "/participants/:id/check-in",
  validateParams(openPlayLiveParticipantParamsSchema),
  asyncHandler(checkInOpenPlayLiveParticipantController),
);
openPlayLiveAdminRouter.post(
  "/participants/:id/no-show",
  validateParams(openPlayLiveParticipantParamsSchema),
  asyncHandler(noShowOpenPlayLiveParticipantController),
);
openPlayLiveAdminRouter.post(
  "/participants/:id/left",
  validateParams(openPlayLiveParticipantParamsSchema),
  asyncHandler(leftOpenPlayLiveParticipantController),
);
openPlayLiveAdminRouter.post(
  "/courts/:courtId/unavailable",
  validateParams(openPlayLiveCourtParamsSchema),
  validateBody(openPlayLiveSessionKeySchema),
  asyncHandler(unavailableOpenPlayLiveCourtController),
);
openPlayLiveAdminRouter.post(
  "/courts/:courtId/available",
  validateParams(openPlayLiveCourtParamsSchema),
  validateBody(openPlayLiveSessionKeySchema),
  asyncHandler(availableOpenPlayLiveCourtController),
);
openPlayLiveAdminRouter.post(
  "/courts/:courtId/start",
  validateParams(openPlayLiveCourtParamsSchema),
  validateBody(startOpenPlayLiveGameBodySchema),
  asyncHandler(startOpenPlayLiveGameController),
);
openPlayLiveAdminRouter.post(
  "/games/:gameId/end",
  validateParams(openPlayLiveGameParamsSchema),
  asyncHandler(endAdminOpenPlayLiveGameController),
);
