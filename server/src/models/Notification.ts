import mongoose, { Document, Schema, Types } from 'mongoose';

export type NotificationType =
  | 'daily_insight'
  | 'transit'
  | 'subscription'
  | 'payment'
  | 'report'
  | 'system'
  | 'referral'
  | 'coupon';

export type DeliveryStatus = 'queued' | 'sent' | 'delivered' | 'failed' | 'read';
export type NotificationPriority = 'low' | 'medium' | 'high' | 'critical';
export type NotificationCategory = 'astrology' | 'billing' | 'consultation' | 'security' | 'promo';

export interface INotification extends Document {
  userId: Types.ObjectId;
  type: NotificationType;
  title: string;
  message: string;
  data?: Record<string, any>;
  readAt?: Date;
  isRead: boolean;
  deliveryStatus: DeliveryStatus;
  priority: NotificationPriority;
  category: NotificationCategory;
  retryCount: number;
  lastError?: string;
  idempotencyKey?: string;
  createdAt: Date;
  updatedAt: Date;
}

const notificationSchema = new Schema<INotification>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ['daily_insight', 'transit', 'subscription', 'payment', 'report', 'system', 'referral', 'coupon'],
      default: 'system',
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    data: {
      type: Schema.Types.Mixed,
    },
    readAt: {
      type: Date,
    },
    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },
    deliveryStatus: {
      type: String,
      enum: ['queued', 'sent', 'delivered', 'failed', 'read'],
      default: 'delivered',
      index: true,
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'medium',
    },
    category: {
      type: String,
      enum: ['astrology', 'billing', 'consultation', 'security', 'promo'],
      default: 'astrology',
    },
    retryCount: {
      type: Number,
      default: 0,
    },
    lastError: {
      type: String,
    },
    idempotencyKey: {
      type: String,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

notificationSchema.index({ userId: 1, isRead: 1 });
notificationSchema.index({ userId: 1, createdAt: -1 });
notificationSchema.index({ userId: 1, idempotencyKey: 1 }, { unique: true, sparse: true });

export const Notification = mongoose.model<INotification>('Notification', notificationSchema);
