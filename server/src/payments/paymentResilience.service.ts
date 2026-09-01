import { Payment } from '../models/Payment';
import { WebhookEvent } from '../models/WebhookEvent';
import { Subscription } from '../models/Subscription';
import { DistributedLock } from '../utils/distributedLock';
import { Logger } from '../observability/logger';

export class PaymentResilienceService {
  /**
   * Validates webhook idempotency and rejects replay attacks.
   */
  public static async isWebhookProcessed(eventId: string): Promise<boolean> {
    if (!eventId) return false;
    const existing = await WebhookEvent.findOne({ eventId });
    return !!existing;
  }

  /**
   * Records processed webhook to prevent duplicate event execution.
   */
  public static async recordWebhookEvent(eventId: string, eventType: string, payload: any): Promise<void> {
    try {
      await WebhookEvent.create({
        eventId,
        eventType,
        payload,
        processedAt: new Date(),
      });
    } catch {
      // In-memory or unique index collision handled gracefully
    }
  }

  /**
   * Executes payment verification with distributed locking to prevent duplicate credit/subscription activation.
   */
  public static async processPaymentSafely<T>(
    orderId: string,
    handler: () => Promise<T>
  ): Promise<{ success: boolean; result?: T; duplicate?: boolean }> {
    const lockKey = `payment:order:${orderId}`;
    const ownerId = `worker_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    return await DistributedLock.withLock(
      lockKey,
      ownerId,
      async () => {
        // Check if payment was already recorded
        const existing = await Payment.findOne({ orderId, status: 'captured' });
        if (existing) {
          Logger.warn(`⚠️ Payment order ${orderId} already captured. Skipping duplicate processing.`);
          return { success: true, duplicate: true };
        }

        const result = await handler();
        return { success: true, result, duplicate: false };
      },
      { ttlSeconds: 15, maxRetries: 3 }
    );
  }

  /**
   * Reconciles subscription state against captured payments.
   */
  public static async reconcileSubscriptionState(userId: string): Promise<boolean> {
    const latestCaptured = await Payment.findOne({ userId, status: 'captured' }).sort({ createdAt: -1 });
    if (!latestCaptured) return false;

    const sub = await Subscription.findOne({ userId });
    if (!sub || sub.status !== 'active') {
      await Subscription.findOneAndUpdate(
        { userId },
        { status: 'active', plan: 'premium', startedAt: latestCaptured.createdAt },
        { upsert: true }
      );
      Logger.info(`🔄 Reconciled active subscription for user: ${userId} based on captured payment.`);
      return true;
    }
    return true;
  }
}
