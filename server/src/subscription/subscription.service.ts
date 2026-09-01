import { Subscription, ISubscription, SubscriptionPlan } from '../models/Subscription';
import { UsageRecord, TrackedFeature, IUsageRecord } from '../models/UsageRecord';
import { PLAN_ENTITLEMENTS, getFeatureDailyLimit, PlanEntitlements } from './entitlements';

export interface UserSubscriptionSummary {
  plan: SubscriptionPlan;
  status: string;
  isPremium: boolean;
  startedAt: string;
  expiresAt?: string;
  entitlements: PlanEntitlements;
  usageToday: {
    aiChatUsed: number;
    aiChatLimit: number;
    dailyInsightsUsed: number;
    dailyInsightsLimit: number;
  };
}

export class SubscriptionService {
  /**
   * Retrieves active subscription for a user or initializes a free tier
   */
  public static async getUserSubscription(userId: string): Promise<ISubscription> {
    let sub = await Subscription.findOne({ userId });
    if (!sub) {
      sub = await Subscription.create({
        userId,
        plan: 'free',
        status: 'active',
        startedAt: new Date(),
      });
    }

    // Check expiration for premium subscriptions
    if (sub.plan === 'premium' && sub.expiresAt && new Date() > sub.expiresAt) {
      sub.plan = 'free';
      sub.status = 'expired';
      await sub.save();
    }

    return sub;
  }

  /**
   * Atomically checks limit and increments feature usage
   */
  public static async checkAndIncrementUsage(
    userId: string,
    feature: TrackedFeature,
    targetDateStr: string = new Date().toISOString().split('T')[0]
  ): Promise<{ allowed: boolean; count: number; limit: number; remaining: number }> {
    const sub = await this.getUserSubscription(userId);
    const limit = getFeatureDailyLimit(sub.plan, feature);

    // Atomically find and update usage record
    let record = await UsageRecord.findOne({
      userId,
      feature,
      date: targetDateStr,
    });

    const currentCount = record ? record.count : 0;

    if (currentCount >= limit) {
      return {
        allowed: false,
        count: currentCount,
        limit,
        remaining: 0,
      };
    }

    // Atomically increment
    if (!record) {
      record = await UsageRecord.create({
        userId,
        feature,
        date: targetDateStr,
        count: 1,
      });
    } else {
      record.count += 1;
      await record.save();
    }

    return {
      allowed: true,
      count: record.count,
      limit,
      remaining: Math.max(0, limit - record.count),
    };
  }

  /**
   * Returns full subscription summary and current day quotas
   */
  public static async getSubscriptionSummary(userId: string): Promise<UserSubscriptionSummary> {
    const sub = await this.getUserSubscription(userId);
    const dateStr = new Date().toISOString().split('T')[0];
    const entitlements = PLAN_ENTITLEMENTS[sub.plan] || PLAN_ENTITLEMENTS.free;

    const [chatUsage, insightUsage] = await Promise.all([
      UsageRecord.findOne({ userId, feature: 'ai_chat', date: dateStr }),
      UsageRecord.findOne({ userId, feature: 'daily_insight', date: dateStr }),
    ]);

    const aiChatUsed = chatUsage ? chatUsage.count : 0;
    const dailyInsightsUsed = insightUsage ? insightUsage.count : 0;

    return {
      plan: sub.plan,
      status: sub.status,
      isPremium: sub.plan === 'premium' && sub.status === 'active',
      startedAt: sub.startedAt.toISOString(),
      expiresAt: sub.expiresAt ? sub.expiresAt.toISOString() : undefined,
      entitlements,
      usageToday: {
        aiChatUsed,
        aiChatLimit: entitlements.aiChatMessagesPerDay,
        dailyInsightsUsed,
        dailyInsightsLimit: entitlements.dailyInsightsPerDay,
      },
    };
  }

  /**
   * Upgrades subscription plan (mock / trial tier activation)
   */
  public static async upgradeSubscription(
    userId: string,
    plan: SubscriptionPlan = 'premium',
    durationDays = 30
  ): Promise<ISubscription> {
    let sub = await Subscription.findOne({ userId });
    const expiresAt = new Date(Date.now() + durationDays * 24 * 3600 * 1000);

    if (!sub) {
      sub = await Subscription.create({
        userId,
        plan,
        status: 'active',
        startedAt: new Date(),
        expiresAt,
      });
    } else {
      sub.plan = plan;
      sub.status = 'active';
      sub.expiresAt = expiresAt;
      await sub.save();
    }

    return sub;
  }
}
