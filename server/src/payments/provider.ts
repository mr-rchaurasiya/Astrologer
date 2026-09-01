import { PaymentProvider } from './types';
import { RazorpayProvider } from './razorpay.provider';

let defaultProvider: PaymentProvider | null = null;

export const getPaymentProvider = (): PaymentProvider => {
  if (!defaultProvider) {
    defaultProvider = new RazorpayProvider();
  }
  return defaultProvider;
};

export const setPaymentProvider = (provider: PaymentProvider) => {
  defaultProvider = provider;
};
