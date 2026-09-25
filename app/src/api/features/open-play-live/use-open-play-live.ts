import {
  useMutation,
  useQuery,
  useQueryClient,
  type Query,
} from "@tanstack/react-query";
import { toast } from "sonner";
import {
  checkInOpenPlayLiveParticipant,
  endAdminOpenPlayLiveGame,
  endMyOpenPlayLiveGame,
  getAdminOpenPlayLiveBoard,
  getMyOpenPlayLiveBoard,
  markOpenPlayLiveParticipantLeft,
  markOpenPlayLiveParticipantNoShow,
  patchAdminOpenPlayLiveSession,
  setOpenPlayLiveCourtAvailable,
  setOpenPlayLiveCourtUnavailable,
  startOpenPlayLiveGame,
} from "@/api/features/open-play-live/open-play-live.service";
import type {
  OpenPlayLiveBoard,
  OpenPlayLiveSessionKey,
  PatchOpenPlayLiveSessionBody,
  StartOpenPlayLiveGameBody,
} from "@/api/features/open-play-live/open-play-live.schema";
import { getUserFacingApiErrorMessage } from "@/api/lib/api-error-message";

export const meOpenPlayLiveQueryKey = ["me-open-play-live"] as const;
export const adminOpenPlayLiveQueryKey = ["admin-open-play-live"] as const;

/** Live sessions rotate every few minutes — poll only while the session is live. */
const LIVE_POLL_MS = 5_000;

function liveRefetchInterval(
  query: Query<OpenPlayLiveBoard, Error>,
): number | false {
  return query.state.data?.session.status === "live" ? LIVE_POLL_MS : false;
}

export function useMeOpenPlayLiveBoard(
  query: OpenPlayLiveSessionKey,
  enabled = true,
) {
  return useQuery({
    queryKey: [...meOpenPlayLiveQueryKey, query] as const,
    queryFn: ({ signal }) => getMyOpenPlayLiveBoard(query, signal),
    enabled: enabled && Boolean(query.date && query.slotId),
    refetchInterval: liveRefetchInterval,
  });
}

export function useAdminOpenPlayLiveBoard(
  query: OpenPlayLiveSessionKey,
  enabled = true,
) {
  return useQuery({
    queryKey: [...adminOpenPlayLiveQueryKey, query] as const,
    queryFn: ({ signal }) => getAdminOpenPlayLiveBoard(query, signal),
    enabled: enabled && Boolean(query.date && query.slotId),
    refetchInterval: liveRefetchInterval,
  });
}

function useOpenPlayLiveMutation<TVariables>(
  mutationFn: (variables: TVariables) => Promise<OpenPlayLiveBoard>,
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: meOpenPlayLiveQueryKey });
      void queryClient.invalidateQueries({
        queryKey: adminOpenPlayLiveQueryKey,
      });
    },
    onError: (error) => {
      toast.error(getUserFacingApiErrorMessage(error));
    },
  });
}

export function useEndMyOpenPlayLiveGame() {
  return useOpenPlayLiveMutation((gameId: string) =>
    endMyOpenPlayLiveGame(gameId),
  );
}

export function usePatchAdminOpenPlayLiveSession() {
  return useOpenPlayLiveMutation((values: PatchOpenPlayLiveSessionBody) =>
    patchAdminOpenPlayLiveSession(values),
  );
}

export function useCheckInOpenPlayLiveParticipant() {
  return useOpenPlayLiveMutation((participantId: string) =>
    checkInOpenPlayLiveParticipant(participantId),
  );
}

export function useMarkOpenPlayLiveParticipantNoShow() {
  return useOpenPlayLiveMutation((participantId: string) =>
    markOpenPlayLiveParticipantNoShow(participantId),
  );
}

export function useMarkOpenPlayLiveParticipantLeft() {
  return useOpenPlayLiveMutation((participantId: string) =>
    markOpenPlayLiveParticipantLeft(participantId),
  );
}

export function useSetOpenPlayLiveCourtUnavailable() {
  return useOpenPlayLiveMutation(
    (input: { courtId: string } & OpenPlayLiveSessionKey) =>
      setOpenPlayLiveCourtUnavailable(input.courtId, {
        date: input.date,
        slotId: input.slotId,
      }),
  );
}

export function useSetOpenPlayLiveCourtAvailable() {
  return useOpenPlayLiveMutation(
    (input: { courtId: string } & OpenPlayLiveSessionKey) =>
      setOpenPlayLiveCourtAvailable(input.courtId, {
        date: input.date,
        slotId: input.slotId,
      }),
  );
}

export function useStartOpenPlayLiveGame() {
  return useOpenPlayLiveMutation(
    (input: { courtId: string } & StartOpenPlayLiveGameBody) =>
      startOpenPlayLiveGame(input.courtId, {
        date: input.date,
        slotId: input.slotId,
        participantIds: input.participantIds,
      }),
  );
}

export function useEndAdminOpenPlayLiveGame() {
  return useOpenPlayLiveMutation((gameId: string) =>
    endAdminOpenPlayLiveGame(gameId),
  );
}
