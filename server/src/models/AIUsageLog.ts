import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IAIUsageLog extends Document {
  userId?: Types.ObjectId;
  endpoint: 'chat' | 'daily_insight' | 'voice_transcribe' | 'voice_synthesize' | 'summary';
  aiModel: string;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  latencyMs: number;
  estimatedCostUsd: number;
  success: boolean;
  errorMessage?: string;
  plan: 'free' | 'pro' | 'premium';
  createdAt: Date;
}

const aiUsageLogSchema = new Schema<IAIUsageLog>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      index: true,
    },
    endpoint: {
      type: String,
      enum: ['chat', 'daily_insight', 'voice_transcribe', 'voice_synthesize', 'summary'],
      required: true,
      index: true,
    },
    aiModel: {
      type: String,
      required: true,
      default: 'gpt-4o-mini',
    },
    promptTokens: {
      type: Number,
      default: 0,
    },
    completionTokens: {
      type: Number,
      default: 0,
    },
    totalTokens: {
      type: Number,
      default: 0,
    },
    latencyMs: {
      type: Number,
      default: 0,
    },
    estimatedCostUsd: {
      type: Number,
      default: 0,
    },
    success: {
      type: Boolean,
      default: true,
    },
    errorMessage: {
      type: String,
    },
    plan: {
      type: String,
      enum: ['free', 'pro', 'premium'],
      default: 'free',
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

aiUsageLogSchema.index({ createdAt: -1 });
aiUsageLogSchema.index({ userId: 1, createdAt: -1 });
aiUsageLogSchema.index({ endpoint: 1, createdAt: -1 });

export const AIUsageLog = mongoose.model<IAIUsageLog>('AIUsageLog', aiUsageLogSchema);
