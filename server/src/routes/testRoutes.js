import { Router } from 'express';
import { testController } from '../controllers/testController.js';
import { requireAuth } from '../middlewares/authMiddleware.js';

const router = Router();

router.use(requireAuth);

router.get('/', testController.list);
router.get('/:id', testController.getById);

export default router;
