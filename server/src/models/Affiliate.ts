import mongoose, { Document, Schema, Model, Types } from 'mongoose';

export interface IAffiliate extends Document {
  userId?: Types.ObjectId;
  partnerName: string;
  email: string;
  affiliateCode: string;
  commissionPercentage: number; // e.g. 20%
  totalClicks: number;
  totalConversions: number;
  totalEarnings: number; // in INR or smallest currency unit
  payoutStatus: 'active' | 'paused' | 'pending_payout';
  attributionWindowDays: number;
  createdAt: Date;
  updatedAt: Date;
}

const affiliateSchema = new Schema<IAffiliate>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User' },
    partnerName: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true, index: true },
    affiliateCode: { type: String, required: true, unique: true, uppercase: true, trim: true, index: true },
    commissionPercentage: { type: Number, required: true, min: 0, max: 100, default: 20 },
    totalClicks: { type: Number, default: 0 },
    totalConversions: { type: Number, default: 0 },
    totalEarnings: { type: Number, default: 0 },
    payoutStatus: { type: String, enum: ['active', 'paused', 'pending_payout'], default: 'active' },
    attributionWindowDays: { type: Number, default: 30 },
  },
  { timestamps: true }
);

export const Affiliate: Model<IAffiliate> = mongoose.model<IAffiliate>('Affiliate', affiliateSchema);
