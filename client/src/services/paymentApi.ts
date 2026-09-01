import { ApiSuccessResponse } from '../types';
import { SubscriptionPlanDefinition, PaymentOrderResponse, PaymentRecord } from '../types/payments';
import { UserSubscriptionSummary } from '../types/subscription';

export class PaymentApi {
  public static async getPlans(): Promise<ApiSuccessResponse<{ plans: SubscriptionPlanDefinition[] }>> {
    const res = await fetch('/api/v1/payments/plans', {
      headers: { Accept: 'application/json' },
    });
    return res.json();
  }

  public static async createOrder(planId: string): Promise<ApiSuccessResponse<PaymentOrderResponse>> {
    const token = localStorage.getItem('astrologer_access_token');
    const res = await fetch('/api/v1/payments/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ planId }),
    });
    return res.json();
  }

  public static async verifyPayment(payload: {
    orderId: string;
    paymentId: string;
    signature: string;
  }): Promise<ApiSuccessResponse<{ verified: boolean; payment: PaymentRecord }>> {
    const token = localStorage.getItem('astrologer_access_token');
    const res = await fetch('/api/v1/payments/verify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });
    return res.json();
  }

  public static async getPaymentHistory(): Promise<ApiSuccessResponse<{ payments: PaymentRecord[]; count: number }>> {
    const token = localStorage.getItem('astrologer_access_token');
    const res = await fetch('/api/v1/payments/history', {
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });
    return res.json();
  }

  public static async cancelSubscription(): Promise<ApiSuccessResponse<UserSubscriptionSummary>> {
    const token = localStorage.getItem('astrologer_access_token');
    const res = await fetch('/api/v1/subscription/cancel', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });
    return res.json();
  }
}
