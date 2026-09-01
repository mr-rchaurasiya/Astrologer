import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IPushSubscriptionKeys {
  p256dh: string;
  auth: string;
}

export interface IPushSubscription extends Document {
  userId: Types.ObjectId;
  endpoint: string;
  keys: IPushSubscriptionKeys;
  userAgent?: string;
  deviceType: 'android' | 'ios' | 'desktop' | 'tablet' | 'unknown';
  platform?: string;
  isActive: boolean;
  lastDeliveredAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const pushSubscriptionSchema = new Schema<IPushSubscription>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    endpoint: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    keys: {
      p256dh: { type: String, required: true },
      auth: { type: String, required: true },
    },
    userAgent: { type: String, trim: true },
    deviceType: {
      type: String,
      enum: ['android', 'ios', 'desktop', 'tablet', 'unknown'],
      default: 'unknown',
    },
    platform: { type: String, trim: true },
    isActive: { type: Boolean, default: true, index: true },
    lastDeliveredAt: { type: Date },
  },
  {
    timestamps: true,
  }
);

pushSubscriptionSchema.index({ userId: 1, isActive: 1 });

export const PushSubscription = mongoose.model<IPushSubscription>(
  'PushSubscription',
  pushSubscriptionSchema
);
