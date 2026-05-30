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

// List media — query: ?type=audio|image|all (default all)
router.get('/', uploadController.list);

// Delete media. publicId có thể chứa "/" (vd "toeic-ai/uploads/audio/file_123") →
// dùng wildcard ":publicId(*)" để Express không tách path.
router.delete('/:resourceType/:publicId(*)', uploadController.remove);

export default router;
