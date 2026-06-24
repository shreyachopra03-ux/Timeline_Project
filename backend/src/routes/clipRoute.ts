import express from 'express';
import { clerkAuthGuard } from '../middleware/clerkAuthGuard';
import { generateClip, getAllClips, getSingleClip, renameClip, deleteClip } from '../controllers/clipController';

const router = express.Router();

router.use(clerkAuthGuard as any);

router.post('/generate', generateClip);
router.get('/', getAllClips);
router.get('/:id', getSingleClip);
router.put('/:id/rename', renameClip);
router.delete('/:id', deleteClip);

export default router;