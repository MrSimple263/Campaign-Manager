import { Router } from "express";

import { authenticate, validate } from "../../shared/middleware/index.js";
import { registerSchema, loginSchema } from "../../validations/schemas.js";

import { authController } from "./auth.controller.js";

const router = Router();

router.post("/register", validate(registerSchema), authController.register);

router.post("/login", validate(loginSchema), authController.login);

router.post("/logout", authController.logout);

router.get("/me", authenticate, authController.me);

export default router;
