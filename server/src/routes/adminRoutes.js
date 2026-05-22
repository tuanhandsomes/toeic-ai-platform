import { Router } from 'express';
import { adminController } from '../controllers/adminController.js';
import { requireAuth, requireAdmin } from '../middlewares/authMiddleware.js';
import { validate, validateQuery } from '../middlewares/validate.js';
import {
  createQuestionSchema,
  updateQuestionSchema,
  importQuestionsSchema,
  createTestSchema,
  updateTestSchema,
  lockUserSchema,
  adminListQuestionsQuerySchema,
  adminListUsersQuerySchema,
  adminListTestsQuerySchema,
} from '../validations/adminValidation.js';

const router = Router();

router.use(requireAuth, requireAdmin);

// Stats
router.get('/stats', adminController.stats);

// Users
router.get('/users', validateQuery(adminListUsersQuerySchema), adminController.listUsers);
router.patch(
  '/users/:id/lock',
  validate(lockUserSchema),
  adminController.toggleUserLock,
);

// Questions
router.get(
  '/questions',
  validateQuery(adminListQuestionsQuerySchema),
  adminController.listQuestions,
);
router.get('/questions/:id', adminController.getQuestion);
router.post('/questions', validate(createQuestionSchema), adminController.createQuestion);
router.put('/questions/:id', validate(updateQuestionSchema), adminController.updateQuestion);
router.delete('/questions/:id', adminController.deleteQuestion);
router.post(
  '/questions/import',
  validate(importQuestionsSchema),
  adminController.importQuestions,
);

// Tests
router.get('/tests', validateQuery(adminListTestsQuerySchema), adminController.listTests);
router.get('/tests/:id', adminController.getTest);
router.post('/tests', validate(createTestSchema), adminController.createTest);
router.put('/tests/:id', validate(updateTestSchema), adminController.updateTest);
router.delete('/tests/:id', adminController.deleteTest);

export default router;
