import { ApiClient } from './api';

export interface ReferralStats {
  referralCode: string;
  totalReferrals: number;
  convertedReferrals: number;
  rewardsEarned: number;
}

export class ReferralApi {
  public static async getMyReferralStats(): Promise<{ success: boolean; data?: ReferralStats }> {
    const res = await ApiClient.fetchWithAuth<ReferralStats>('/referrals/me');
    return res;
  }

  public static async claimReferral(code: string): Promise<{ success: boolean; message?: string }> {
    const res = await ApiClient.fetchWithAuth<{ claimed: boolean }>('/referrals/claim', {
      method: 'POST',
      body: JSON.stringify({ code }),
    });
    return res;
  }
}
