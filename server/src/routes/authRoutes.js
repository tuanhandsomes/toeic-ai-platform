import { Router } from 'express';
import { authController } from '../controllers/authController.js';
import { requireAuth } from '../middlewares/authMiddleware.js';
import { validate, validateQuery } from '../middlewares/validate.js';
import { authLimiter } from '../middlewares/rateLimit.js';
import {
  loginSchema,
  refreshSchema,
  registerSchema,
  logoutSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  verifyResetTokenQuerySchema,
} from '../validations/authValidation.js';

const router = Router();

router.post('/register', authLimiter, validate(registerSchema), authController.register);
router.post('/login', authLimiter, validate(loginSchema), authController.login);
router.post('/refresh', authLimiter, validate(refreshSchema), authController.refresh);
router.post('/logout', requireAuth, validate(logoutSchema), authController.logout);
router.post(
  '/forgot-password',
  authLimiter,
  validate(forgotPasswordSchema),
  authController.forgotPassword,
);
router.post(
  '/reset-password',
  authLimiter,
  validate(resetPasswordSchema),
  authController.resetPassword,
);
router.get(
  '/reset-password/verify',
  authLimiter,
  validateQuery(verifyResetTokenQuerySchema),
  authController.verifyResetToken,
);
router.get('/me', requireAuth, authController.me);

export default router;
