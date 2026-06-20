import express from 'express';
import { generateClip, getAllClips, getSingleClip, renameClip, deleteClip } from '../controllers/clipController';

const router = express.Router();

router.post('/generate', generateClip);
router.get('/', getAllClips);
router.get('/:id', getSingleClip);
router.put('/:id/rename', renameClip);
router.delete('/:id', deleteClip);

export default router;