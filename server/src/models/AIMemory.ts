import mongoose, { Document, Schema, Types } from 'mongoose';

export type MemoryCategory =
  | 'preference'
  | 'communication_style'
  | 'astrology_interest'
  | 'frequently_asked_topic'
  | 'consultation_context'
  | 'language_preference'
  | 'learning_goal'
  | 'notification_preference'
  // Phase 13 Extended Categories
  | 'USER_PREFERENCE'
  | 'LIFE_CONTEXT'
  | 'ASTROLOGY_INTEREST'
  | 'CAREER_CONTEXT'
  | 'RELATIONSHIP_CONTEXT'
  | 'EDUCATION_CONTEXT'
  | 'GOAL'
  | 'CONCERN'
  | 'COMMUNICATION_PREFERENCE'
  | 'REMEDY_PREFERENCE'
  | 'LANGUAGE_PREFERENCE'
  | 'AI_BEHAVIOR_PREFERENCE';

export type MemoryConfidenceLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'VERIFIED';

export interface IAIMemory extends Document {
  userId: Types.ObjectId;
  profileId?: Types.ObjectId;
  category: MemoryCategory;
  key: string;
  value: string;
  confidence: number; // 0.0 to 1.0
  confidenceLevel: MemoryConfidenceLevel;
  source: 'user_explicit' | 'inferred' | 'session_summary';
  lastUsedAt: Date;
  expiresAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const aiMemorySchema = new Schema<IAIMemory>(
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
    },
    category: {
      type: String,
      required: true,
    },
    key: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    value: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000,
    },
    confidence: {
      type: Number,
      default: 1.0,
      min: 0.0,
      max: 1.0,
    },
    confidenceLevel: {
      type: String,
      enum: ['LOW', 'MEDIUM', 'HIGH', 'VERIFIED'],
      default: 'HIGH',
    },
    source: {
      type: String,
      enum: ['user_explicit', 'inferred', 'session_summary'],
      default: 'user_explicit',
    },
    lastUsedAt: {
      type: Date,
      default: Date.now,
    },
    expiresAt: {
      type: Date,
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

aiMemorySchema.index({ userId: 1, category: 1 });
aiMemorySchema.index({ userId: 1, key: 1 });
aiMemorySchema.index({ userId: 1, expiresAt: 1 });

export const AIMemory = mongoose.model<IAIMemory>('AIMemory', aiMemorySchema);
