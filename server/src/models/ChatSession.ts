import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IChatSession extends Document {
  userId: Types.ObjectId;
  profileId: Types.ObjectId;
  title: string;
  lastMessageAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const chatSessionSchema = new Schema<IChatSession>(
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
    title: {
      type: String,
      required: true,
      trim: true,
      default: 'Astrology Inquiry',
      maxlength: 120,
    },
    lastMessageAt: {
      type: Date,
      default: Date.now,
      index: true,
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

chatSessionSchema.index({ userId: 1, updatedAt: -1 });
chatSessionSchema.index({ userId: 1, profileId: 1, updatedAt: -1 });

export const ChatSession = mongoose.model<IChatSession>('ChatSession', chatSessionSchema);
