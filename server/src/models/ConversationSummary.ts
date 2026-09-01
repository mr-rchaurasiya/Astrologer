import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IConversationSummary extends Document {
  userId: Types.ObjectId;
  sessionId: Types.ObjectId;
  profileId?: Types.ObjectId;
  summary: string;
  keyTopics: string[];
  userQuestions: string[];
  astrologySubjects: string[];
  decisions: string[];
  unresolvedQuestions: string[];
  version: number;
  createdAt: Date;
  updatedAt: Date;
}

const conversationSummarySchema = new Schema<IConversationSummary>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    sessionId: {
      type: Schema.Types.ObjectId,
      ref: 'ChatSession',
      required: true,
      index: true,
    },
    profileId: {
      type: Schema.Types.ObjectId,
      ref: 'BirthProfile',
    },
    summary: {
      type: String,
      required: true,
    },
    keyTopics: {
      type: [String],
      default: [],
    },
    userQuestions: {
      type: [String],
      default: [],
    },
    astrologySubjects: {
      type: [String],
      default: [],
    },
    decisions: {
      type: [String],
      default: [],
    },
    unresolvedQuestions: {
      type: [String],
      default: [],
    },
    version: {
      type: Number,
      default: 1,
    },
  },
  {
    timestamps: true,
  }
);

conversationSummarySchema.index({ userId: 1, sessionId: 1 }, { unique: true });
conversationSummarySchema.index({ userId: 1, createdAt: -1 });

export const ConversationSummary = mongoose.model<IConversationSummary>(
  'ConversationSummary',
  conversationSummarySchema
);
