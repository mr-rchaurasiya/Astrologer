import { describe, it, expect, beforeEach } from 'vitest';
import mongoose from 'mongoose';
import { NotificationService } from '../src/notifications/notification.service';
import { mockDb } from './setup';

describe('Phase 10: Notification Delivery, Deduplication & Retries', () => {
  let userId: string;

  beforeEach(() => {
    mockDb.reset();
    userId = new mongoose.Types.ObjectId().toString();
  });

  it('should create a notification with priority and category', async () => {
    const notif = await NotificationService.createNotification({
      userId,
      type: 'daily_insight',
      title: 'Jupiter Transit Auspicious Window',
      message: 'Jupiter enters your 9th house today, blessing dharmic endeavors.',
      priority: 'high',
      category: 'astrology',
    });

    expect(notif).toBeDefined();
    expect(notif?.title).toBe('Jupiter Transit Auspicious Window');
    expect(notif?.priority).toBe('high');
    expect(notif?.category).toBe('astrology');
    expect(notif?.deliveryStatus).toBe('delivered');
  });

  it('should deduplicate notifications using idempotencyKey', async () => {
    const key = 'transit_jupiter_2026_09_01';

    const notif1 = await NotificationService.createNotification({
      userId,
      type: 'transit',
      title: 'Transit Alert',
      message: 'Planetary ingress detected.',
      idempotencyKey: key,
    });

    const notif2 = await NotificationService.createNotification({
      userId,
      type: 'transit',
      title: 'Transit Alert Duplicate',
      message: 'Planetary ingress detected again.',
      idempotencyKey: key,
    });

    expect(notif1).toBeDefined();
    expect(notif2).toBeDefined();
    expect(notif1?.id).toBe(notif2?.id);
  });
});
