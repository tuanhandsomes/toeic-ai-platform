import { Router } from 'express';
import { uploadController } from '../controllers/uploadController.js';
import { requireAuth } from '../middlewares/authMiddleware.js';
import { requireAdmin } from '../middlewares/roleMiddleware.js';
import { uploadAudio, uploadImage, wrapMulter } from '../middlewares/upload.js';

const router = Router();

// Admin only — uploads should never come from regular users.
router.use(requireAuth, requireAdmin);

router.post('/audio', wrapMulter(uploadAudio), uploadController.audio);
router.post('/image', wrapMulter(uploadImage), uploadController.image);

export default router;
