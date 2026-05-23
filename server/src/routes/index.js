import { Router } from 'express';
import authRoutes from './authRoutes.js';
import userRoutes from './userRoutes.js';
import testRoutes from './testRoutes.js';
import questionRoutes from './questionRoutes.js';
import resultRoutes from './resultRoutes.js';
import statsRoutes from './statsRoutes.js';
import aiRoutes from './aiRoutes.js';
import adminRoutes from './adminRoutes.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/tests', testRoutes);
router.use('/questions', questionRoutes);
router.use('/results', resultRoutes);
router.use('/stats', statsRoutes);
router.use('/ai', aiRoutes);
router.use('/admin', adminRoutes);

export default router;
