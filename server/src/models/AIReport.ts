import mongoose, { Document, Schema, Types } from 'mongoose';

export type AIReportType =
  | 'FULL_KUNDLI_REPORT'
  | 'CAREER_REPORT'
  | 'MARRIAGE_REPORT'
  | 'EDUCATION_REPORT'
  | 'FINANCE_REPORT'
  | 'YEARLY_FORECAST'
  | 'DASHA_REPORT'
  | 'TRANSIT_REPORT'
  | 'COMPATIBILITY_REPORT';

export interface IAIReportSection {
  title: string;
  subtitle?: string;
  content: string;
  astrologicalFactors: string[];
  score?: number;
}

export interface IAIReport extends Document {
  userId: Types.ObjectId;
  profileId: Types.ObjectId;
  reportType: AIReportType;
  title: string;
  summary: string;
  sections: IAIReportSection[];
  disclaimers: string[];
  calculationVersion: string;
  createdAt: Date;
  updatedAt: Date;
}

const aiReportSchema = new Schema<IAIReport>(
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
    reportType: {
      type: String,
      enum: [
        'FULL_KUNDLI_REPORT',
        'CAREER_REPORT',
        'MARRIAGE_REPORT',
        'EDUCATION_REPORT',
        'FINANCE_REPORT',
        'YEARLY_FORECAST',
        'DASHA_REPORT',
        'TRANSIT_REPORT',
        'COMPATIBILITY_REPORT',
      ],
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    summary: {
      type: String,
      required: true,
    },
    sections: [
      {
        title: { type: String, required: true },
        subtitle: { type: String },
        content: { type: String, required: true },
        astrologicalFactors: [{ type: String }],
        score: { type: Number },
      },
    ],
    disclaimers: [{ type: String }],
    calculationVersion: {
      type: String,
      default: '2.0.0',
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

aiReportSchema.index({ userId: 1, reportType: 1 });
aiReportSchema.index({ userId: 1, createdAt: -1 });

export const AIReport = mongoose.model<IAIReport>('AIReport', aiReportSchema);
