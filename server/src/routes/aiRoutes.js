import { Router } from 'express';
import { aiController } from '../controllers/aiController.js';
import { requireAuth } from '../middlewares/authMiddleware.js';
import { aiLimiter } from '../middlewares/rateLimit.js';

const router = Router();

router.use(requireAuth);

// POST burns OpenAI tokens — strict 5/hour/user limit (spec §8.3)
router.post('/analyze/:resultId', aiLimiter, aiController.analyze);

// GET is cheap (DB only, only lazy-gens once) — no special limit beyond generalLimiter
router.get('/analysis/:resultId', aiController.get);

export default router;
