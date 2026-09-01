import {
  Notification,
  INotification,
  NotificationType,
  NotificationPriority,
  NotificationCategory,
  DeliveryStatus,
} from '../models/Notification';
import { NotificationPreference, INotificationPreference } from '../models/NotificationPreference';
import { SmtpEmailProvider } from './email/smtp.provider';

export class NotificationService {
  private static emailProvider = new SmtpEmailProvider();

  public static async createNotification(options: {
    userId: string;
    type: NotificationType;
    title: string;
    message: string;
    data?: Record<string, any>;
    priority?: NotificationPriority;
    category?: NotificationCategory;
    idempotencyKey?: string;
  }): Promise<INotification | null> {
    const {
      userId,
      type,
      title,
      message,
      data,
      priority = 'medium',
      category = 'astrology',
      idempotencyKey,
    } = options;

    // Check user preferences
    const preferences = await this.getPreferences(userId);
    if (!preferences.inAppEnabled) {
      return null;
    }

    // Check feature-specific preference
    if (type === 'daily_insight' && !preferences.dailyInsight) return null;
    if (type === 'transit' && !preferences.transitEvents) return null;
    if (type === 'subscription' && !preferences.subscription) return null;
    if (type === 'payment' && !preferences.payment) return null;
    if (type === 'report' && !preferences.report) return null;

    // Idempotency / Deduplication check
    if (idempotencyKey) {
      const existing = await Notification.findOne({
        userId,
        idempotencyKey,
      });
      if (existing) {
        return existing;
      }
    }

    const notification = await Notification.create({
      userId,
      type,
      title,
      message,
      data,
      priority,
      category,
      deliveryStatus: 'delivered',
      idempotencyKey,
      isRead: false,
    });

    return notification;
  }

  public static async getUserNotifications(
    userId: string,
    limit = 30,
    unreadOnly = false
  ): Promise<INotification[]> {
    const filter: any = { userId };
    if (unreadOnly) {
      filter.isRead = false;
    }
    return Notification.find(filter).sort({ createdAt: -1 }).limit(limit);
  }

  public static async getUnreadCount(userId: string): Promise<number> {
    return Notification.countDocuments({ userId, isRead: false });
  }

  public static async markAsRead(userId: string, notificationId: string): Promise<INotification | null> {
    const notif = await Notification.findOne({ _id: notificationId, userId });
    if (!notif) return null;

    notif.isRead = true;
    notif.readAt = new Date();
    notif.deliveryStatus = 'read';
    await notif.save();
    return notif;
  }

  public static async markAllAsRead(userId: string): Promise<number> {
    const res = await Notification.updateMany(
      { userId, isRead: false },
      { $set: { isRead: true, readAt: new Date(), deliveryStatus: 'read' } }
    );
    return res.modifiedCount;
  }

  public static async retryFailedDeliveries(maxRetries = 3): Promise<number> {
    const failedList = await Notification.find({
      deliveryStatus: 'failed',
      retryCount: { $lt: maxRetries },
    });

    let recovered = 0;
    for (const notif of failedList) {
      notif.retryCount = (notif.retryCount || 0) + 1;
      notif.deliveryStatus = 'delivered';
      await notif.save();
      recovered++;
    }

    return recovered;
  }

  public static async getPreferences(userId: string): Promise<INotificationPreference> {
    let pref = await NotificationPreference.findOne({ userId });
    if (!pref) {
      pref = await NotificationPreference.create({ userId });
    }
    return pref;
  }

  public static async updatePreferences(
    userId: string,
    updateData: Partial<INotificationPreference>
  ): Promise<INotificationPreference> {
    let pref = await NotificationPreference.findOne({ userId });
    if (!pref) {
      pref = await NotificationPreference.create({ userId, ...updateData });
    } else {
      Object.assign(pref, updateData);
      await pref.save();
    }
    return pref;
  }
}
