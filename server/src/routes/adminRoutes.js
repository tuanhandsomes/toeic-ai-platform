import { Router } from "express";
import { adminController } from "../controllers/adminController.js";
import { requireAuth } from "../middlewares/authMiddleware.js";
import { requireAdmin } from "../middlewares/roleMiddleware.js";
import { validate, validateQuery } from "../middlewares/validate.js";
import {
  lockUserSchema,
  adminListUsersQuerySchema,
} from "../validations/adminValidation.js";

const router = Router();

router.use(requireAuth, requireAdmin);

// Stats
router.get("/stats", adminController.stats);

// Users
router.get(
  "/users",
  validateQuery(adminListUsersQuerySchema),
  adminController.listUsers,
);
router.patch(
  "/users/:id/lock",
  validate(lockUserSchema),
  adminController.toggleUserLock,
);

// Questions + Tests moved to /questions and /tests respectively

export default router;
