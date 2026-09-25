import api from "@/api/client";
import {
  openPlayLiveBoardSchema,
  openPlayLiveSessionKeySchema,
  patchOpenPlayLiveSessionBodySchema,
  startOpenPlayLiveGameBodySchema,
  type OpenPlayLiveSessionKey,
  type PatchOpenPlayLiveSessionBody,
  type StartOpenPlayLiveGameBody,
} from "@/api/features/open-play-live/open-play-live.schema";

export async function getMyOpenPlayLiveBoard(
  query: OpenPlayLiveSessionKey,
  signal?: AbortSignal,
) {
  const params = openPlayLiveSessionKeySchema.parse(query);
  const { data } = await api.get("/me/open-play/session", { params, signal });
  return openPlayLiveBoardSchema.parse(data);
}

export async function endMyOpenPlayLiveGame(gameId: string) {
  const { data } = await api.post(`/me/open-play/games/${gameId}/end`);
  return openPlayLiveBoardSchema.parse(data);
}

export async function getAdminOpenPlayLiveBoard(
  query: OpenPlayLiveSessionKey,
  signal?: AbortSignal,
) {
  const params = openPlayLiveSessionKeySchema.parse(query);
  const { data } = await api.get("/admin/open-play/session", {
    params,
    signal,
  });
  return openPlayLiveBoardSchema.parse(data);
}

export async function patchAdminOpenPlayLiveSession(
  input: PatchOpenPlayLiveSessionBody,
) {
  const body = patchOpenPlayLiveSessionBodySchema.parse(input);
  const { data } = await api.patch("/admin/open-play/session", body);
  return openPlayLiveBoardSchema.parse(data);
}

export async function checkInOpenPlayLiveParticipant(participantId: string) {
  const { data } = await api.post(
    `/admin/open-play/participants/${participantId}/check-in`,
  );
  return openPlayLiveBoardSchema.parse(data);
}

export async function markOpenPlayLiveParticipantNoShow(participantId: string) {
  const { data } = await api.post(
    `/admin/open-play/participants/${participantId}/no-show`,
  );
  return openPlayLiveBoardSchema.parse(data);
}

export async function markOpenPlayLiveParticipantLeft(participantId: string) {
  const { data } = await api.post(
    `/admin/open-play/participants/${participantId}/left`,
  );
  return openPlayLiveBoardSchema.parse(data);
}

export async function setOpenPlayLiveCourtUnavailable(
  courtId: string,
  key: OpenPlayLiveSessionKey,
) {
  const body = openPlayLiveSessionKeySchema.parse(key);
  const { data } = await api.post(
    `/admin/open-play/courts/${courtId}/unavailable`,
    body,
  );
  return openPlayLiveBoardSchema.parse(data);
}

export async function setOpenPlayLiveCourtAvailable(
  courtId: string,
  key: OpenPlayLiveSessionKey,
) {
  const body = openPlayLiveSessionKeySchema.parse(key);
  const { data } = await api.post(
    `/admin/open-play/courts/${courtId}/available`,
    body,
  );
  return openPlayLiveBoardSchema.parse(data);
}

export async function startOpenPlayLiveGame(
  courtId: string,
  input: StartOpenPlayLiveGameBody,
) {
  const body = startOpenPlayLiveGameBodySchema.parse(input);
  const { data } = await api.post(
    `/admin/open-play/courts/${courtId}/start`,
    body,
  );
  return openPlayLiveBoardSchema.parse(data);
}

export async function endAdminOpenPlayLiveGame(gameId: string) {
  const { data } = await api.post(`/admin/open-play/games/${gameId}/end`);
  return openPlayLiveBoardSchema.parse(data);
}
