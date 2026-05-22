import { Router } from 'express';
import { authController } from '../controllers/authController.js';
import { requireAuth } from '../middlewares/authMiddleware.js';
import { validate } from '../middlewares/validate.js';
import { authLimiter } from '../middlewares/rateLimit.js';
import {
  loginSchema,
  refreshSchema,
  registerSchema,
  logoutSchema,
} from '../validations/authValidation.js';

const router = Router();

router.post('/register', authLimiter, validate(registerSchema), authController.register);
router.post('/login', authLimiter, validate(loginSchema), authController.login);
router.post('/refresh', authLimiter, validate(refreshSchema), authController.refresh);
router.post('/logout', requireAuth, validate(logoutSchema), authController.logout);
router.get('/me', requireAuth, authController.me);

export default router;
