import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app';
import { User } from '../src/models/User';
import { generateAccessToken } from '../src/utils/jwt';
import { PushNotificationService } from '../src/services/pushNotification.service';
import { PushSubscription } from '../src/models/PushSubscription';
import './setup';

const app = createApp();

describe('Phase 14: Web Push Notification API & Subscription Lifecycle Suite', () => {
  let userId: string;
  let userToken: string;

  beforeEach(async () => {
    const user = await User.create({
      name: 'Pooja Sharma',
      email: `pooja_${Date.now()}@vedic.com`,
      password: 'Password123!',
    });
    userId = user.id;
    userToken = generateAccessToken({ id: userId, email: user.email, role: 'user' });
  });

  it('GET /api/v1/notifications/push/public-key returns VAPID public key', async () => {
    const res = await request(app)
      .get('/api/v1/notifications/push/public-key')
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.publicKey).toBeDefined();
    expect(typeof res.body.data.publicKey).toBe('string');
  });

  it('POST /api/v1/notifications/push/subscribe registers a device subscription', async () => {
    const res = await request(app)
      .post('/api/v1/notifications/push/subscribe')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        endpoint: 'https://fcm.googleapis.com/fcm/send/test_endpoint_123',
        keys: {
          p256dh: 'BNc_test_p256dh_key_sample',
          auth: 'tB_auth_key_sample',
        },
        deviceType: 'android',
        platform: 'Android',
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.subscriptionId).toBeDefined();
  });

  it('POST /api/v1/notifications/push/unsubscribe deactivates a device subscription', async () => {
    // First subscribe
    await PushNotificationService.subscribe({
      userId,
      endpoint: 'https://fcm.googleapis.com/fcm/send/test_endpoint_456',
      keys: { p256dh: 'key1', auth: 'key2' },
      deviceType: 'ios',
    });

    const res = await request(app)
      .post('/api/v1/notifications/push/unsubscribe')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        endpoint: 'https://fcm.googleapis.com/fcm/send/test_endpoint_456',
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.unsubscribed).toBe(true);
  });
});
