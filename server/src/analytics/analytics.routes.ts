import { Router } from 'express';
import { trackEvent, getUserActivity } from './analytics.controller';
import { optionalAuth, requireAuth } from '../middleware/auth';

export const analyticsRouter = Router();

analyticsRouter.post('/events', optionalAuth, trackEvent);
analyticsRouter.get('/activity', requireAuth, getUserActivity);
