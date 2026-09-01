import mongoose, { Document, Schema, Types } from 'mongoose';

export interface INotificationPreference extends Document {
  userId: Types.ObjectId;
  dailyInsight: boolean;
  transitEvents: boolean;
  subscription: boolean;
  payment: boolean;
  report: boolean;
  emailEnabled: boolean;
  inAppEnabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const notificationPreferenceSchema = new Schema<INotificationPreference>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    dailyInsight: {
      type: Boolean,
      default: true,
    },
    transitEvents: {
      type: Boolean,
      default: true,
    },
    subscription: {
      type: Boolean,
      default: true,
    },
    payment: {
      type: Boolean,
      default: true,
    },
    report: {
      type: Boolean,
      default: true,
    },
    emailEnabled: {
      type: Boolean,
      default: true,
    },
    inAppEnabled: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_, ret: any) => {
        ret.id = ret._id ? ret._id.toString() : '';
        if (ret.userId) ret.userId = ret.userId.toString();
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

export const NotificationPreference = mongoose.model<INotificationPreference>(
  'NotificationPreference',
  notificationPreferenceSchema
);
