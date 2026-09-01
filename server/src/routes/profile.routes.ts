import { Router } from 'express';
import {
  createProfile,
  getProfiles,
  getProfileById,
  updateProfile,
  deleteProfile,
} from '../controllers/profile.controller';
import { requireAuth } from '../middleware/auth';

const router = Router();

// All profile endpoints require authentication
router.use(requireAuth);

router.post('/', createProfile);
router.get('/', getProfiles);
router.get('/:id', getProfileById);
router.put('/:id', updateProfile);
router.delete('/:id', deleteProfile);

export default router;
