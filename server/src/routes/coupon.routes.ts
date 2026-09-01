import { Router } from 'express';
import {
  validateCoupon,
  createAdminCoupon,
  listAdminCoupons,
} from '../controllers/coupon.controller';
import { requireAuth, requireRole } from '../middleware/auth';

export const couponRouter = Router();

// User route to validate a coupon for their cart/checkout
couponRouter.post('/validate', requireAuth, validateCoupon);

// Admin management routes
couponRouter.post('/admin', requireAuth, requireRole('admin'), createAdminCoupon);
couponRouter.get('/admin', requireAuth, requireRole('admin'), listAdminCoupons);
