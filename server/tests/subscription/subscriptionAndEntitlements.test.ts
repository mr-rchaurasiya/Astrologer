import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { createApp } from '../../src/app';
import { SubscriptionService } from '../../src/subscription/subscription.service';
import '../setup';

const app = createApp();

describe('Subscription, Quotas & Entitlements API', () => {
  let userToken: string;
  let userId: string;

  const setupUser = async () => {
    const userRes = await request(app).post('/api/v1/auth/register').send({
      name: 'Sub Tester',
      email: 'sub_tester@example.com',
      password: 'Password123',
    });
    userToken = userRes.body.data.accessToken;
    userId = userRes.body.data.user.id;
  };

  it('GET /api/v1/subscription/me > initializes free tier by default', async () => {
    await setupUser();

    const res = await request(app)
      .get('/api/v1/subscription/me')
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.plan).toBe('free');
    expect(res.body.data.isPremium).toBe(false);
    expect(res.body.data.entitlements.aiChatMessagesPerDay).toBe(5);
  });

  it('SubscriptionService.checkAndIncrementUsage enforces quota limit', async () => {
    await setupUser();

    // Free limit for ai_chat is 5
    for (let i = 1; i <= 5; i++) {
      const q = await SubscriptionService.checkAndIncrementUsage(userId, 'ai_chat', '2026-09-01');
      expect(q.allowed).toBe(true);
      expect(q.count).toBe(i);
    }

    // 6th request is rejected
    const blocked = await SubscriptionService.checkAndIncrementUsage(userId, 'ai_chat', '2026-09-01');
    expect(blocked.allowed).toBe(false);
    expect(blocked.remaining).toBe(0);
  });

  it('POST /api/v1/subscription/upgrade > upgrades plan to premium and expands quotas', async () => {
    await setupUser();

    const upgradeRes = await request(app)
      .post('/api/v1/subscription/upgrade')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ plan: 'premium', durationDays: 30 });

    expect(upgradeRes.status).toBe(200);
    expect(upgradeRes.body.success).toBe(true);
    expect(upgradeRes.body.data.plan).toBe('premium');
    expect(upgradeRes.body.data.isPremium).toBe(true);
    expect(upgradeRes.body.data.entitlements.aiChatMessagesPerDay).toBe(100);
  });
});
