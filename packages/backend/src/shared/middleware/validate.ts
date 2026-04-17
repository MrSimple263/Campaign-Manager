import { Request, Response, NextFunction } from "express";
import { ZodSchema, ZodError } from "zod";

import { AppError } from "./errorHandler.js";

type RequestPart = "body" | "query" | "params";

export const validate =
  (schema: ZodSchema, part: RequestPart = "body") =>
  (req: Request, _res: Response, next: NextFunction) => {
    try {
      req[part] = schema.parse(req[part]);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const message = error.errors
          .map((e) => `${e.path.join(".")}: ${e.message}`)
          .join(", ");
        return next(new AppError(400, message));
      }
      next(error);
    }
  };
