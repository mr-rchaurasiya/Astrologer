import { Coupon, ICoupon } from '../models/Coupon';
import { CouponRedemption } from '../models/CouponRedemption';
import { getPlanById } from '../config/plans';

export interface CouponValidationResult {
  valid: boolean;
  message?: string;
  coupon?: ICoupon;
  originalAmount?: number;
  discountAmount?: number;
  finalAmount?: number;
}

export class CouponService {
  public static async validateCoupon(
    code: string,
    planId: string,
    userId: string
  ): Promise<CouponValidationResult> {
    if (!code || typeof code !== 'string') {
      return { valid: false, message: 'Coupon code is required' };
    }

    const cleanCode = code.trim().toUpperCase();
    const coupon = await Coupon.findOne({ code: cleanCode, isActive: true });

    if (!coupon) {
      return { valid: false, message: 'Invalid or inactive coupon code' };
    }

    const now = new Date();
    if (coupon.validFrom && now < coupon.validFrom) {
      return { valid: false, message: 'This coupon is not active yet' };
    }

    if (coupon.validUntil && now > coupon.validUntil) {
      return { valid: false, message: 'This coupon has expired' };
    }

    if (coupon.maxRedemptions && coupon.redeemedCount >= coupon.maxRedemptions) {
      return { valid: false, message: 'Coupon redemption limit has been reached' };
    }

    if (coupon.applicablePlans && coupon.applicablePlans.length > 0 && !coupon.applicablePlans.includes(planId)) {
      return { valid: false, message: `Coupon is not applicable to the ${planId} plan` };
    }

    // Check per-user limit
    const userRedemptions = await CouponRedemption.countDocuments({
      userId: userId as any,
      couponId: coupon._id,
    });

    if (userRedemptions >= coupon.perUserLimit) {
      return { valid: false, message: 'You have already used this coupon' };
    }

    const plan = getPlanById(planId);
    const originalAmount = plan.priceInr;

    if (coupon.minAmount && originalAmount < coupon.minAmount) {
      return { valid: false, message: `Minimum order amount for this coupon is ₹${coupon.minAmount}` };
    }

    let discountAmount = 0;
    if (coupon.discountType === 'percentage') {
      discountAmount = Math.round((originalAmount * coupon.discountValue) / 100);
    } else {
      discountAmount = Math.round(coupon.discountValue);
    }

    discountAmount = Math.min(discountAmount, originalAmount);
    const finalAmount = Math.max(0, originalAmount - discountAmount);

    return {
      valid: true,
      coupon,
      originalAmount,
      discountAmount,
      finalAmount,
    };
  }

  public static async recordRedemption(
    code: string,
    planId: string,
    userId: string,
    paymentId?: string
  ): Promise<CouponValidationResult> {
    const validation = await this.validateCoupon(code, planId, userId);
    if (!validation.valid || !validation.coupon) {
      return validation;
    }

    const coupon = validation.coupon;

    await CouponRedemption.create({
      userId,
      couponId: coupon._id,
      code: coupon.code,
      planId,
      originalAmount: validation.originalAmount,
      discountAmount: validation.discountAmount,
      finalAmount: validation.finalAmount,
      paymentId,
      redeemedAt: new Date(),
    });

    coupon.redeemedCount = (coupon.redeemedCount || 0) + 1;
    await coupon.save();

    return validation;
  }
}
