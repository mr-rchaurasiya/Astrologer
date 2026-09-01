import { Types } from 'mongoose';
import { Affiliate, IAffiliate } from '../models/Affiliate';
import { AppError } from '../middleware/errorHandler';
import { Logger } from '../observability/logger';

export interface RegisterAffiliateInput {
  userId?: string;
  partnerName: string;
  email: string;
  customCode?: string;
  commissionPercentage?: number;
}

export class AffiliateService {
  /**
   * Generates a unique uppercase affiliate referral code
   */
  public static generateCode(prefix = 'ASTRO'): string {
    const random = Math.random().toString(36).substring(2, 7).toUpperCase();
    return `${prefix}-${random}`;
  }

  /**
   * Registers a new affiliate partner
   */
  public static async registerAffiliate(input: RegisterAffiliateInput): Promise<IAffiliate> {
    const email = input.email.toLowerCase().trim();

    // Check if affiliate exists
    const existing = await Affiliate.findOne({ email });
    if (existing) {
      return existing;
    }

    let affiliateCode = input.customCode ? input.customCode.toUpperCase().trim() : this.generateCode();

    // Check code collision
    const codeCollision = await Affiliate.findOne({ affiliateCode });
    if (codeCollision) {
      affiliateCode = this.generateCode();
    }

    const affiliate = await Affiliate.create({
      userId: input.userId ? new Types.ObjectId(input.userId) : undefined,
      partnerName: input.partnerName.trim(),
      email,
      affiliateCode,
      commissionPercentage: input.commissionPercentage || 20,
      totalClicks: 0,
      totalConversions: 0,
      totalEarnings: 0,
      payoutStatus: 'active',
      attributionWindowDays: 30,
    });

    Logger.info(`Affiliate partner registered: ${affiliate.partnerName} [${affiliate.affiliateCode}]`);
    return affiliate;
  }

  /**
   * Tracks an affiliate link click
   */
  public static async recordClick(code: string): Promise<boolean> {
    const affiliate = await Affiliate.findOne({ affiliateCode: code.toUpperCase().trim(), payoutStatus: 'active' });
    if (!affiliate) {
      return false;
    }

    affiliate.totalClicks = (affiliate.totalClicks || 0) + 1;
    await affiliate.save();
    return true;
  }

  /**
   * Records a successful paid conversion attributed to an affiliate
   */
  public static async recordConversion(code: string, orderAmount: number): Promise<{ success: boolean; commission: number }> {
    const affiliate = await Affiliate.findOne({ affiliateCode: code.toUpperCase().trim() });
    if (!affiliate || affiliate.payoutStatus !== 'active') {
      return { success: false, commission: 0 };
    }

    const commission = Math.round((orderAmount * (affiliate.commissionPercentage || 20)) / 100);

    affiliate.totalConversions = (affiliate.totalConversions || 0) + 1;
    affiliate.totalEarnings = (affiliate.totalEarnings || 0) + commission;
    await affiliate.save();

    Logger.info(`Affiliate conversion recorded for [${affiliate.affiliateCode}]: Commission = ₹${commission / 100}`);
    return { success: true, commission };
  }

  /**
   * Retrieves affiliate profile & stats by user ID
   */
  public static async getAffiliateByUserId(userId: string): Promise<IAffiliate | null> {
    return Affiliate.findOne({ userId: new Types.ObjectId(userId) });
  }

  /**
   * Admin list of all affiliate partners
   */
  public static async getAllAffiliates(page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [affiliates, total] = await Promise.all([
      Affiliate.find().sort({ totalEarnings: -1, createdAt: -1 }).skip(skip).limit(limit),
      Affiliate.countDocuments(),
    ]);

    return {
      affiliates,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}
