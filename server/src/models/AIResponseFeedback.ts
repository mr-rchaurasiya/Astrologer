import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IAIResponseFeedback extends Document {
  userId: Types.ObjectId;
  messageId: string;
  sessionId?: string;
  rating: 'helpful' | 'not_helpful';
  category?: 'accuracy' | 'clarity' | 'depth' | 'hallucination' | 'tone' | 'other';
  comment?: string;
  aiModel?: string;
  createdAt: Date;
  updatedAt: Date;
}

const aiResponseFeedbackSchema = new Schema<IAIResponseFeedback>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    messageId: {
      type: String,
      required: true,
      index: true,
    },
    sessionId: {
      type: String,
      index: true,
    },
    rating: {
      type: String,
      enum: ['helpful', 'not_helpful'],
      required: true,
    },
    category: {
      type: String,
      enum: ['accuracy', 'clarity', 'depth', 'hallucination', 'tone', 'other'],
    },
    comment: {
      type: String,
      maxlength: 500,
    },
    aiModel: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

aiResponseFeedbackSchema.index({ userId: 1, messageId: 1 }, { unique: true });
aiResponseFeedbackSchema.index({ rating: 1, createdAt: -1 });

export const AIResponseFeedback = mongoose.model<IAIResponseFeedback>(
  'AIResponseFeedback',
  aiResponseFeedbackSchema
);
