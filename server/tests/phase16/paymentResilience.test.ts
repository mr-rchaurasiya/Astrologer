import { describe, it, expect } from 'vitest';
import { PaymentResilienceService } from '../../src/payments/paymentResilience.service';
import '../setup';

describe('Phase 16: Payment Resilience & Webhook Idempotency Suite', () => {
  it('records webhook event and detects duplicate webhook replay safely', async () => {
    const eventId = `evt_test_${Date.now()}`;

    const isProcessedBefore = await PaymentResilienceService.isWebhookProcessed(eventId);
    expect(isProcessedBefore).toBe(false);

    await PaymentResilienceService.recordWebhookEvent(eventId, 'payment.captured', { orderId: 'order_123' });

    const isProcessedAfter = await PaymentResilienceService.isWebhookProcessed(eventId);
    expect(isProcessedAfter).toBe(true);
  });
});
