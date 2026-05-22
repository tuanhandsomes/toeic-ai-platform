import { Router } from 'express';
import { statsController } from '../controllers/statsController.js';
import { requireAuth } from '../middlewares/authMiddleware.js';
import { validateQuery } from '../middlewares/validate.js';
import { progressQuerySchema, partsQuerySchema } from '../validations/statsValidation.js';

const router = Router();

router.use(requireAuth);

router.get('/overview', statsController.overview);
router.get('/progress', validateQuery(progressQuerySchema), statsController.progress);
router.get('/parts', validateQuery(partsQuerySchema), statsController.parts);

export default router;
