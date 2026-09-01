import crypto from 'crypto';
import { WebhookEvent } from '../models/WebhookEvent';
import { Payment } from '../models/Payment';
import { getPaymentProvider } from './provider';
import { SubscriptionService } from '../subscription/subscription.service';
import { resolvePlanById } from '../subscription/plans';
import { AuditLog } from '../models/AuditLog';

export class WebhookService {
  public static async processWebhook(
    rawBody: string | Buffer,
    signature: string
  ): Promise<{ received: boolean; processed: boolean; message: string }> {
    const rawBodyStr =
      typeof rawBody === 'string'
        ? rawBody
        : Buffer.isBuffer(rawBody)
        ? rawBody.toString('utf-8')
        : JSON.stringify(rawBody);
    const provider = getPaymentProvider();

    const verification = await provider.verifyWebhook({
      rawBody: rawBodyStr,
      signature,
    });

    if (!verification.verified || !verification.payload) {
      throw new Error('Invalid webhook signature.');
    }

    const payload = verification.payload;
    const payloadHash = crypto.createHash('sha256').update(rawBodyStr).digest('hex');

    // 1. Idempotency Check: Prevent replay / duplicate processing
    const existingEvent = await WebhookEvent.findOne({
      provider: provider.name,
      eventId: payload.eventId,
    });

    if (existingEvent) {
      return {
        received: true,
        processed: false,
        message: 'Duplicate webhook event already recorded.',
      };
    }

    // Record webhook event
    const webhookDoc = await WebhookEvent.create({
      provider: provider.name,
      eventId: payload.eventId,
      eventType: payload.eventType,
      processed: false,
      payloadHash,
      metadata: payload.raw,
    });

    // 2. Process specific payment events
    if (payload.eventType === 'payment.captured' || payload.eventType === 'order.paid') {
      if (payload.orderId) {
        const payment = await Payment.findOne({ providerOrderId: payload.orderId });
        if (payment && payment.status !== 'captured') {
          payment.status = 'captured';
          payment.providerPaymentId = payload.paymentId || payment.providerPaymentId;
          payment.paidAt = new Date();
          await payment.save();

          const plan = resolvePlanById(payment.planId);
          const durationDays = plan?.billingPeriod === 'yearly' ? 365 : 30;

          await SubscriptionService.upgradeSubscription(payment.userId.toString(), 'premium', durationDays);

          await AuditLog.create({
            userId: payment.userId.toString(),
            action: 'PAYMENT_WEBHOOK_CAPTURED',
            resource: 'Payment',
            resourceId: payment.id,
            metadata: { eventId: payload.eventId, orderId: payload.orderId },
          });
        }
      }
    } else if (payload.eventType === 'payment.failed') {
      if (payload.orderId) {
        const payment = await Payment.findOne({ providerOrderId: payload.orderId });
        if (payment) {
          payment.status = 'failed';
          await payment.save();

          await AuditLog.create({
            userId: payment.userId.toString(),
            action: 'PAYMENT_WEBHOOK_FAILED',
            resource: 'Payment',
            resourceId: payment.id,
            metadata: { eventId: payload.eventId, orderId: payload.orderId },
          });
        }
      }
    }

    webhookDoc.processed = true;
    webhookDoc.processedAt = new Date();
    await webhookDoc.save();

    return {
      received: true,
      processed: true,
      message: `Webhook event ${payload.eventType} processed successfully.`,
    };
  }
}
