import { describe, it, expect, beforeEach } from 'vitest';
import mongoose from 'mongoose';
import { CouponService } from '../src/services/coupon.service';
import { Coupon } from '../src/models/Coupon';
import { mockDb } from './setup';

describe('Phase 10: Concurrency Resiliency & Coupon Redemptions', () => {
  beforeEach(async () => {
    mockDb.reset();
    await Coupon.create({
      code: 'CONCURRENT10',
      discountType: 'percentage',
      discountValue: 10,
      maxRedemptions: 2,
      perUserLimit: 1,
      validUntil: new Date(Date.now() + 10 * 24 * 3600 * 1000),
      applicablePlans: ['pro_monthly'],
      isActive: true,
    });
  });

  it('should handle sequential and concurrent coupon redemptions up to limit', async () => {
    const user1 = new mongoose.Types.ObjectId().toString();
    const user2 = new mongoose.Types.ObjectId().toString();
    const user3 = new mongoose.Types.ObjectId().toString();

    const [r1, r2] = await Promise.all([
      CouponService.recordRedemption('CONCURRENT10', 'pro_monthly', user1),
      CouponService.recordRedemption('CONCURRENT10', 'pro_monthly', user2),
    ]);

    expect(r1.valid).toBe(true);
    expect(r2.valid).toBe(true);

    // 3rd redemption should fail as maxRedemptions is 2
    const r3 = await CouponService.validateCoupon('CONCURRENT10', 'pro_monthly', user3);
    expect(r3.valid).toBe(false);
  });
});
