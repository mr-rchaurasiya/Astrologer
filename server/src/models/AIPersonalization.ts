import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IAIPersonalization extends Document {
  userId: Types.ObjectId;
  aiMemoryEnabled: boolean;
  recommendationsEnabled: boolean;
  dailyInsightEnabled: boolean;
  historyRetentionDays: number;
  languagePreference: string;
  astrologyTerminology: 'standard' | 'sanskrit' | 'simplified';
  responseStyle: 'concise' | 'balanced' | 'detailed';
  createdAt: Date;
  updatedAt: Date;
}

const aiPersonalizationSchema = new Schema<IAIPersonalization>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    aiMemoryEnabled: {
      type: Boolean,
      default: true,
    },
    recommendationsEnabled: {
      type: Boolean,
      default: true,
    },
    dailyInsightEnabled: {
      type: Boolean,
      default: true,
    },
    historyRetentionDays: {
      type: Number,
      default: 90,
    },
    languagePreference: {
      type: String,
      default: 'English',
    },
    astrologyTerminology: {
      type: String,
      enum: ['standard', 'sanskrit', 'simplified'],
      default: 'standard',
    },
    responseStyle: {
      type: String,
      enum: ['concise', 'balanced', 'detailed'],
      default: 'balanced',
    },
  },
  {
    timestamps: true,
  }
);

export const AIPersonalization = mongoose.model<IAIPersonalization>(
  'AIPersonalization',
  aiPersonalizationSchema
);
