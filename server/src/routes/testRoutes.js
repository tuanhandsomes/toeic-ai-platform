import { Router } from "express";
import { testController } from "../controllers/testController.js";
import { requireAuth } from "../middlewares/authMiddleware.js";
import { requireAdmin } from "../middlewares/roleMiddleware.js";
import { validate, validateQuery } from "../middlewares/validate.js";
import {
  createTestSchema,
  updateTestSchema,
  adminListTestsQuerySchema,
} from "../validations/adminValidation.js";

const router = Router();

// All test endpoints require auth. Admin gates added per-route below.
router.use(requireAuth);

// ─── USER + ADMIN (admin can pass ?adminView=true for fuller data) ─────────
router.get("/", testController.list);
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

// Optional admin endpoint kept commented for future use:
// router.get('/admin/listing', requireAdmin, validateQuery(adminListTestsQuerySchema), ...);
// Currently the same GET / endpoint with ?adminView=true serves this purpose.

export default router;
