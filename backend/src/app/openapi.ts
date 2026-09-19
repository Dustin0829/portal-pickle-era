import {
  OpenApiGeneratorV3,
  OpenAPIRegistry,
  extendZodWithOpenApi,
} from "@asteasolutions/zod-to-openapi";
import { z } from "zod";
import { registerActivityLogsOpenApi } from "../modules/activity-logs/activity-logs.openapi.js";
import { registerAuthOpenApi } from "../modules/auth/auth.openapi.js";
import { registerBookingsOpenApi } from "../modules/bookings/bookings.openapi.js";
import { registerExamplesOpenApi } from "../modules/examples/examples.openapi.js";
import { registerHealthOpenApi } from "../modules/health/health.openapi.js";
import { registerUploadsOpenApi } from "../modules/uploads/uploads.openapi.js";
import { registerWaitlistOpenApi } from "../modules/waitlist/waitlist.openapi.js";
import { registerFoodOpenApi } from "../modules/food/food.openapi.js";
import { registerWalletOpenApi } from "../modules/wallet/wallet.openapi.js";

extendZodWithOpenApi(z);

export function buildOpenApiRegistry() {
  const registry = new OpenAPIRegistry();

  registerHealthOpenApi(registry);
  registerExamplesOpenApi(registry);
  registerUploadsOpenApi(registry);
  registerActivityLogsOpenApi(registry);
  registerWaitlistOpenApi(registry);
  registerAuthOpenApi(registry);
  registerBookingsOpenApi(registry);
  registerWalletOpenApi(registry);
  registerFoodOpenApi(registry);

  return registry;
}

export function buildOpenApiDocument() {
  const generator = new OpenApiGeneratorV3(buildOpenApiRegistry().definitions);

  return generator.generateDocument({
    openapi: "3.0.0",
    info: {
      title: "Backend API",
      version: "1.0.0",
    },
    servers: [
      {
        url: "http://localhost:3000",
      },
    ],
  });
}
