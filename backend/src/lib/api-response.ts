import type { NextFunction, Request, RequestHandler, Response } from "express";

export type PaginationMeta = {
  page: number;
  current_page: number;
  limit: number;
  items_per_page: number;
  total: number;
  total_items: number;
  total_pages: number;
};

export type ApiSuccess<T> = {
  success: true;
  message?: string;
  data: T;
  meta?: PaginationMeta;
};

export type ApiFailure = {
  success: false;
  message: string;
  code?: string;
  errors?: unknown;
};

export function sendSuccess<T>(
  res: Response,
  data: T,
  message = "ok",
  statusCode = 200,
  meta?: PaginationMeta,
) {
  const body: ApiSuccess<T> = {
    success: true,
    message,
    data,
    ...(meta ? { meta } : {}),
  };

  return res.status(statusCode).json(body);
}

export function asyncHandler(handler: RequestHandler): RequestHandler {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(handler(req, res, next)).catch(next);
  };
}
