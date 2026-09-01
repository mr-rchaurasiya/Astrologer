import mongoose, { Document, Schema, Types } from 'mongoose';

export interface ICoupon extends Document {
  code: string;
  campaignId?: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  maxRedemptions: number;
  perUserLimit: number;
  validFrom: Date;
  validUntil: Date;
  applicablePlans: string[];
  minAmount: number;
  isActive: boolean;
  redeemedCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const couponSchema = new Schema<ICoupon>(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
      index: true,
    },
    campaignId: {
      type: String,
      trim: true,
      index: true,
    },
    discountType: {
      type: String,
      enum: ['percentage', 'fixed'],
      required: true,
    },
    discountValue: {
      type: Number,
      required: true,
      min: 1,
    },
    maxRedemptions: {
      type: Number,
      default: 1000,
    },
    perUserLimit: {
      type: Number,
      default: 1,
    },
    validFrom: {
      type: Date,
      default: Date.now,
    },
    validUntil: {
      type: Date,
      required: true,
    },
    applicablePlans: {
      type: [String],
      default: ['pro_monthly', 'pro_annual', 'premium_monthly', 'premium_annual'],
    },
    minAmount: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    redeemedCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

export const Coupon = mongoose.model<ICoupon>('Coupon', couponSchema);
