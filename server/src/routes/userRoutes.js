import { Router } from 'express';
import { userController } from '../controllers/userController.js';
import { requireAuth } from '../middlewares/authMiddleware.js';
import { validate } from '../middlewares/validate.js';
import { updateProfileSchema, changePasswordSchema } from '../validations/userValidation.js';

const router = Router();

router.use(requireAuth);

router.get('/me', userController.me);
router.patch('/me', validate(updateProfileSchema), userController.updateProfile);
router.post('/me/change-password', validate(changePasswordSchema), userController.changePassword);

export default router;
