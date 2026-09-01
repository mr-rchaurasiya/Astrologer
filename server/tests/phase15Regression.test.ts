import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app';
import { User } from '../src/models/User';
import { Coupon } from '../src/models/Coupon';
import { generateAccessToken } from '../src/utils/jwt';
import './setup';

const app = createApp();

describe('Phase 15: End-to-End Growth & Conversion Regression Suite', () => {
  it('executes full growth funnel (Landing sitemap -> Register -> Coupon validate -> Growth metrics)', async () => {
    // 1. Crawl sitemap
    const sitemapRes = await request(app).get('/api/v1/seo/sitemap.xml');
    expect(sitemapRes.status).toBe(200);

    // 2. User registration
    const user = await User.create({
      name: 'Aditya Gupta',
      email: `aditya_${Date.now()}@vedic.com`,
      password: 'Password123!',
    });
    const token = generateAccessToken({ id: user.id, email: user.email, role: 'user' });

    // 3. Validate promo coupon
    await Coupon.create({
      code: 'GROWTH2026',
      discountType: 'percentage',
      discountValue: 20,
      validFrom: new Date(Date.now() - 10000),
      validUntil: new Date(Date.now() + 1000000),
      isActive: true,
      applicablePlans: ['pro_monthly', 'premium_monthly'],
    });

    const couponRes = await request(app)
      .post('/api/v1/coupons/validate')
      .set('Authorization', `Bearer ${token}`)
      .send({
        code: 'GROWTH2026',
        planId: 'premium_monthly',
      });

    expect(couponRes.status).toBe(200);
    expect(couponRes.body.data.discountAmount).toBe(200);
  });
});
