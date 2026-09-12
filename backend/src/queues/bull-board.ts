import { createBullBoard } from "@bull-board/api";
import { BullMQAdapter } from "@bull-board/api/bullMQAdapter";
import { ExpressAdapter } from "@bull-board/express";
import type { Express, RequestHandler, Router } from "express";
import { getRegisteredQueues } from "./queue.js";

export const BULL_BOARD_BASE_PATH = "/admin/queues";

export function createBullBoardRouter(): Router | undefined {
  const queues = getRegisteredQueues();
  if (queues.length === 0) return undefined;

  const serverAdapter = new ExpressAdapter();
  serverAdapter.setBasePath(BULL_BOARD_BASE_PATH);

  const adapters = queues.map((queue) => new BullMQAdapter(queue));

  createBullBoard({
    queues: adapters,
    serverAdapter,
  });

  return serverAdapter.getRouter() as Router;
}

export function mountBullBoard(app: Express, middleware?: RequestHandler): void {
  const router = createBullBoardRouter();
  if (!router) return;

  if (middleware) {
    app.use(BULL_BOARD_BASE_PATH, middleware, router);
    return;
  }

  app.use(BULL_BOARD_BASE_PATH, router);
}
