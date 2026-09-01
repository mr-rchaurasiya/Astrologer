import { Payment, IPayment } from '../models/Payment';
import { Subscription, ISubscription } from '../models/Subscription';
import { AuditLog } from '../models/AuditLog';

export interface ReconciliationReport {
  timestamp: string;
  totalPaymentsAudited: number;
  capturedPayments: number;
  pendingOldOrders: number;
  mismatchedSubscriptions: number;
  fixedSubscriptions: number;
  details: {
    pendingOrderIds: string[];
    reconciledUserIds: string[];
  };
}

export class PaymentReconciliationService {
  /**
   * Audits all payments against active subscriptions and flags or resolves discrepancies
   */
  public static async runReconciliation(actorId: string = 'system_admin'): Promise<ReconciliationReport> {
    const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);
    const payments = await Payment.find().sort({ createdAt: -1 }).limit(500);

    let capturedCount = 0;
    let pendingOldCount = 0;
    const pendingOrderIds: string[] = [];
    const reconciledUserIds: string[] = [];

    for (const payment of payments) {
      if (payment.status === 'captured') {
        capturedCount++;

        // Verify user has active premium subscription
        const sub = await Subscription.findOne({ userId: payment.userId });
        if (!sub || sub.plan !== 'premium' || sub.status !== 'active') {
          // Fix subscription entitlement
          const durationDays = payment.billingPeriod === 'yearly' ? 365 : 30;
          const expiresAt = new Date(Date.now() + durationDays * 24 * 3600 * 1000);

          if (!sub) {
            await Subscription.create({
              userId: payment.userId,
              plan: 'premium',
              status: 'active',
              startedAt: new Date(),
              expiresAt,
            });
          } else {
            sub.plan = 'premium';
            sub.status = 'active';
            sub.expiresAt = expiresAt;
            await sub.save();
          }

          reconciledUserIds.push(payment.userId.toString());
        }
      } else if (payment.status === 'created' && payment.createdAt < thirtyMinutesAgo) {
        pendingOldCount++;
        pendingOrderIds.push(payment.providerOrderId);
      }
    }

    const report: ReconciliationReport = {
      timestamp: new Date().toISOString(),
      totalPaymentsAudited: payments.length,
      capturedPayments: capturedCount,
      pendingOldOrders: pendingOldCount,
      mismatchedSubscriptions: reconciledUserIds.length,
      fixedSubscriptions: reconciledUserIds.length,
      details: {
        pendingOrderIds,
        reconciledUserIds,
      },
    };

    await AuditLog.create({
      userId: actorId as any,
      action: 'PAYMENT_RECONCILIATION_EXECUTED',
      metadata: report,
    });

    return report;
  }
}
