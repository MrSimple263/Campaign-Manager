import { Router } from "express";

import { authenticate, validate } from "../../shared/middleware/index.js";
import {
  createCampaignSchema,
  updateCampaignSchema,
  scheduleSchema,
} from "../../validations/schemas.js";

import { campaignController } from "./campaign.controller.js";

const router = Router();

// All campaign routes require authentication
router.use(authenticate);

router.get("/", campaignController.getCampaigns);
router.get("/:id", campaignController.getCampaign);
router.get("/:id/stats", campaignController.getStats);

router.post(
  "/",
  validate(createCampaignSchema),
  campaignController.createCampaign,
);

router.put(
  "/:id",
  validate(updateCampaignSchema),
  campaignController.updateCampaign,
);

router.delete("/:id", campaignController.deleteCampaign);

router.post(
  "/:id/schedule",
  validate(scheduleSchema),
  campaignController.scheduleCampaign,
);

router.post("/:id/send", campaignController.sendCampaign);

export default router;
