import { Router } from 'express';
import {
  registerAffiliate,
  getAffiliateProfile,
  trackAffiliateClick,
  getAdminAffiliates,
} from '../controllers/affiliate.controller';
import { requireAuth, requireRole } from '../middleware/auth';

export const affiliateRouter = Router();

// Public click tracking
affiliateRouter.post('/track-click/:code', trackAffiliateClick);

// Authenticated user partner registration & stats
affiliateRouter.post('/register', requireAuth, registerAffiliate);
affiliateRouter.get('/me', requireAuth, getAffiliateProfile);

// Admin partner overview
affiliateRouter.get('/admin/list', requireAuth, requireRole('admin'), getAdminAffiliates);
