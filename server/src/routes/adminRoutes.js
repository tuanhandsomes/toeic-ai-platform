import { Router } from "express";
import { adminController } from "../controllers/adminController.js";
import { requireAuth } from "../middlewares/authMiddleware.js";
import { requireAdmin } from "../middlewares/roleMiddleware.js";
import { validate, validateQuery } from "../middlewares/validate.js";
import {
  listUsersQuerySchema,
  createUserSchema,
  updateUserSchema,
  lockUserSchema,
  resetUserPasswordSchema,
} from "../validations/adminValidation.js";

const router = Router();

router.use(requireAuth, requireAdmin);

// Stats
router.get("/stats", adminController.stats);

// Users
router.get(
  "/users",
  validateQuery(listUsersQuerySchema),
  adminController.listUsers,
);
router.post(
  "/users",
  validate(createUserSchema),
  adminController.createUser,
);
router.get("/users/:id", adminController.getUser);
router.get("/users/:id/results", adminController.getUserResults);
router.patch(
  "/users/:id",
  validate(updateUserSchema),
  adminController.updateUser,
);
router.delete("/users/:id", adminController.deleteUser);
router.patch(
  "/users/:id/lock",
  validate(lockUserSchema),
  adminController.toggleUserLock,
);
router.patch(
  "/users/:id/reset-password",
  validate(resetUserPasswordSchema),
  adminController.resetUserPassword,
);

// Questions + Tests moved to /questions and /tests respectively

export default router;
