import { Request, Response, NextFunction } from "express";

import { config } from "../../config/index.js";
import { RESPONSE_STATUS } from "../../shared/constants/index.js";

import { authService } from "./auth.service.js";

import type { RegisterInput, LoginInput } from "./auth.types.js";

const cookieOptions = {
  httpOnly: config.cookie.httpOnly,
  secure: config.cookie.secure,
  sameSite: config.cookie.sameSite,
  maxAge: config.cookie.maxAge,
};

export const authController = {
  async register(
    req: Request<object, object, RegisterInput>,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const { token, user } = await authService.register(req.body);

      res.cookie(config.cookie.name, token, cookieOptions);

      res.status(201).json({
        status: RESPONSE_STATUS.SUCCESS,
        data: { user },
      });
    } catch (error) {
      next(error);
    }
  },

  async login(
    req: Request<object, object, LoginInput>,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const { token, user } = await authService.login(req.body);

      res.cookie(config.cookie.name, token, cookieOptions);

      res.json({
        status: RESPONSE_STATUS.SUCCESS,
        data: { user },
      });
    } catch (error) {
      next(error);
    }
  },

  async logout(_req: Request, res: Response, next: NextFunction) {
    try {
      res.clearCookie(config.cookie.name, {
        httpOnly: config.cookie.httpOnly,
        secure: config.cookie.secure,
        sameSite: config.cookie.sameSite,
      });

      res.json({
        status: RESPONSE_STATUS.SUCCESS,
        data: { message: "Logged out successfully" },
      });
    } catch (error) {
      next(error);
    }
  },

  async me(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await authService.getCurrentUser(req.user!.id);

      res.json({
        status: RESPONSE_STATUS.SUCCESS,
        data: { user },
      });
    } catch (error) {
      next(error);
    }
  },
};
