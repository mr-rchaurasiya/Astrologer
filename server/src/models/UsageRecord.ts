import mongoose, { Document, Schema, Types } from 'mongoose';

export type TrackedFeature = 'ai_chat' | 'daily_insight' | 'life_curve' | 'transits';

export interface IUsageRecord extends Document {
  userId: Types.ObjectId;
  feature: TrackedFeature;
  date: string; // YYYY-MM-DD
  count: number;
  createdAt: Date;
  updatedAt: Date;
}

const usageRecordSchema = new Schema<IUsageRecord>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    feature: {
      type: String,
      enum: ['ai_chat', 'daily_insight', 'life_curve', 'transits'],
      required: true,
    },
    date: {
      type: String,
      required: true,
      match: [/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD'],
    },
    count: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_, ret: any) => {
        ret.id = ret._id ? ret._id.toString() : '';
        if (ret.userId) ret.userId = ret.userId.toString();
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Atomic unique usage index per user, feature, and date
usageRecordSchema.index({ userId: 1, feature: 1, date: 1 }, { unique: true });

export const UsageRecord = mongoose.model<IUsageRecord>('UsageRecord', usageRecordSchema);
