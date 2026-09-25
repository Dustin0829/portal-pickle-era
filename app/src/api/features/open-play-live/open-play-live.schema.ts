import { z } from "zod";

export const openPlayLiveSessionStatusSchema = z.enum([
  "upcoming",
  "live",
  "completed",
  "cancelled",
]);
export const openPlayLiveParticipantStatusSchema = z.enum([
  "booked",
  "checked_in",
  "no_show",
  "left_session",
]);
export const openPlayLiveCourtStateSchema = z.enum([
  "available",
  "ready",
  "playing",
  "game_over",
  "unavailable",
]);
export const openPlayLiveSideSchema = z.enum(["A", "B"]);

export const openPlayLiveSessionKeySchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  slotId: z.string().trim().min(1).max(16),
});

export const patchOpenPlayLiveSessionBodySchema =
  openPlayLiveSessionKeySchema.extend({
    status: openPlayLiveSessionStatusSchema,
  });

export const startOpenPlayLiveGameBodySchema =
  openPlayLiveSessionKeySchema.extend({
    participantIds: z.array(z.string().min(1).max(64)).length(4),
  });

export const openPlayLiveGamePlayerSchema = z.object({
  participantId: z.string(),
  name: z.string(),
  side: openPlayLiveSideSchema,
  seatIndex: z.number().int().min(0).max(3),
});

export const openPlayLiveGameSchema = z.object({
  id: z.string(),
  startedAt: z.string(),
  players: z.array(openPlayLiveGamePlayerSchema),
});

export const openPlayLiveCourtSchema = z.object({
  courtId: z.string(),
  courtLabel: z.string(),
  state: openPlayLiveCourtStateSchema,
  game: openPlayLiveGameSchema.nullable(),
});

export const openPlayLiveQueueItemSchema = z.object({
  participantId: z.string(),
  name: z.string(),
  position: z.number().int().positive(),
});

export const openPlayLiveParticipantSchema = z.object({
  id: z.string(),
  bookingId: z.string(),
  name: z.string(),
  status: openPlayLiveParticipantStatusSchema,
  checkedInAt: z.string().nullable(),
});

export const openPlayLiveMyStatusSchema = z.object({
  participantId: z.string(),
  participantStatus: openPlayLiveParticipantStatusSchema,
  state: z.enum(["not_checked_in", "waiting", "playing", "inactive"]),
  queuePosition: z.number().int().positive().nullable(),
  courtId: z.string().nullable(),
  courtLabel: z.string().nullable(),
  side: openPlayLiveSideSchema.nullable(),
  gameId: z.string().nullable(),
});

export const openPlayLiveBoardSchema = z.object({
  session: z.object({
    id: z.string(),
    date: z.string(),
    slotId: z.string(),
    status: openPlayLiveSessionStatusSchema,
  }),
  courts: z.array(openPlayLiveCourtSchema),
  upNext: z.array(openPlayLiveQueueItemSchema),
  participants: z.array(openPlayLiveParticipantSchema),
  checkedInCount: z.number().int().nonnegative(),
  capacity: z.number().int().positive(),
  /** Null on staff reads or when the caller holds no seat in this session. */
  myStatus: openPlayLiveMyStatusSchema.nullable(),
});

export type OpenPlayLiveSessionStatus = z.infer<
  typeof openPlayLiveSessionStatusSchema
>;
export type OpenPlayLiveParticipantStatus = z.infer<
  typeof openPlayLiveParticipantStatusSchema
>;
export type OpenPlayLiveCourtState = z.infer<
  typeof openPlayLiveCourtStateSchema
>;
export type OpenPlayLiveSessionKey = z.infer<
  typeof openPlayLiveSessionKeySchema
>;
export type PatchOpenPlayLiveSessionBody = z.infer<
  typeof patchOpenPlayLiveSessionBodySchema
>;
export type StartOpenPlayLiveGameBody = z.infer<
  typeof startOpenPlayLiveGameBodySchema
>;
export type OpenPlayLiveCourt = z.infer<typeof openPlayLiveCourtSchema>;
export type OpenPlayLiveGamePlayer = z.infer<
  typeof openPlayLiveGamePlayerSchema
>;
export type OpenPlayLiveQueueItem = z.infer<typeof openPlayLiveQueueItemSchema>;
export type OpenPlayLiveParticipant = z.infer<
  typeof openPlayLiveParticipantSchema
>;
export type OpenPlayLiveMyStatus = z.infer<typeof openPlayLiveMyStatusSchema>;
export type OpenPlayLiveBoard = z.infer<typeof openPlayLiveBoardSchema>;
