import mongoose, { Document, Schema, Types } from 'mongoose';

export type DailyInsightCategory =
  | 'overall'
  | 'career'
  | 'finance'
  | 'relationships'
  | 'learning'
  | 'spirituality';

export interface IDailyInsight extends Document {
  userId: Types.ObjectId;
  profileId: Types.ObjectId;
  date: string; // YYYY-MM-DD
  category: DailyInsightCategory;
  content: string;
  contextVersion: string;
  aiModel: string;
  metadata?: {
    mahadasha?: string;
    antardasha?: string;
    moonSign?: string;
    transitMoonSign?: string;
    keyAspect?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const dailyInsightSchema = new Schema<IDailyInsight>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    profileId: {
      type: Schema.Types.ObjectId,
      ref: 'BirthProfile',
      required: true,
      index: true,
    },
    date: {
      type: String,
      required: true,
      match: [/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD'],
    },
    category: {
      type: String,
      enum: ['overall', 'career', 'finance', 'relationships', 'learning', 'spirituality'],
      default: 'overall',
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    contextVersion: {
      type: String,
      default: '1.0',
    },
    aiModel: {
      type: String,
      default: 'gpt-4o-mini',
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
        if (ret.profileId) ret.profileId = ret.profileId.toString();
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Unique cache constraint per profile, date, and category
dailyInsightSchema.index({ profileId: 1, date: 1, category: 1 }, { unique: true });
dailyInsightSchema.index({ userId: 1, date: -1 });

export const DailyInsight = mongoose.model<IDailyInsight>('DailyInsight', dailyInsightSchema);
