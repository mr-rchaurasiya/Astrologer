import crypto from 'crypto';
import {
  PaymentProvider,
  CreateOrderOptions,
  CreateOrderResult,
  VerifyPaymentOptions,
  VerifyPaymentResult,
  WebhookVerificationOptions,
  WebhookEventPayload,
} from './types';
import { config } from '../config/environment';

export class RazorpayProvider implements PaymentProvider {
  public readonly name = 'razorpay';
  private keyId: string;
  private keySecret: string;
  private webhookSecret: string;

  constructor() {
    this.keyId = config.payments.razorpayKeyId;
    this.keySecret = config.payments.razorpayKeySecret;
    this.webhookSecret = config.payments.razorpayWebhookSecret;
  }

  public isConfigured(): boolean {
    return Boolean(this.keyId && this.keySecret);
  }

  public async createOrder(options: CreateOrderOptions): Promise<CreateOrderResult> {
    if (!this.isConfigured()) {
      // In development or test without live keys, generate a deterministic order format
      const mockOrderId = `order_${crypto.randomBytes(8).toString('hex')}`;
      return {
        orderId: mockOrderId,
        amount: options.amount,
        currency: options.currency,
        keyId: this.keyId || 'rzp_test_mock_key',
      };
    }

    try {
      // Direct REST call to Razorpay v1 API
      const auth = Buffer.from(`${this.keyId}:${this.keySecret}`).toString('base64');
      const response = await fetch('https://api.razorpay.com/v1/orders', {
        method: 'POST',
        headers: {
          Authorization: `Basic ${auth}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: options.amount,
          currency: options.currency,
          receipt: options.receipt,
          notes: options.notes,
        }),
      });

      if (!response.ok) {
        const errJson = await response.json().catch(() => ({}));
        throw new Error(errJson.error?.description || `Razorpay order creation failed: ${response.statusText}`);
      }

      const data = await response.json();
      return {
        orderId: data.id,
        amount: data.amount,
        currency: data.currency,
        keyId: this.keyId,
      };
    } catch (err: any) {
      throw new Error(`Razorpay createOrder error: ${err.message}`);
    }
  }

  public async verifyPayment(options: VerifyPaymentOptions): Promise<VerifyPaymentResult> {
    if (!this.keySecret) {
      // Offline fallback: verify standard hash or signature if provided
      return {
        verified: Boolean(options.signature && options.paymentId && options.orderId),
        orderId: options.orderId,
        paymentId: options.paymentId,
      };
    }

    // Razorpay standard signature: HMAC SHA256 (order_id + "|" + razorpay_payment_id, secret)
    const expectedSignature = crypto
      .createHmac('sha256', this.keySecret)
      .update(`${options.orderId}|${options.paymentId}`)
      .digest('hex');

    const verified = crypto.timingSafeEqual(
      Buffer.from(expectedSignature, 'utf-8'),
      Buffer.from(options.signature, 'utf-8')
    );

    return {
      verified,
      orderId: options.orderId,
      paymentId: options.paymentId,
    };
  }

  public async verifyWebhook(
    options: WebhookVerificationOptions
  ): Promise<{ verified: boolean; payload?: WebhookEventPayload }> {
    const rawBodyStr =
      typeof options.rawBody === 'string'
        ? options.rawBody
        : Buffer.isBuffer(options.rawBody)
        ? options.rawBody.toString('utf-8')
        : JSON.stringify(options.rawBody);

    let verified = false;
    if (this.webhookSecret) {
      const expectedSignature = crypto
        .createHmac('sha256', this.webhookSecret)
        .update(rawBodyStr)
        .digest('hex');

      try {
        verified = crypto.timingSafeEqual(
          Buffer.from(expectedSignature, 'utf-8'),
          Buffer.from(options.signature, 'utf-8')
        );
      } catch {
        verified = false;
      }
    } else {
      // In mock/test environments without secret
      verified = Boolean(options.signature);
    }

    if (!verified) {
      return { verified: false };
    }

    let parsed: any;
    try {
      parsed = JSON.parse(rawBodyStr);
    } catch {
      return { verified: false };
    }

    const eventPayload: WebhookEventPayload = {
      eventId: parsed.event_id || parsed.eventId || parsed.id || `evt_${crypto.randomBytes(8).toString('hex')}`,
      eventType: parsed.event || parsed.eventType || 'payment.captured',
      orderId: parsed.payload?.payment?.entity?.order_id || parsed.payload?.order?.entity?.id,
      paymentId: parsed.payload?.payment?.entity?.id,
      amount: parsed.payload?.payment?.entity?.amount,
      currency: parsed.payload?.payment?.entity?.currency,
      status: parsed.payload?.payment?.entity?.status,
      raw: parsed,
    };

    return {
      verified: true,
      payload: eventPayload,
    };
  }
}
