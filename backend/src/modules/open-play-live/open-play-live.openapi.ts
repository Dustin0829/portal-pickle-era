import type { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import { standardErrorResponses, successResponseSchema } from "../../lib/openapi-helpers.js";
import {
  openPlayLiveBoardSchema,
  openPlayLiveCourtParamsSchema,
  openPlayLiveGameParamsSchema,
  openPlayLiveParticipantParamsSchema,
  openPlayLiveSessionKeySchema,
  openPlayLiveSessionQuerySchema,
  patchOpenPlayLiveSessionBodySchema,
  startOpenPlayLiveGameBodySchema,
} from "./open-play-live.schema.js";

const boardResponse = {
  description: "Live Open Play board",
  content: { "application/json": { schema: successResponseSchema(openPlayLiveBoardSchema) } },
};

export function registerOpenPlayLiveOpenApi(registry: OpenAPIRegistry) {
  registry.register("OpenPlayLiveBoard", openPlayLiveBoardSchema);

  registry.registerPath({
    method: "get",
    path: "/me/open-play/session",
    operationId: "getMeOpenPlayLiveSession",
    tags: ["OpenPlayLive"],
    request: { query: openPlayLiveSessionQuerySchema },
    responses: {
      200: boardResponse,
      ...standardErrorResponses,
    },
  });

  registry.registerPath({
    method: "post",
    path: "/me/open-play/games/{gameId}/end",
    operationId: "postMeOpenPlayLiveGameEnd",
    tags: ["OpenPlayLive"],
    request: { params: openPlayLiveGameParamsSchema },
    responses: {
      200: boardResponse,
      ...standardErrorResponses,
    },
  });

  registry.registerPath({
    method: "get",
    path: "/admin/open-play/session",
    operationId: "getAdminOpenPlayLiveSession",
    tags: ["OpenPlayLive"],
    request: { query: openPlayLiveSessionQuerySchema },
    responses: {
      200: boardResponse,
      ...standardErrorResponses,
    },
  });

  registry.registerPath({
    method: "patch",
    path: "/admin/open-play/session",
    operationId: "patchAdminOpenPlayLiveSession",
    tags: ["OpenPlayLive"],
    request: {
      body: {
        content: { "application/json": { schema: patchOpenPlayLiveSessionBodySchema } },
      },
    },
    responses: {
      200: boardResponse,
      ...standardErrorResponses,
    },
  });

  for (const action of ["check-in", "no-show", "left"] as const) {
    registry.registerPath({
      method: "post",
      path: `/admin/open-play/participants/{id}/${action}`,
      operationId: `postAdminOpenPlayLiveParticipant${toPascalCase(action)}`,
      tags: ["OpenPlayLive"],
      request: { params: openPlayLiveParticipantParamsSchema },
      responses: {
        200: boardResponse,
        ...standardErrorResponses,
      },
    });
  }

  for (const action of ["unavailable", "available"] as const) {
    registry.registerPath({
      method: "post",
      path: `/admin/open-play/courts/{courtId}/${action}`,
      operationId: `postAdminOpenPlayLiveCourt${toPascalCase(action)}`,
      tags: ["OpenPlayLive"],
      request: {
        params: openPlayLiveCourtParamsSchema,
        body: {
          content: { "application/json": { schema: openPlayLiveSessionKeySchema } },
        },
      },
      responses: {
        200: boardResponse,
        ...standardErrorResponses,
      },
    });
  }

  registry.registerPath({
    method: "post",
    path: "/admin/open-play/courts/{courtId}/start",
    operationId: "postAdminOpenPlayLiveCourtStart",
    tags: ["OpenPlayLive"],
    request: {
      params: openPlayLiveCourtParamsSchema,
      body: {
        content: { "application/json": { schema: startOpenPlayLiveGameBodySchema } },
      },
    },
    responses: {
      201: boardResponse,
      ...standardErrorResponses,
    },
  });

  registry.registerPath({
    method: "post",
    path: "/admin/open-play/games/{gameId}/end",
    operationId: "postAdminOpenPlayLiveGameEnd",
    tags: ["OpenPlayLive"],
    request: { params: openPlayLiveGameParamsSchema },
    responses: {
      200: boardResponse,
      ...standardErrorResponses,
    },
  });
}

function toPascalCase(value: string): string {
  return value
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join("");
}
