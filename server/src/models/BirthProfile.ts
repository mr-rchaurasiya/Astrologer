import mongoose, { Document, Schema, Model } from 'mongoose';

export type RelationshipType = 'self' | 'partner' | 'parent' | 'child' | 'sibling' | 'friend' | 'other';
export type GenderType = 'male' | 'female' | 'other' | 'undisclosed';

export interface IBirthProfile extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  name: string;
  relationship: RelationshipType;
  dateOfBirth: string; // YYYY-MM-DD
  timeOfBirth: string; // HH:mm or HH:mm:ss
  placeName: string;
  latitude: number;
  longitude: number;
  timezone: string;
  timezoneOffset: number; // in hours from UTC, e.g. +5.5
  gender: GenderType;
  isPrimary: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const BirthProfileSchema = new Schema<IBirthProfile>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required'],
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Profile name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters long'],
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    relationship: {
      type: String,
      enum: ['self', 'partner', 'parent', 'child', 'sibling', 'friend', 'other'],
      default: 'self',
    },
    dateOfBirth: {
      type: String,
      required: [true, 'Date of birth is required'],
      match: [/^\d{4}-\d{2}-\d{2}$/, 'Date of birth must be in YYYY-MM-DD format'],
    },
    timeOfBirth: {
      type: String,
      required: [true, 'Time of birth is required'],
      match: [/^\d{2}:\d{2}(:\d{2})?$/, 'Time of birth must be in HH:mm or HH:mm:ss format'],
    },
    placeName: {
      type: String,
      required: [true, 'Birth place name is required'],
      trim: true,
      maxlength: [200, 'Place name cannot exceed 200 characters'],
    },
    latitude: {
      type: Number,
      required: [true, 'Latitude is required'],
      min: [-90, 'Latitude must be between -90 and 90 degrees'],
      max: [90, 'Latitude must be between -90 and 90 degrees'],
    },
    longitude: {
      type: Number,
      required: [true, 'Longitude is required'],
      min: [-180, 'Longitude must be between -180 and 180 degrees'],
      max: [180, 'Longitude must be between -180 and 180 degrees'],
    },
    timezone: {
      type: String,
      required: [true, 'Timezone is required'],
      trim: true,
      default: 'UTC',
    },
    timezoneOffset: {
      type: Number,
      required: true,
      default: 0,
      min: [-12, 'Timezone offset must be >= -12'],
      max: [14, 'Timezone offset must be <= +14'],
    },
    gender: {
      type: String,
      enum: ['male', 'female', 'other', 'undisclosed'],
      default: 'undisclosed',
    },
    isPrimary: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (doc, ret: any) => {
        ret.id = ret._id ? ret._id.toString() : '';
        if (ret.userId) {
          ret.userId = ret.userId.toString();
        }
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Indexes
BirthProfileSchema.index({ userId: 1, isPrimary: 1 });
BirthProfileSchema.index({ userId: 1, createdAt: -1 });

export const BirthProfile: Model<IBirthProfile> =
  mongoose.models.BirthProfile || mongoose.model<IBirthProfile>('BirthProfile', BirthProfileSchema);
