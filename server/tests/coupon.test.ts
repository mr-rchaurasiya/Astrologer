import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app';
import { User } from '../src/models/User';
import { Coupon } from '../src/models/Coupon';
import { generateAccessToken } from '../src/utils/jwt';
import './setup';

const app = createApp();

describe('Phase 10: Server-Authoritative Coupon System', () => {
  let userId: string;
  let userToken: string;

  beforeEach(async () => {
    const user = await User.create({
      name: 'Buyer User',
      email: `buyer_${Date.now()}@vedic.com`,
      password: 'Password123!',
    });
    userId = user.id;
    userToken = generateAccessToken({ id: userId, email: user.email, role: 'user' });

    // Create test coupon: 20% discount on Pro/Premium
    await Coupon.create({
      code: 'VEDIC20',
      discountType: 'percentage',
      discountValue: 20,
      maxRedemptions: 100,
      perUserLimit: 1,
      validUntil: new Date(Date.now() + 30 * 24 * 3600 * 1000),
      applicablePlans: ['pro_monthly', 'pro_annual', 'premium_monthly', 'premium_annual'],
      isActive: true,
    });
  });

  it('should validate an active percentage coupon and calculate correct discount', async () => {
    const res = await request(app)
      .post('/api/v1/coupons/validate')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        code: 'VEDIC20',
        planId: 'pro_monthly', // price 499
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.code).toBe('VEDIC20');
    expect(res.body.data.originalAmount).toBe(499);
    expect(res.body.data.discountAmount).toBe(100); // 20% of 499 is 99.8 -> rounded 100
    expect(res.body.data.finalAmount).toBe(399);
  });

  it('should reject non-existent or invalid coupon code', async () => {
    const res = await request(app)
      .post('/api/v1/coupons/validate')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        code: 'FAKEDISCOUNT99',
        planId: 'pro_monthly',
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('should reject expired coupon code', async () => {
    await Coupon.create({
      code: 'EXPIRED10',
      discountType: 'fixed',
      discountValue: 50,
      validUntil: new Date(Date.now() - 1000), // in the past
      isActive: true,
    });

    const res = await request(app)
      .post('/api/v1/coupons/validate')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        code: 'EXPIRED10',
        planId: 'pro_monthly',
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });
});
