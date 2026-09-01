import crypto from 'crypto';
import { Referral, IReferral } from '../models/Referral';
import { User } from '../models/User';

export class ReferralService {
  public static async getOrCreateReferralCode(userId: string): Promise<string> {
    const existing = await Referral.findOne({ referrerId: userId as any });
    if (existing) {
      return existing.referralCode;
    }

    const randomSuffix = crypto.randomBytes(3).toString('hex').toUpperCase();
    const code = `VEDIC-${randomSuffix}`;

    await Referral.create({
      referrerId: userId,
      referralCode: code,
      status: 'pending',
    });

    return code;
  }

  public static async claimReferral(
    referralCode: string,
    referredUserId: string
  ): Promise<{ success: boolean; message: string }> {
    if (!referralCode || typeof referralCode !== 'string') {
      return { success: false, message: 'Referral code is required' };
    }

    const cleanCode = referralCode.trim().toUpperCase();
    const referral = await Referral.findOne({ referralCode: cleanCode });

    if (!referral) {
      return { success: false, message: 'Invalid referral code' };
    }

    // Prevent self-referral
    if (referral.referrerId.toString() === referredUserId.toString()) {
      return { success: false, message: 'You cannot refer yourself' };
    }

    // Check if user has already claimed a referral
    const alreadyReferred = await Referral.findOne({ referredUserId: referredUserId as any });
    if (alreadyReferred) {
      return { success: false, message: 'You have already applied a referral code' };
    }

    // Create a referral conversion entry
    await Referral.create({
      referrerId: referral.referrerId,
      referredUserId,
      referralCode: cleanCode,
      status: 'converted',
      convertedAt: new Date(),
      rewardType: 'free_credits',
      rewardGranted: true,
    });

    return { success: true, message: 'Referral applied successfully! Bonus credits awarded.' };
  }

  public static async getReferralStats(userId: string): Promise<{
    referralCode: string;
    referralLink: string;
    totalReferrals: number;
    convertedReferrals: number;
    rewardsEarned: number;
  }> {
    const code = await this.getOrCreateReferralCode(userId);

    const convertedCount = await Referral.countDocuments({
      referrerId: userId as any,
      status: { $in: ['converted', 'rewarded'] },
    });

    return {
      referralCode: code,
      referralLink: `https://astrologer.app/register?ref=${code}`,
      totalReferrals: convertedCount,
      convertedReferrals: convertedCount,
      rewardsEarned: convertedCount * 5, // 5 bonus questions per conversion
    };
  }
}
