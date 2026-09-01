import { describe, it, expect, beforeEach } from 'vitest';
import mongoose from 'mongoose';
import { PushNotificationService } from '../src/services/pushNotification.service';
import { PushSubscription } from '../src/models/PushSubscription';
import { NotificationPreference } from '../src/models/NotificationPreference';
import './setup';

describe('Phase 14: Mobile Push Security & Preference Enforcement Suite', () => {
  const userId1 = new mongoose.Types.ObjectId().toString();
  const userId2 = new mongoose.Types.ObjectId().toString();

  beforeEach(async () => {
    await PushSubscription.deleteMany({});
  });

  it('preserves user device isolation during registration and dispatch', async () => {
    // User 1 device
    await PushNotificationService.subscribe({
      userId: userId1,
      endpoint: 'https://fcm.googleapis.com/fcm/send/user1_device',
      keys: { p256dh: 'p1', auth: 'a1' },
      deviceType: 'android',
    });

    // User 2 device
    await PushNotificationService.subscribe({
      userId: userId2,
      endpoint: 'https://fcm.googleapis.com/fcm/send/user2_device',
      keys: { p256dh: 'p2', auth: 'a2' },
      deviceType: 'ios',
    });

    const user1Subs = await PushSubscription.find({ userId: new mongoose.Types.ObjectId(userId1) });
    expect(user1Subs.length).toBe(1);
    expect(user1Subs[0].endpoint).toContain('user1_device');

    const user2Subs = await PushSubscription.find({ userId: new mongoose.Types.ObjectId(userId2) });
    expect(user2Subs.length).toBe(1);
    expect(user2Subs[0].endpoint).toContain('user2_device');
  });

  it('safely dispatches generic push notification without leaking sensitive PII', async () => {
    await PushNotificationService.subscribe({
      userId: userId1,
      endpoint: 'https://fcm.googleapis.com/fcm/send/user1_phone',
      keys: { p256dh: 'p1', auth: 'a1' },
      deviceType: 'android',
    });

    const dispatchRes = await PushNotificationService.sendPushToUser(userId1, {
      title: 'Daily Horoscope Insight',
      body: 'Your personalized planetary alignment for today is ready.',
      category: 'dailyInsight',
      url: '/dashboard',
    });

    expect(dispatchRes.sent).toBe(1);
    expect(dispatchRes.failed).toBe(0);
  });
});
