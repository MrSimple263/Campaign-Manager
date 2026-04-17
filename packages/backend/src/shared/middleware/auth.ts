import { Request, Response, NextFunction } from "express";
import * as jwt from "jsonwebtoken";

import { config } from "../../config/index.js";

import { AppError } from "./errorHandler.js";

import type { SafeUser } from "../types/index.js";

// Extend Express Request type
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: SafeUser;
    }
  }
}

interface JwtPayload {
  userId: string;
  email: string;
  name: string;
}

export const authenticate = (
  req: Request,
  _res: Response,
  next: NextFunction,
) => {
  // Try to get token from cookie first, then fallback to Authorization header
  let token: string | undefined = req.cookies?.[config.cookie.name];

  if (!token) {
    const authHeader = req.headers.authorization;
    if (authHeader?.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1];
    }
  }

  if (!token) {
    return next(new AppError(401, "Authentication required"));
  }

  try {
    const decoded = jwt.verify(token, config.jwt.secret) as JwtPayload;

    req.user = {
      id: decoded.userId,
      email: decoded.email,
      name: decoded.name,
      created_at: new Date(), // Not included in token, placeholder
    };

    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return next(new AppError(401, "Token expired"));
    }
    if (error instanceof jwt.JsonWebTokenError) {
      return next(new AppError(401, "Invalid token"));
    }
    next(error);
  }
};
