import mongoose, { Document, Schema, Types } from 'mongoose';

export interface ICouponRedemption extends Document {
  userId: Types.ObjectId;
  couponId: Types.ObjectId;
  code: string;
  planId: string;
  originalAmount: number;
  discountAmount: number;
  finalAmount: number;
  paymentId?: Types.ObjectId;
  redeemedAt: Date;
}

const couponRedemptionSchema = new Schema<ICouponRedemption>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    couponId: {
      type: Schema.Types.ObjectId,
      ref: 'Coupon',
      required: true,
      index: true,
    },
    code: {
      type: String,
      required: true,
      uppercase: true,
    },
    planId: {
      type: String,
      required: true,
    },
    originalAmount: {
      type: Number,
      required: true,
    },
    discountAmount: {
      type: Number,
      required: true,
    },
    finalAmount: {
      type: Number,
      required: true,
    },
    paymentId: {
      type: Schema.Types.ObjectId,
      ref: 'Payment',
    },
    redeemedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

couponRedemptionSchema.index({ userId: 1, couponId: 1 });

export const CouponRedemption = mongoose.model<ICouponRedemption>(
  'CouponRedemption',
  couponRedemptionSchema
);
