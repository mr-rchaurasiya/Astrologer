import { Payment, IPayment } from '../models/Payment';
import { resolvePlanById } from '../subscription/plans';
import { getPaymentProvider } from './provider';
import { SubscriptionService } from '../subscription/subscription.service';
import { AuditLog } from '../models/AuditLog';

export class PaymentService {
  public static async createPaymentOrder(
    userId: string,
    planId: string
  ): Promise<{
    orderId: string;
    amount: number;
    currency: string;
    keyId?: string;
    planId: string;
    planName: string;
  }> {
    const plan = resolvePlanById(planId);
    if (!plan || plan.tier === 'free') {
      throw new Error(`Invalid plan for purchase: ${planId}`);
    }

    const provider = getPaymentProvider();
    const receipt = `rcpt_${userId.slice(-6)}_${Date.now()}`;

    const orderResult = await provider.createOrder({
      userId,
      planId: plan.planId,
      amount: plan.price,
      currency: plan.currency,
      receipt,
      notes: {
        userId,
        planId: plan.planId,
        billingPeriod: plan.billingPeriod || 'monthly',
      },
    });

    // Persist local payment record
    await Payment.create({
      userId,
      provider: provider.name as any,
      providerOrderId: orderResult.orderId,
      amount: orderResult.amount,
      currency: orderResult.currency,
      status: 'created',
      planId: plan.planId,
      billingPeriod: plan.billingPeriod,
    });

    await AuditLog.create({
      userId,
      action: 'PAYMENT_ORDER_CREATED',
      resource: 'Payment',
      resourceId: orderResult.orderId,
      metadata: { planId: plan.planId, amount: orderResult.amount, currency: orderResult.currency },
    });

    return {
      orderId: orderResult.orderId,
      amount: orderResult.amount,
      currency: orderResult.currency,
      keyId: orderResult.keyId,
      planId: plan.planId,
      planName: plan.name,
    };
  }

  public static async verifyAndCapturePayment(
    userId: string,
    orderId: string,
    paymentId: string,
    signature: string
  ): Promise<{ success: boolean; payment: IPayment }> {
    const payment = await Payment.findOne({
      userId,
      providerOrderId: orderId,
    });

    if (!payment) {
      throw new Error(`Payment order not found for user: ${orderId}`);
    }

    if (payment.status === 'captured') {
      return { success: true, payment };
    }

    const provider = getPaymentProvider();
    const verification = await provider.verifyPayment({
      orderId,
      paymentId,
      signature,
    });

    if (!verification.verified) {
      payment.status = 'failed';
      payment.providerPaymentId = paymentId;
      payment.providerSignature = signature;
      await payment.save();

      await AuditLog.create({
        userId,
        action: 'PAYMENT_VERIFICATION_FAILED',
        resource: 'Payment',
        resourceId: payment.id,
        metadata: { orderId, paymentId },
      });

      throw new Error('Payment signature verification failed.');
    }

    payment.status = 'captured';
    payment.providerPaymentId = paymentId;
    payment.providerSignature = signature;
    payment.paidAt = new Date();
    await payment.save();

    // Activate subscription
    const plan = resolvePlanById(payment.planId);
    const durationDays = plan?.billingPeriod === 'yearly' ? 365 : 30;

    await SubscriptionService.upgradeSubscription(userId, 'premium', durationDays);

    await AuditLog.create({
      userId,
      action: 'PAYMENT_CAPTURED',
      resource: 'Payment',
      resourceId: payment.id,
      metadata: { orderId, paymentId, planId: payment.planId },
    });

    return { success: true, payment };
  }

  public static async getPaymentHistory(userId: string): Promise<IPayment[]> {
    return Payment.find({ userId }).sort({ createdAt: -1 });
  }
}
