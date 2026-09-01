import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IReferral extends Document {
  referrerId: Types.ObjectId;
  referredUserId?: Types.ObjectId;
  referralCode: string;
  status: 'pending' | 'converted' | 'rewarded';
  rewardType: 'free_credits' | 'discount_coupon' | 'pro_extension';
  rewardGranted: boolean;
  convertedAt?: Date;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

const referralSchema = new Schema<IReferral>(
  {
    referrerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    referredUserId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      index: true,
    },
    referralCode: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
      index: true,
    },
    status: {
      type: String,
      enum: ['pending', 'converted', 'rewarded'],
      default: 'pending',
      index: true,
    },
    rewardType: {
      type: String,
      enum: ['free_credits', 'discount_coupon', 'pro_extension'],
      default: 'free_credits',
    },
    rewardGranted: {
      type: Boolean,
      default: false,
    },
    convertedAt: {
      type: Date,
    },
    metadata: {
      type: Schema.Types.Mixed,
    },
  },
  {
    timestamps: true,
  }
);

referralSchema.index({ referrerId: 1, referredUserId: 1 });

export const Referral = mongoose.model<IReferral>('Referral', referralSchema);
