import mongoose, { Document, Schema, Types } from 'mongoose';

export type AnalyticsEventType =
  | 'user_login'
  | 'profile_created'
  | 'kundli_viewed'
  | 'dasha_viewed'
  | 'transit_viewed'
  | 'ai_chat_message'
  | 'daily_insight_viewed'
  | 'report_generated'
  | 'subscription_upgraded'
  | 'subscription_cancelled'
  | 'recommendation_clicked';

export interface IAnalyticsEvent extends Document {
  userId?: Types.ObjectId;
  profileId?: Types.ObjectId;
  event: AnalyticsEventType;
  metadata?: Record<string, any>;
  timestamp: Date;
}

const analyticsEventSchema = new Schema<IAnalyticsEvent>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      index: true,
    },
    profileId: {
      type: Schema.Types.ObjectId,
      ref: 'BirthProfile',
    },
    event: {
      type: String,
      required: true,
      index: true,
    },
    metadata: {
      type: Schema.Types.Mixed,
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: false,
  }
);

analyticsEventSchema.index({ event: 1, timestamp: -1 });
analyticsEventSchema.index({ userId: 1, timestamp: -1 });

export const AnalyticsEvent = mongoose.model<IAnalyticsEvent>('AnalyticsEvent', analyticsEventSchema);
