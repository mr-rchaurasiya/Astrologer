export type SubscriptionPlan = 'free' | 'premium';
export type SubscriptionStatus = 'active' | 'expired' | 'cancelled';

export interface PlanEntitlements {
  aiChatMessagesPerDay: number;
  dailyInsightsPerDay: number;
  lifeCurveMaxHorizonYears: number;
  transitLookaheadDays: number;
  allowHighResolutionLifeCurve: boolean;
  prioritySupport: boolean;
}

export interface UserSubscriptionSummary {
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
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
