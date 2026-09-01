import mongoose, { Document, Schema, Types } from 'mongoose';

export type ReportType = 'kundli_full' | 'life_curve' | 'transits_annual';
export type ReportStatus = 'queued' | 'processing' | 'completed' | 'failed';
export type ReportLanguage = 'en' | 'hi';

export interface IReport extends Document {
  userId: Types.ObjectId;
  profileId: Types.ObjectId;
  type: ReportType;
  title: string;
  language: ReportLanguage;
  status: ReportStatus;
  fileName: string;
  storageKey: string;
  fileSize?: number;
  sections?: string[];
  error?: string;
  generatedAt?: Date;
  expiresAt?: Date;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

const reportSchema = new Schema<IReport>(
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
    type: {
      type: String,
      enum: ['kundli_full', 'life_curve', 'transits_annual'],
      default: 'kundli_full',
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    language: {
      type: String,
      enum: ['en', 'hi'],
      default: 'en',
      required: true,
    },
    status: {
      type: String,
      enum: ['queued', 'processing', 'completed', 'failed'],
      default: 'completed',
      required: true,
      index: true,
    },
    fileName: {
      type: String,
      required: true,
    },
    storageKey: {
      type: String,
      required: true,
    },
    fileSize: {
      type: Number,
    },
    sections: [{ type: String }],
    error: {
      type: String,
    },
    generatedAt: {
      type: Date,
      default: Date.now,
    },
    expiresAt: {
      type: Date,
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

reportSchema.index({ userId: 1, createdAt: -1 });
reportSchema.index({ userId: 1, profileId: 1, createdAt: -1 });
reportSchema.index({ storageKey: 1 }, { unique: true });

export const Report = mongoose.model<IReport>('Report', reportSchema);
