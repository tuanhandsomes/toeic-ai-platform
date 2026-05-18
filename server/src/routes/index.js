import { Router } from 'express';
import authRoutes from './authRoutes.js';
import userRoutes from './userRoutes.js';
import testRoutes from './testRoutes.js';
import resultRoutes from './resultRoutes.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/tests', testRoutes);
router.use('/results', resultRoutes);

export default router;
