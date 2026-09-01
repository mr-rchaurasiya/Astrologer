import mongoose, { Document, Schema, Types } from 'mongoose';

export type ChatRole = 'user' | 'assistant' | 'system';

export interface IChatMessage extends Document {
  sessionId: Types.ObjectId;
  userId: Types.ObjectId;
  profileId: Types.ObjectId;
  role: ChatRole;
  content: string;
  contextType?: string;
  metadata?: {
    model?: string;
    promptVersion?: string;
    contextVersion?: string;
    responseTimeMs?: number;
    selectedPoint?: {
      type: string;
      id: string;
      label?: string;
    };
    tokenUsage?: {
      promptTokens: number;
      completionTokens: number;
      totalTokens: number;
    };
  };
  createdAt: Date;
}

const chatMessageSchema = new Schema<IChatMessage>(
  {
    sessionId: {
      type: Schema.Types.ObjectId,
      ref: 'ChatSession',
      required: true,
      index: true,
    },
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
    role: {
      type: String,
      enum: ['user', 'assistant', 'system'],
      required: true,
    },
    content: {
      type: String,
      required: true,
      maxlength: 10000,
    },
    contextType: {
      type: String,
      default: 'general',
    },
    metadata: {
      type: Schema.Types.Mixed,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
    toJSON: {
      transform: (_, ret: any) => {
        ret.id = ret._id ? ret._id.toString() : '';
        if (ret.sessionId) ret.sessionId = ret.sessionId.toString();
        if (ret.userId) ret.userId = ret.userId.toString();
        if (ret.profileId) ret.profileId = ret.profileId.toString();
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

chatMessageSchema.index({ sessionId: 1, createdAt: 1 });
chatMessageSchema.index({ userId: 1, profileId: 1, createdAt: -1 });

export const ChatMessage = mongoose.model<IChatMessage>('ChatMessage', chatMessageSchema);
