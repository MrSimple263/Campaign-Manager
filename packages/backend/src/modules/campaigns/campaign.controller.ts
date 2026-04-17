import { Request, Response, NextFunction } from "express";

import { RESPONSE_STATUS } from "../../shared/constants/index.js";

import { campaignService } from "./campaign.service.js";

import type {
  CampaignQuery,
  CreateCampaignInput,
  UpdateCampaignInput,
  ScheduleInput,
} from "./campaign.types.js";

export const campaignController = {
  async getCampaigns(
    req: Request<object, object, object, CampaignQuery>,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const { limit, cursor, status } = req.query;
      const userId = req.user!.id;

      const result = await campaignService.getCampaigns(userId, {
        limit: limit ? Number(limit) : undefined,
        cursor,
        status,
      });

      res.json({
        status: RESPONSE_STATUS.SUCCESS,
        data: result.data,
        nextCursor: result.nextCursor,
        hasMore: result.hasMore,
      });
    } catch (error) {
      next(error);
    }
  },

  async getCampaign(
    req: Request<{ id: string }>,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const { id } = req.params;
      const userId = req.user!.id;

      const result = await campaignService.getCampaign(id, userId);

      res.json({
        status: RESPONSE_STATUS.SUCCESS,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },

  async createCampaign(
    req: Request<object, object, CreateCampaignInput>,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const userId = req.user!.id;
      const result = await campaignService.createCampaign(userId, req.body);

      res.status(201).json({
        status: RESPONSE_STATUS.SUCCESS,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },

  async updateCampaign(
    req: Request<{ id: string }, object, UpdateCampaignInput>,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const { id } = req.params;
      const userId = req.user!.id;

      const result = await campaignService.updateCampaign(id, userId, req.body);

      res.json({
        status: RESPONSE_STATUS.SUCCESS,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },

  async deleteCampaign(
    req: Request<{ id: string }>,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const { id } = req.params;
      const userId = req.user!.id;

      await campaignService.deleteCampaign(id, userId);

      res.status(204).send();
    } catch (error) {
      next(error);
    }
  },

  async scheduleCampaign(
    req: Request<{ id: string }, object, ScheduleInput>,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const { id } = req.params;
      const { scheduled_at } = req.body;
      const userId = req.user!.id;

      const result = await campaignService.scheduleCampaign(
        id,
        userId,
        scheduled_at,
      );

      res.json({
        status: RESPONSE_STATUS.SUCCESS,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },

  async sendCampaign(
    req: Request<{ id: string }>,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const { id } = req.params;
      const userId = req.user!.id;

      const result = await campaignService.sendCampaign(id, userId);

      res.json({
        status: RESPONSE_STATUS.SUCCESS,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },

  async getStats(
    req: Request<{ id: string }>,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const { id } = req.params;
      const userId = req.user!.id;

      const stats = await campaignService.getStats(id, userId);

      res.json(stats);
    } catch (error) {
      next(error);
    }
  },
};
