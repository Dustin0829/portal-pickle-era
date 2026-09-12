import winston from "winston";
import { env } from "./env.js";

export const logger = winston.createLogger({
  level: env.LOG_LEVEL,
  defaultMeta: {
    service: env.OBSERVABILITY_SERVICE,
  },
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json(),
  ),
  transports: [new winston.transports.Console()],
});
