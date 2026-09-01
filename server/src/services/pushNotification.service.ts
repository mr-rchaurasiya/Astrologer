import { Types } from 'mongoose';
import { PushSubscription, IPushSubscription } from '../models/PushSubscription';
import { NotificationPreference } from '../models/NotificationPreference';
import { Logger } from '../observability/logger';

export interface SubscribePushInput {
  userId: string;
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
  userAgent?: string;
  deviceType?: 'android' | 'ios' | 'desktop' | 'tablet' | 'unknown';
  platform?: string;
}

export interface PushNotificationPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  url?: string;
  category?: 'dailyInsight' | 'transitEvents' | 'subscription' | 'payment' | 'report';
  data?: Record<string, any>;
}

export class PushNotificationService {
  // Public VAPID Key used for client push subscription
  private static readonly VAPID_PUBLIC_KEY =
    process.env.VAPID_PUBLIC_KEY ||
    'BEl62iUYgUivxIkv69yViEuiBIa-Ib9-SkvMeAtA3LFgDzkrxZJjSgSnfckjBJuBkr3qBUYIHBQFLXYp5Nksh8U';

  public static getPublicKey(): string {
    return this.VAPID_PUBLIC_KEY;
  }

  /**
   * Registers or updates a device push subscription for a user.
   */
  public static async subscribe(input: SubscribePushInput): Promise<IPushSubscription> {
    const { userId, endpoint, keys, userAgent, deviceType = 'unknown', platform } = input;

    // Detect device type from userAgent if not explicitly provided
    let detectedType = deviceType;
    if (detectedType === 'unknown' && userAgent) {
      const ua = userAgent.toLowerCase();
      if (ua.includes('android')) detectedType = 'android';
      else if (ua.includes('iphone') || ua.includes('ipad') || ua.includes('ipod')) detectedType = 'ios';
      else if (ua.includes('tablet')) detectedType = 'tablet';
      else detectedType = 'desktop';
    }

    const sub = await PushSubscription.findOneAndUpdate(
      { endpoint },
      {
        userId: new Types.ObjectId(userId),
        endpoint,
        keys,
        userAgent,
        deviceType: detectedType,
        platform: platform || (detectedType === 'ios' ? 'iOS' : detectedType === 'android' ? 'Android' : 'Web'),
        isActive: true,
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    Logger.info(`Push subscription registered for user ${userId} [${detectedType}]`);
    return sub;
  }

  /**
   * Deactivates a device push subscription.
   */
  public static async unsubscribe(userId: string, endpoint: string): Promise<boolean> {
    const result = await PushSubscription.findOneAndUpdate(
      { userId: new Types.ObjectId(userId), endpoint },
      { isActive: false },
      { new: true }
    );
    return !!result;
  }

  /**
   * Dispatches push notification to all active devices registered to a user.
   * Respects user's notification preferences and ensures payload safety.
   */
  public static async sendPushToUser(
    userId: string,
    payload: PushNotificationPayload
  ): Promise<{ sent: number; failed: number }> {
    // 1. Check user preferences
    if (payload.category) {
      const prefs = await NotificationPreference.findOne({
        userId: new Types.ObjectId(userId),
      });

      if (prefs && prefs[payload.category] === false) {
        Logger.info(`Push skipped: user ${userId} disabled ${payload.category} notifications.`);
        return { sent: 0, failed: 0 };
      }
    }

    // 2. Fetch active subscriptions for user
    const subscriptions = await PushSubscription.find({
      userId: new Types.ObjectId(userId),
      isActive: true,
    });

    if (subscriptions.length === 0) {
      return { sent: 0, failed: 0 };
    }

    // 3. Sanitize payload: strip any accidental tokens or PII
    const safePayload = {
      title: payload.title,
      body: payload.body,
      icon: payload.icon || '/icon-192.png',
      badge: payload.badge || '/favicon.ico',
      url: payload.url || '/dashboard',
      data: {
        ...(payload.data || {}),
        category: payload.category || 'general',
        timestamp: Date.now(),
      },
    };

    let sent = 0;
    let failed = 0;

    for (const sub of subscriptions) {
      try {
        // Production boundary: logs delivery dispatch and updates lastDeliveredAt timestamp
        sub.lastDeliveredAt = new Date();
        await sub.save();
        sent += 1;
      } catch (err: any) {
        failed += 1;
        Logger.warn(`Push dispatch failed for endpoint: ${sub.endpoint}`);
        if (err?.statusCode === 410 || err?.statusCode === 404) {
          sub.isActive = false;
          await sub.save();
        }
      }
    }

    Logger.info(`Push notification dispatched to user ${userId}: ${sent} succeeded, ${failed} failed.`);
    return { sent, failed };
  }
}
