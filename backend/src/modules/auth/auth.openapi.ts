import type { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import { z } from "zod";
import { standardErrorResponses, successResponseSchema } from "../../lib/openapi-helpers.js";
import {
  forgotPasswordBodySchema,
  loginBodySchema,
  patchMeBodySchema,
  resetPasswordBodySchema,
  signupBodySchema,
  userDtoSchema,
} from "./auth.schema.js";

export function registerAuthOpenApi(registry: OpenAPIRegistry) {
  registry.register("User", userDtoSchema);

  registry.registerPath({
    method: "post",
    path: "/auth/signup",
    operationId: "postAuthSignup",
    tags: ["Auth"],
    request: {
      body: {
        content: { "application/json": { schema: signupBodySchema } },
      },
    },
    responses: {
      201: {
        description: "Created student user and session",
        content: { "application/json": { schema: successResponseSchema(userDtoSchema) } },
      },
      ...standardErrorResponses,
    },
  });

  registry.registerPath({
    method: "post",
    path: "/auth/login",
    operationId: "postAuthLogin",
    tags: ["Auth"],
    request: {
      body: {
        content: { "application/json": { schema: loginBodySchema } },
      },
    },
    responses: {
      200: {
        description: "Logged in",
        content: { "application/json": { schema: successResponseSchema(userDtoSchema) } },
      },
      ...standardErrorResponses,
    },
  });

  registry.registerPath({
    method: "post",
    path: "/auth/logout",
    operationId: "postAuthLogout",
    tags: ["Auth"],
    responses: {
      200: {
        description: "Logged out",
        content: {
          "application/json": {
            schema: successResponseSchema(z.object({ ok: z.literal(true) })),
          },
        },
      },
      ...standardErrorResponses,
    },
  });

  registry.registerPath({
    method: "post",
    path: "/auth/forgot-password",
    operationId: "postAuthForgotPassword",
    tags: ["Auth"],
    request: {
      body: {
        content: { "application/json": { schema: forgotPasswordBodySchema } },
      },
    },
    responses: {
      200: {
        description: "Generic success (enumeration-safe)",
        content: {
          "application/json": {
            schema: successResponseSchema(
              z.object({
                ok: z.literal(true),
                message: z.string(),
              }),
            ),
          },
        },
      },
      ...standardErrorResponses,
    },
  });

  registry.registerPath({
    method: "post",
    path: "/auth/reset-password",
    operationId: "postAuthResetPassword",
    tags: ["Auth"],
    request: {
      body: {
        content: { "application/json": { schema: resetPasswordBodySchema } },
      },
    },
    responses: {
      200: {
        description: "Password updated",
        content: {
          "application/json": {
            schema: successResponseSchema(z.object({ ok: z.literal(true) })),
          },
        },
      },
      ...standardErrorResponses,
    },
  });

  registry.registerPath({
    method: "get",
    path: "/auth/me",
    operationId: "getAuthMe",
    tags: ["Auth"],
    responses: {
      200: {
        description: "Current user",
        content: { "application/json": { schema: successResponseSchema(userDtoSchema) } },
      },
      ...standardErrorResponses,
    },
  });

  registry.registerPath({
    method: "patch",
    path: "/auth/me",
    operationId: "patchAuthMe",
    tags: ["Auth"],
    request: {
      body: {
        content: { "application/json": { schema: patchMeBodySchema } },
      },
    },
    responses: {
      200: {
        description: "Updated profile",
        content: { "application/json": { schema: successResponseSchema(userDtoSchema) } },
      },
      ...standardErrorResponses,
    },
  });
}
