import { Router } from "express";
import { testController } from "../controllers/testController.js";
import { requireAuth } from "../middlewares/authMiddleware.js";
import { requireAdmin } from "../middlewares/roleMiddleware.js";
import { validate, validateQuery } from "../middlewares/validate.js";
import {
  createTestSchema,
  updateTestSchema,
  listTestsQuerySchema,
} from "../validations/testValidation.js";

const router = Router();

// All test endpoints require auth. Admin gates added per-route below.
router.use(requireAuth);

// ─── USER + ADMIN (admin can pass ?adminView=true for fuller data) ─────────
router.get("/", validateQuery(listTestsQuerySchema), testController.list);
router.get("/:id", testController.getById);

// ─── ADMIN ONLY (POST/PUT/DELETE /tests) ────────────────────────
router.post(
  "/",
  requireAdmin,
  validate(createTestSchema),
  testController.create,
);
router.put(
  "/:id",
  requireAdmin,
  validate(updateTestSchema),
  testController.update,
);
router.delete("/:id", requireAdmin, testController.remove);

export default router;
