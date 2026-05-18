import { Router } from 'express';
import { resultController } from '../controllers/resultController.js';
import { requireAuth } from '../middlewares/authMiddleware.js';
import { validate } from '../middlewares/validate.js';
import { submitResultSchema } from '../validations/resultValidation.js';

const router = Router();

router.use(requireAuth);

router.post('/', validate(submitResultSchema), resultController.submit);
router.get('/', resultController.list);
router.get('/:id', resultController.getById);

export default router;
