export interface SubscriptionPlanDefinition {
  planId: string;
  name: string;
  tier: 'free' | 'premium';
  price: number;
  displayPrice: number;
  currency: string;
  billingPeriod?: 'monthly' | 'yearly';
  active: boolean;
  features: string[];
  limits: Record<string, any>;
}

export interface PaymentOrderResponse {
  orderId: string;
  amount: number;
  currency: string;
  keyId?: string;
  planId: string;
  planName: string;
}

export interface PaymentRecord {
  id: string;
  provider: string;
  providerOrderId: string;
  providerPaymentId?: string;
  amount: number;
  currency: string;
  status: 'created' | 'authorized' | 'captured' | 'failed' | 'refunded' | 'cancelled';
  planId: string;
  billingPeriod?: 'monthly' | 'yearly';
  paidAt?: string;
  createdAt: string;
}
