import { Request, Response, NextFunction } from 'express';
import { CouponService } from '../services/coupon.service';
import { Coupon } from '../models/Coupon';
import { sendSuccess, sendError } from '../utils/response';

export const validateCoupon = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const { code, planId } = req.body;

    if (!code || !planId) {
      return sendError(res, 'VALIDATION_ERROR', 'code and planId are required', 400);
    }

    const result = await CouponService.validateCoupon(code, planId, userId);
    if (!result.valid) {
      return sendError(res, 'COUPON_INVALID', result.message || 'Coupon is invalid', 400);
    }

    return sendSuccess(
      res,
      {
        valid: true,
        code: result.coupon!.code,
        discountType: result.coupon!.discountType,
        discountValue: result.coupon!.discountValue,
        originalAmount: result.originalAmount,
        discountAmount: result.discountAmount,
        finalAmount: result.finalAmount,
      },
      'Coupon is valid'
    );
  } catch (error) {
    next(error);
  }
};

export const createAdminCoupon = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const {
      code,
      discountType,
      discountValue,
      maxRedemptions,
      perUserLimit,
      validUntil,
      applicablePlans,
      minAmount,
    } = req.body;

    if (!code || !discountType || !discountValue || !validUntil) {
      return sendError(res, 'VALIDATION_ERROR', 'code, discountType, discountValue, and validUntil are required', 400);
    }

    const cleanCode = String(code).trim().toUpperCase();
    const existing = await Coupon.findOne({ code: cleanCode });
    if (existing) {
      return sendError(res, 'CONFLICT', 'A coupon with this code already exists', 409);
    }

    const coupon = await Coupon.create({
      code: cleanCode,
      discountType,
      discountValue: Number(discountValue),
      maxRedemptions: maxRedemptions ? Number(maxRedemptions) : 1000,
      perUserLimit: perUserLimit ? Number(perUserLimit) : 1,
      validUntil: new Date(validUntil),
      applicablePlans: Array.isArray(applicablePlans) ? applicablePlans : ['pro_monthly', 'pro_annual', 'premium_monthly', 'premium_annual'],
      minAmount: minAmount ? Number(minAmount) : 0,
      isActive: true,
    });

    return sendSuccess(res, { coupon }, 'Coupon created successfully', 201);
  } catch (error) {
    next(error);
  }
};

export const listAdminCoupons = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const coupons = await Coupon.find().sort({ createdAt: -1 });
    return sendSuccess(res, { coupons }, 'Coupons retrieved successfully');
  } catch (error) {
    next(error);
  }
};
