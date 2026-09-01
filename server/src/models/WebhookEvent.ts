import mongoose, { Document, Schema } from 'mongoose';

export interface IWebhookEvent extends Document {
  provider: string;
  eventId: string;
  eventType: string;
  processed: boolean;
  payloadHash: string;
  processedAt?: Date;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

const webhookEventSchema = new Schema<IWebhookEvent>(
  {
    provider: {
      type: String,
      required: true,
    },
    eventId: {
      type: String,
      required: true,
    },
    eventType: {
      type: String,
      required: true,
    },
    processed: {
      type: Boolean,
      default: false,
    },
    payloadHash: {
      type: String,
      required: true,
    },
    processedAt: {
      type: Date,
    },
    metadata: {
      type: Schema.Types.Mixed,
    },
  },
  {
    timestamps: true,
  }
);

// Unique compound index preventing double processing / replay
webhookEventSchema.index({ provider: 1, eventId: 1 }, { unique: true });
webhookEventSchema.index({ createdAt: -1 });

export const WebhookEvent = mongoose.model<IWebhookEvent>('WebhookEvent', webhookEventSchema);
