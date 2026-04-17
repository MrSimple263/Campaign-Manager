import { Request, Response, NextFunction } from "express";

import { RESPONSE_STATUS } from "@/shared/constants/index.js";

import { recipientService } from "./recipient.service.js";

import type {
  RecipientQuery,
  CreateRecipientInput,
} from "./recipient.types.js";

export const recipientController = {
  async getRecipients(
    req: Request<object, object, object, RecipientQuery>,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const { limit, cursor, search } = req.query;
      const result = await recipientService.getRecipients({
        limit: limit ? Number(limit) : undefined,
        cursor,
        search,
      });

      res.json({
        status: RESPONSE_STATUS.SUCCESS,
        ...result,
      });
    } catch (error) {
      next(error);
    }
  },

  async createRecipient(
    req: Request<object, object, CreateRecipientInput>,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const recipient = await recipientService.createRecipient(req.body);

      res.status(201).json({
        status: RESPONSE_STATUS.SUCCESS,
        data: recipient,
      });
    } catch (error) {
      next(error);
    }
  },
};
