import { Router } from "express";
import { contactController } from "../controllers/contactController.js";
import { validate } from "../middlewares/validate.js";
import { contactLimiter } from "../middlewares/rateLimit.js";
import { contactMessageSchema } from "../validations/contactValidation.js";

const router = Router();

// Public endpoint — no auth. Rate-limited để chống spam.
router.post(
  "/",
  contactLimiter,
  validate(contactMessageSchema),
  contactController.send,
);

export default router;
