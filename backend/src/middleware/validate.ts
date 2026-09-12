import type { NextFunction, Request, Response } from "express";
import type { ZodTypeAny } from "zod";
import { validationErrorFromZod } from "../lib/zod-validation.js";

type RequestPart = "body" | "query" | "params";

export function validate(part: RequestPart, schema: ZodTypeAny) {
  return (req: Request, _res: Response, next: NextFunction) => {
    const parsed = schema.safeParse(req[part]);
    if (!parsed.success) {
      next(validationErrorFromZod(parsed.error));
      return;
    }

    req[part] = parsed.data;
    next();
  };
}

export const validateBody = (schema: ZodTypeAny) => validate("body", schema);
export const validateQuery = (schema: ZodTypeAny) => validate("query", schema);
export const validateParams = (schema: ZodTypeAny) => validate("params", schema);
