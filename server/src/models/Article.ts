import mongoose, { Document, Schema, Model } from 'mongoose';

export interface IArticle extends Document {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  author: string;
  category: 'kundli' | 'vedic-astrology' | 'dashas' | 'yogas' | 'transits' | 'compatibility' | 'ai-astrology';
  tags: string[];
  featuredImage?: string;
  seoTitle?: string;
  seoDescription?: string;
  canonicalUrl?: string;
  status: 'draft' | 'published';
  publishedAt?: Date;
  readTimeMinutes: number;
  viewCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const articleSchema = new Schema<IArticle>(
  {
    title: { type: String, required: true, trim: true, maxlength: 200 },
    slug: { type: String, required: true, unique: true, trim: true, lowercase: true, index: true },
    excerpt: { type: String, required: true, maxlength: 500 },
    content: { type: String, required: true },
    author: { type: String, required: true, default: 'Vedic Astrologer Editorial Team' },
    category: {
      type: String,
      required: true,
      enum: ['kundli', 'vedic-astrology', 'dashas', 'yogas', 'transits', 'compatibility', 'ai-astrology'],
      index: true,
    },
    tags: [{ type: String, trim: true }],
    featuredImage: { type: String },
    seoTitle: { type: String, maxlength: 70 },
    seoDescription: { type: String, maxlength: 160 },
    canonicalUrl: { type: String },
    status: { type: String, enum: ['draft', 'published'], default: 'draft', index: true },
    publishedAt: { type: Date },
    readTimeMinutes: { type: Number, default: 5 },
    viewCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

articleSchema.index({ status: 1, publishedAt: -1 });
articleSchema.index({ category: 1, status: 1, publishedAt: -1 });

export const Article: Model<IArticle> = mongoose.model<IArticle>('Article', articleSchema);
