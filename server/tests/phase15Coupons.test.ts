import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app';
import { User } from '../src/models/User';
import { Coupon } from '../src/models/Coupon';
import { generateAccessToken } from '../src/utils/jwt';
import './setup';

const app = createApp();

describe('Phase 15: Extended Campaign Coupons & Discount Validation Suite', () => {
  it('POST /api/v1/coupons/validate verifies valid promotional campaign coupon', async () => {
    const user = await User.create({
      name: 'Rohan Joshi',
      email: `rohan_${Date.now()}@vedic.com`,
      password: 'Password123!',
    });
    const token = generateAccessToken({ id: user.id, email: user.email, role: 'user' });

    // Seed coupon
    await Coupon.create({
      code: 'DIWALI50',
      campaignId: 'diwali_2026',
      discountType: 'percentage',
      discountValue: 50,
      validFrom: new Date(Date.now() - 10000),
      validUntil: new Date(Date.now() + 1000000),
      isActive: true,
      applicablePlans: ['premium_monthly', 'premium_annual'],
    });

    const res = await request(app)
      .post('/api/v1/coupons/validate')
      .set('Authorization', `Bearer ${token}`)
      .send({
        code: 'DIWALI50',
        planId: 'premium_monthly',
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.discountAmount).toBe(500);
  });
});
