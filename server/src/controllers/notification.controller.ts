import { Request, Response, NextFunction } from 'express';
import { NotificationService } from '../notifications/notification.service';

export const listNotifications = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const limit = parseInt((req.query.limit as string) || '30', 10);
    const unreadOnly = req.query.unreadOnly === 'true';

    const [notifications, unreadCount] = await Promise.all([
      NotificationService.getUserNotifications(userId, limit, unreadOnly),
      NotificationService.getUnreadCount(userId),
    ]);

    res.status(200).json({
      success: true,
      data: {
        notifications,
        unreadCount,
        count: notifications.length,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const markNotificationRead = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    const notification = await NotificationService.markAsRead(userId, id);
    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Notification marked as read',
      data: { notification },
    });
  } catch (error) {
    next(error);
  }
};

export const markAllNotificationsRead = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const modifiedCount = await NotificationService.markAllAsRead(userId);

    res.status(200).json({
      success: true,
      message: 'All notifications marked as read',
      data: { modifiedCount },
    });
  } catch (error) {
    next(error);
  }
};

export const getNotificationPreferences = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const preferences = await NotificationService.getPreferences(userId);

    res.status(200).json({
      success: true,
      data: { preferences },
    });
  } catch (error) {
    next(error);
  }
};

export const updateNotificationPreferences = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const preferences = await NotificationService.updatePreferences(userId, req.body);

    res.status(200).json({
      success: true,
      message: 'Notification preferences updated successfully',
      data: { preferences },
    });
  } catch (error) {
    next(error);
  }
};

// ----------------------------------------------------------------------------
// Phase 14: Web Push Notification Endpoints
// ----------------------------------------------------------------------------

export const getPushPublicKey = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { PushNotificationService } = await import('../services/pushNotification.service');
    const publicKey = PushNotificationService.getPublicKey();

    res.status(200).json({
      success: true,
      data: { publicKey },
    });
  } catch (error) {
    next(error);
  }
};

export const subscribePush = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const { endpoint, keys, deviceType, platform } = req.body;

    if (!endpoint || !keys?.p256dh || !keys?.auth) {
      return res.status(400).json({
        success: false,
        message: 'Invalid push subscription payload. Endpoint and keys are required.',
      });
    }

    const { PushNotificationService } = await import('../services/pushNotification.service');
    const subscription = await PushNotificationService.subscribe({
      userId,
      endpoint,
      keys,
      userAgent: req.headers['user-agent'],
      deviceType,
      platform,
    });

    res.status(200).json({
      success: true,
      message: 'Push subscription registered successfully',
      data: { subscriptionId: subscription._id },
    });
  } catch (error) {
    next(error);
  }
};

export const unsubscribePush = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const { endpoint } = req.body;

    if (!endpoint) {
      return res.status(400).json({
        success: false,
        message: 'Endpoint is required to unsubscribe.',
      });
    }

    const { PushNotificationService } = await import('../services/pushNotification.service');
    const unsubscribed = await PushNotificationService.unsubscribe(userId, endpoint);

    res.status(200).json({
      success: true,
      message: unsubscribed ? 'Push subscription deactivated' : 'Subscription not found',
      data: { unsubscribed },
    });
  } catch (error) {
    next(error);
  }
};
