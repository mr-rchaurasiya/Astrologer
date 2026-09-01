import { Router } from 'express';
import {
  listNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  getNotificationPreferences,
  updateNotificationPreferences,
  getPushPublicKey,
  subscribePush,
  unsubscribePush,
} from '../controllers/notification.controller';
import { requireAuth } from '../middleware/auth';

export const notificationRouter = Router();

notificationRouter.use(requireAuth);

notificationRouter.get('/', listNotifications);
notificationRouter.post('/:id/read', markNotificationRead);
notificationRouter.post('/read-all', markAllNotificationsRead);
notificationRouter.get('/preferences', getNotificationPreferences);
notificationRouter.put('/preferences', updateNotificationPreferences);

// Phase 14 Web Push Endpoints
notificationRouter.get('/push/public-key', getPushPublicKey);
notificationRouter.post('/push/subscribe', subscribePush);
notificationRouter.post('/push/unsubscribe', unsubscribePush);

