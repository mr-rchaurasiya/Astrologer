import mongoose, { Document, Schema, Types } from 'mongoose';

export interface ISharedKundli extends Document {
  token: string;
  userId: Types.ObjectId;
  profileId: Types.ObjectId;
  title: string;
  allowedSections: string[];
  expiresAt: Date;
  viewCount: number;
  isRevoked: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const sharedKundliSchema = new Schema<ISharedKundli>(
  {
    token: {
      type: String,
      required: true,
      unique: true,
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
    },
    title: {
      type: String,
      default: 'Vedic Kundli Horoscope',
    },
    allowedSections: {
      type: [String],
      default: ['chart', 'planets', 'houses', 'dasha', 'panchang'],
    },
    expiresAt: {
      type: Date,
      required: true,
      index: true,
    },
    viewCount: {
      type: Number,
      default: 0,
    },
    isRevoked: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

sharedKundliSchema.index({ userId: 1, isRevoked: 1 });
sharedKundliSchema.index({ token: 1, isRevoked: 1, expiresAt: 1 });

export const SharedKundli = mongoose.model<ISharedKundli>('SharedKundli', sharedKundliSchema);
