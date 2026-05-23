import { Router } from "express";
import { questionController } from "../controllers/questionController.js";
import { requireAuth } from "../middlewares/authMiddleware.js";
import { requireAdmin } from "../middlewares/roleMiddleware.js";
import { validate, validateQuery } from "../middlewares/validate.js";
import {
  createQuestionSchema,
  updateQuestionSchema,
  importQuestionsSchema,
  adminListQuestionsQuerySchema,
} from "../validations/adminValidation.js";

const router = Router();

// All question endpoints are admin-only
router.use(requireAuth, requireAdmin);

router.get(
  "/",
  validateQuery(adminListQuestionsQuerySchema),
  questionController.list,
);
router.get("/:id", questionController.getById);
router.post("/", validate(createQuestionSchema), questionController.create);
router.put("/:id", validate(updateQuestionSchema), questionController.update);
router.delete("/:id", questionController.remove);
router.post(
  "/import",
  validate(importQuestionsSchema),
  questionController.importBulk,
);

export default router;
