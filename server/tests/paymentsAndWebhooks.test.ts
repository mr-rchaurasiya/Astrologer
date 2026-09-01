import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app';
import { mockDb } from './setup';
import { PaymentService } from '../src/payments/payment.service';
import crypto from 'crypto';

describe('Phase 7: Payments, Razorpay Orders, Signatures & Webhook Idempotency', () => {
  const app = createApp();
  let userToken: string;
  let userId: string;

  beforeEach(async () => {
    mockDb.reset();
    const regRes = await request(app).post('/api/v1/auth/register').send({
      name: 'Cosmic Seeker',
      email: 'seeker@vedic.com',
      password: 'StrongPassword123!',
    });
    userToken = regRes.body.data.accessToken;
    userId = regRes.body.data.user.id;
  });

  it('GET /api/v1/payments/plans should list server-authoritative plans', async () => {
    const res = await request(app).get('/api/v1/payments/plans');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.plans.length).toBeGreaterThan(0);
    const premiumMonthly = res.body.data.plans.find((p: any) => p.planId === 'premium_monthly');
    expect(premiumMonthly).toBeDefined();
    expect(premiumMonthly.price).toBe(1900); // $19.00
  });

  it('POST /api/v1/payments/orders should create an authoritative payment order', async () => {
    const res = await request(app)
      .post('/api/v1/payments/orders')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ planId: 'premium_monthly' });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.orderId).toBeDefined();
    expect(res.body.data.amount).toBe(1900);
    expect(res.body.data.currency).toBe('USD');
  });

  it('POST /api/v1/payments/verify should verify payment and activate premium subscription', async () => {
    // 1. Create order
    const orderRes = await request(app)
      .post('/api/v1/payments/orders')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ planId: 'premium_monthly' });

    const orderId = orderRes.body.data.orderId;
    const paymentId = `pay_${Date.now()}`;

    // Generate valid HMAC signature
    const secret = process.env.RAZORPAY_KEY_SECRET || 'rzp_test_secret_key';
    const signature = crypto
      .createHmac('sha256', secret)
      .update(`${orderId}|${paymentId}`)
      .digest('hex');

    // 2. Verify payment
    const verifyRes = await request(app)
      .post('/api/v1/payments/verify')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        orderId,
        paymentId,
        signature,
      });

    expect(verifyRes.status).toBe(200);
    expect(verifyRes.body.success).toBe(true);
    expect(verifyRes.body.data.verified).toBe(true);
    expect(verifyRes.body.data.payment.status).toBe('captured');
  });

  it('POST /api/v1/payments/webhook should process captured payment and ignore duplicate events idempotently', async () => {
    // Create initial payment in DB
    const payment = await PaymentService.createPaymentOrder(userId, 'premium_yearly');

    const eventId = `evt_${Date.now()}`;
    const payload = {
      event_id: eventId,
      event: 'payment.captured',
      payload: {
        payment: {
          entity: {
            id: `pay_${Date.now()}`,
            order_id: payment.providerOrderId,
            amount: 14900,
            currency: 'USD',
            status: 'captured',
          },
        },
      },
    };

    const secret = process.env.RAZORPAY_WEBHOOK_SECRET || 'rzp_webhook_test_secret';
    const rawBody = JSON.stringify(payload);
    const signature = crypto.createHmac('sha256', secret).update(rawBody).digest('hex');

    // 1. First webhook submission
    const res1 = await request(app)
      .post('/api/v1/payments/webhook')
      .set('x-razorpay-signature', signature)
      .set('Content-Type', 'application/json')
      .send(rawBody);

    expect(res1.status).toBe(200);
    expect(res1.body.success).toBe(true);

    // 2. Duplicate webhook submission (Idempotency)
    const res2 = await request(app)
      .post('/api/v1/payments/webhook')
      .set('x-razorpay-signature', signature)
      .set('Content-Type', 'application/json')
      .send(rawBody);

    expect(res2.status).toBe(200);
    expect(res2.body.success).toBe(true);
    expect(res2.body.processed).toBe(false);
  });

  it('POST /api/v1/subscription/cancel should safely cancel an active subscription', async () => {
    const cancelRes = await request(app)
      .post('/api/v1/subscription/cancel')
      .set('Authorization', `Bearer ${userToken}`);

    expect(cancelRes.status).toBe(200);
    expect(cancelRes.body.success).toBe(true);
    expect(cancelRes.body.data.plan).toBe('free');
  });
});
