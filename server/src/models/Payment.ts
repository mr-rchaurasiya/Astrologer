import mongoose, { Document, Schema, Types } from 'mongoose';

export type PaymentStatus = 'created' | 'authorized' | 'captured' | 'failed' | 'refunded' | 'cancelled';
export type PaymentProviderType = 'razorpay' | 'stripe' | 'manual';

export interface IPayment extends Document {
  userId: Types.ObjectId;
  subscriptionId?: Types.ObjectId;
  provider: PaymentProviderType;
  providerOrderId: string;
  providerPaymentId?: string;
  providerSignature?: string;
  amount: number; // in cents or currency minor units
  currency: string;
  status: PaymentStatus;
  planId: string;
  billingPeriod?: 'monthly' | 'yearly';
  paidAt?: Date;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

const paymentSchema = new Schema<IPayment>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    subscriptionId: {
      type: Schema.Types.ObjectId,
      ref: 'Subscription',
    },
    provider: {
      type: String,
      enum: ['razorpay', 'stripe', 'manual'],
      default: 'razorpay',
      required: true,
    },
    providerOrderId: {
      type: String,
      required: true,
    },
    providerPaymentId: {
      type: String,
    },
    providerSignature: {
      type: String,
    },
    amount: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      required: true,
      default: 'USD',
    },
    status: {
      type: String,
      enum: ['created', 'authorized', 'captured', 'failed', 'refunded', 'cancelled'],
      default: 'created',
      required: true,
      index: true,
    },
    planId: {
      type: String,
      required: true,
    },
    billingPeriod: {
      type: String,
      enum: ['monthly', 'yearly'],
    },
    paidAt: {
      type: Date,
    },
    metadata: {
      type: Schema.Types.Mixed,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_, ret: any) => {
        ret.id = ret._id ? ret._id.toString() : '';
        if (ret.userId) ret.userId = ret.userId.toString();
        if (ret.subscriptionId) ret.subscriptionId = ret.subscriptionId.toString();
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

paymentSchema.index({ userId: 1, createdAt: -1 });
paymentSchema.index({ userId: 1, status: 1 });
paymentSchema.index({ provider: 1, providerOrderId: 1 });
paymentSchema.index({ providerPaymentId: 1 }, { sparse: true });

export const Payment = mongoose.model<IPayment>('Payment', paymentSchema);
