import { Router } from "express";

import { authRoutes } from "../modules/auth/index.js";
import { campaignRoutes } from "../modules/campaigns/index.js";
import { recipientRoutes } from "../modules/recipients/index.js";

const router = Router();

router.use("/auth", authRoutes);
router.use("/campaigns", campaignRoutes);
router.use("/recipients", recipientRoutes);

// Health check
router.get("/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

export default router;
