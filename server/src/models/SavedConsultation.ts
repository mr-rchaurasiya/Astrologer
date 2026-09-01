import mongoose, { Document, Schema, Types } from 'mongoose';

export interface ISavedConsultation extends Document {
  userId: Types.ObjectId;
  sessionId: Types.ObjectId;
  profileId?: Types.ObjectId;
  title: string;
  tags: string[];
  isFavorite: boolean;
  isArchived: boolean;
  notes: string;
  createdAt: Date;
  updatedAt: Date;
}

const savedConsultationSchema = new Schema<ISavedConsultation>(
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
    },
    profileId: {
      type: Schema.Types.ObjectId,
      ref: 'BirthProfile',
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    tags: {
      type: [String],
      default: [],
      index: true,
    },
    isFavorite: {
      type: Boolean,
      default: false,
      index: true,
    },
    isArchived: {
      type: Boolean,
      default: false,
      index: true,
    },
    notes: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

savedConsultationSchema.index({ userId: 1, isFavorite: 1, isArchived: 1 });
savedConsultationSchema.index({ userId: 1, createdAt: -1 });

export const SavedConsultation = mongoose.model<ISavedConsultation>(
  'SavedConsultation',
  savedConsultationSchema
);
