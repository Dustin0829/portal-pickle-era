import cookieParser from "cookie-parser";
import cors from "cors";
import express, { type RequestHandler } from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import swaggerUi from "swagger-ui-express";
import { env, parseCorsOrigins } from "./env.js";
import { buildOpenApiDocument } from "./openapi.js";
import { createApiRouter } from "./router.js";
import { activityHttpCapture } from "../lib/activity-logs/http-capture.js";
import { shouldSkipHttpRateLimit } from "../lib/http-rate-limit.js";
import { mountBullBoard } from "../queues/bull-board.js";
import "../queues/register-queues.js";
import { errorHandler } from "../middleware/errorHandler.js";
import { protectAdminTools, shouldMountAdminTools } from "../middleware/adminBasicAuth.js";
import { requestContext } from "../middleware/requestContext.js";
import { requestLogger } from "../middleware/requestLogger.js";

export function createApp() {
  const app = express();
  const openApiDocument = buildOpenApiDocument();

  app.use(helmet());
  app.use(
    cors({
      origin: parseCorsOrigins(env.API_CORS_ORIGIN),
      credentials: true,
      allowedHeaders: ["Authorization", "Content-Type"],
    }),
  );
  app.use(cookieParser());
  app.use(express.json({ limit: "1mb" }));
  app.use(express.urlencoded({ extended: false }));
  app.use(
    rateLimit({
      windowMs: env.RATE_LIMIT_WINDOW_MS,
      limit: env.RATE_LIMIT_MAX,
      standardHeaders: "draft-8",
      legacyHeaders: false,
      skip: shouldSkipHttpRateLimit,
      handler: (_req, res) => {
        res.status(429).json({
          success: false,
          message: "Too many requests. Please try again shortly.",
        });
      },
    }),
  );
  app.use(requestContext);
  app.use(requestLogger);
  app.use(activityHttpCapture);

  app.get("/", (_req, res) => {
    res.json({ success: true, data: { service: env.OBSERVABILITY_SERVICE } });
  });

  if (shouldMountAdminTools()) {
    app.get("/openapi.json", protectAdminTools, (_req, res) => {
      res.json(openApiDocument);
    });
    app.use(
      "/docs",
      protectAdminTools,
      ...(swaggerUi.serve as unknown as RequestHandler[]),
      swaggerUi.setup(openApiDocument) as unknown as RequestHandler,
    );
    mountBullBoard(app, protectAdminTools);
  }

  app.use(createApiRouter());
  app.use(errorHandler);

  return app;
}
