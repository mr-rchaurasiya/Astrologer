import { SubscriptionPlan } from '../models/Subscription';
import { TrackedFeature } from '../models/UsageRecord';

export interface PlanEntitlements {
  aiChatMessagesPerDay: number;
  dailyInsightsPerDay: number;
  lifeCurveMaxHorizonYears: number;
  transitLookaheadDays: number;
  allowHighResolutionLifeCurve: boolean; // month resolution
  prioritySupport: boolean;
}

export const PLAN_ENTITLEMENTS: Record<SubscriptionPlan, PlanEntitlements> = {
  free: {
    aiChatMessagesPerDay: 5,
    dailyInsightsPerDay: 1,
    lifeCurveMaxHorizonYears: 30,
    transitLookaheadDays: 90,
    allowHighResolutionLifeCurve: false,
    prioritySupport: false,
  },
  premium: {
    aiChatMessagesPerDay: 100,
    dailyInsightsPerDay: 20,
    lifeCurveMaxHorizonYears: 100,
    transitLookaheadDays: 730,
    allowHighResolutionLifeCurve: true,
    prioritySupport: true,
  },
};

/**
 * Maps a tracked feature to its corresponding daily limit key
 */
export const getFeatureDailyLimit = (plan: SubscriptionPlan, feature: TrackedFeature): number => {
  const entitlements = PLAN_ENTITLEMENTS[plan] || PLAN_ENTITLEMENTS.free;

  switch (feature) {
    case 'ai_chat':
      return entitlements.aiChatMessagesPerDay;
    case 'daily_insight':
      return entitlements.dailyInsightsPerDay;
    case 'life_curve':
      return 100; // General access
    case 'transits':
      return 200; // General access
    default:
      return 10;
  }
};
