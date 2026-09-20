import type { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import { standardErrorResponses, successResponseSchema } from "../../lib/openapi-helpers.js";
import {
  facilitySettingsDtoSchema,
  patchFacilitySettingsBodySchema,
} from "./facility-settings.schema.js";

export function registerFacilitySettingsOpenApi(registry: OpenAPIRegistry) {
  registry.register("FacilitySettings", facilitySettingsDtoSchema);

  registry.registerPath({
    method: "get",
    path: "/facility-settings",
    operationId: "getFacilitySettings",
    tags: ["FacilitySettings"],
    responses: {
      200: {
        description: "Shared facility settings (prices, Open Play sessions, payment methods)",
        content: {
          "application/json": {
            schema: successResponseSchema(facilitySettingsDtoSchema),
          },
        },
      },
      ...standardErrorResponses,
    },
  });

  registry.registerPath({
    method: "patch",
    path: "/admin/facility-settings",
    operationId: "patchAdminFacilitySettings",
    tags: ["FacilitySettings"],
    request: {
      body: {
        content: {
          "application/json": {
            schema: patchFacilitySettingsBodySchema,
          },
        },
      },
    },
    responses: {
      200: {
        description: "Updated facility settings",
        content: {
          "application/json": {
            schema: successResponseSchema(facilitySettingsDtoSchema),
          },
        },
      },
      ...standardErrorResponses,
    },
  });
}
