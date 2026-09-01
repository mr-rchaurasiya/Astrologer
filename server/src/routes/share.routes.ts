import { Router } from 'express';
import {
  createSharedKundli,
  getPublicSharedKundli,
  getMySharedLinks,
  revokeSharedLink,
} from '../controllers/share.controller';
import { requireAuth } from '../middleware/auth';

export const shareRouter = Router();

// Public route to view shared chart
shareRouter.get('/public/:token', getPublicSharedKundli);

// Protected routes to generate and manage shared links
shareRouter.post('/create', requireAuth, createSharedKundli);
shareRouter.get('/my-links', requireAuth, getMySharedLinks);
shareRouter.delete('/:id', requireAuth, revokeSharedLink);
