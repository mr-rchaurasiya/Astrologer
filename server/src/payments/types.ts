export interface CreateOrderOptions {
  userId: string;
  planId: string;
  amount: number; // in cents or currency minor units
  currency: string;
  receipt: string;
  notes?: Record<string, string>;
}

export interface CreateOrderResult {
  orderId: string;
  amount: number;
  currency: string;
  keyId?: string;
}

export interface VerifyPaymentOptions {
  orderId: string;
  paymentId: string;
  signature: string;
}

export interface VerifyPaymentResult {
  verified: boolean;
  orderId: string;
  paymentId: string;
  amount?: number;
  currency?: string;
}

export interface WebhookVerificationOptions {
  rawBody: string | Buffer;
  signature: string;
}

export interface WebhookEventPayload {
  eventId: string;
  eventType: string;
  orderId?: string;
  paymentId?: string;
  amount?: number;
  currency?: string;
  status?: string;
  raw: any;
}

export interface PaymentProvider {
  name: string;
  isConfigured(): boolean;
  createOrder(options: CreateOrderOptions): Promise<CreateOrderResult>;
  verifyPayment(options: VerifyPaymentOptions): Promise<VerifyPaymentResult>;
  verifyWebhook(options: WebhookVerificationOptions): Promise<{ verified: boolean; payload?: WebhookEventPayload }>;
}
