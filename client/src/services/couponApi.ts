import { ApiClient } from './api';

export interface CouponValidationResponse {
  valid: boolean;
  code?: string;
  discountType?: 'percentage' | 'fixed';
  discountValue?: number;
  originalAmount?: number;
  discountAmount?: number;
  finalAmount?: number;
  message?: string;
}

export class CouponApi {
  public static async validate(code: string, planId: string): Promise<{ success: boolean; data?: CouponValidationResponse; error?: any }> {
    const res = await ApiClient.fetchWithAuth<CouponValidationResponse>('/coupons/validate', {
      method: 'POST',
      body: JSON.stringify({ code, planId }),
    });
    return res;
  }
}
