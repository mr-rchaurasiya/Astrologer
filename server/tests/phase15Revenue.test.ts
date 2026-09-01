import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app';
import { User } from '../src/models/User';
import { Subscription } from '../src/models/Subscription';
import { Payment } from '../src/models/Payment';
import { generateAccessToken } from '../src/utils/jwt';
import './setup';

const app = createApp();

describe('Phase 15: Authoritative Revenue & Growth Metrics Suite', () => {
  it('GET /api/v1/admin/analytics/growth calculates authoritative MRR, ARR, and Funnel for admin', async () => {
    const admin = await User.create({
      name: 'Super Admin',
      email: `admin_growth_${Date.now()}@vedic.com`,
      password: 'Password123!',
      role: 'admin',
    });
    const adminToken = generateAccessToken({ id: admin.id, email: admin.email, role: 'admin' });

    // Seed mock active subscription and payment
    await Subscription.create({
      userId: admin.id,
      plan: 'premium',
      status: 'active',
    });

    await Payment.create({
      userId: admin.id,
      orderId: 'order_test_rev_123',
      paymentId: 'pay_test_rev_123',
      amount: 99900,
      currency: 'INR',
      status: 'captured',
    });

    const res = await request(app)
      .get('/api/v1/admin/analytics/growth')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.overview.mrrINR).toBeGreaterThanOrEqual(999);
    expect(res.body.data.overview.arrINR).toBe(res.body.data.overview.mrrINR * 12);
    expect(res.body.data.funnel.stages.length).toBeGreaterThan(0);
    expect(res.body.data.retention.day1Pct).toBeDefined();
  });
});
