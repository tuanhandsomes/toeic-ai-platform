import { Router } from 'express';
import authRoutes from './authRoutes.js';
import userRoutes from './userRoutes.js';
import testRoutes from './testRoutes.js';
import questionRoutes from './questionRoutes.js';
import resultRoutes from './resultRoutes.js';
import statsRoutes from './statsRoutes.js';
import aiRoutes from './aiRoutes.js';
import uploadRoutes from './uploadRoutes.js';
import adminRoutes from './adminRoutes.js';
import contactRoutes from './contactRoutes.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/tests', testRoutes);
router.use('/questions', questionRoutes);
router.use('/results', resultRoutes);
router.use('/stats', statsRoutes);
router.use('/ai', aiRoutes);
router.use('/upload', uploadRoutes);
router.use('/admin', adminRoutes);
router.use('/contact', contactRoutes);

export default router;
