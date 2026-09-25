import type { Request, Response } from "express";
import { sendSuccess } from "../../lib/api-response.js";
import type {
  OpenPlayLiveSessionQuery,
  PatchOpenPlayLiveSessionBody,
  StartOpenPlayLiveGameBody,
} from "./open-play-live.schema.js";
import {
  checkInParticipant,
  endOpenPlayLiveGame,
  getMyOpenPlayLiveBoard,
  getOpenPlayLiveBoard,
  markParticipantLeftSession,
  markParticipantNoShow,
  patchOpenPlayLiveSessionStatus,
  setCourtAvailable,
  setCourtUnavailable,
  startOpenPlayLiveGame,
} from "./open-play-live.service.js";

export async function myOpenPlayLiveSessionController(req: Request, res: Response) {
  const board = await getMyOpenPlayLiveBoard(
    req.query as unknown as OpenPlayLiveSessionQuery,
    req.authUser,
  );
  return sendSuccess(res, board, "ok", 200);
}

export async function endMyOpenPlayLiveGameController(req: Request, res: Response) {
  const board = await endOpenPlayLiveGame(req.params.gameId as string, {
    role: "player",
    authUser: req.authUser,
  });
  return sendSuccess(res, board, "ok", 200);
}

export async function adminOpenPlayLiveSessionController(req: Request, res: Response) {
  const board = await getOpenPlayLiveBoard(req.query as unknown as OpenPlayLiveSessionQuery);
  return sendSuccess(res, board, "ok", 200);
}

export async function patchAdminOpenPlayLiveSessionController(req: Request, res: Response) {
  const board = await patchOpenPlayLiveSessionStatus(req.body as PatchOpenPlayLiveSessionBody);
  return sendSuccess(res, board, "ok", 200);
}

export async function checkInOpenPlayLiveParticipantController(req: Request, res: Response) {
  const board = await checkInParticipant(req.params.id as string);
  return sendSuccess(res, board, "ok", 200);
}

export async function noShowOpenPlayLiveParticipantController(req: Request, res: Response) {
  const board = await markParticipantNoShow(req.params.id as string);
  return sendSuccess(res, board, "ok", 200);
}

export async function leftOpenPlayLiveParticipantController(req: Request, res: Response) {
  const board = await markParticipantLeftSession(req.params.id as string);
  return sendSuccess(res, board, "ok", 200);
}

export async function unavailableOpenPlayLiveCourtController(req: Request, res: Response) {
  const board = await setCourtUnavailable(
    req.body as OpenPlayLiveSessionQuery,
    req.params.courtId as string,
  );
  return sendSuccess(res, board, "ok", 200);
}

export async function availableOpenPlayLiveCourtController(req: Request, res: Response) {
  const board = await setCourtAvailable(
    req.body as OpenPlayLiveSessionQuery,
    req.params.courtId as string,
  );
  return sendSuccess(res, board, "ok", 200);
}

export async function startOpenPlayLiveGameController(req: Request, res: Response) {
  const board = await startOpenPlayLiveGame(
    req.params.courtId as string,
    req.body as StartOpenPlayLiveGameBody,
  );
  return sendSuccess(res, board, "ok", 201);
}

export async function endAdminOpenPlayLiveGameController(req: Request, res: Response) {
  const board = await endOpenPlayLiveGame(req.params.gameId as string, {
    role: "staff",
    authUser: req.authUser,
  });
  return sendSuccess(res, board, "ok", 200);
}
