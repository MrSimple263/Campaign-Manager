import { Router } from "express";

import { authenticate, validate } from "../../shared/middleware/index.js";
import { createRecipientSchema } from "../../validations/schemas.js";

import { recipientController } from "./recipient.controller.js";

const router = Router();

// All recipient routes require authentication
router.use(authenticate);

router.get("/", recipientController.getRecipients);

router.post(
  "/",
  validate(createRecipientSchema),
  recipientController.createRecipient,
);

export default router;
