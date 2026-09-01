export type BillingPeriod = 'monthly' | 'yearly';
export type PlanTier = 'free' | 'premium';

export interface SubscriptionPlanDefinition {
  planId: string;
  name: string;
  tier: PlanTier;
  price: number; // in minor units (cents or paise) or standard units
  displayPrice: number; // in USD / INR standard units
  currency: string;
  billingPeriod?: BillingPeriod;
  active: boolean;
  features: string[];
  limits: {
    aiChatMessagesPerDay: number;
    dailyInsightsPerDay: number;
    lifeCurveMaxHorizonYears: number;
    transitLookaheadDays: number;
    allowHighResolutionLifeCurve: boolean;
    prioritySupport: boolean;
    voiceConsultationMinutesPerDay?: number;
    pdfReportsPerMonth?: number;
  };
}

export const SUBSCRIPTION_PLANS: Record<string, SubscriptionPlanDefinition> = {
  FREE: {
    planId: 'free',
    name: 'Seeker Free',
    tier: 'free',
    price: 0,
    displayPrice: 0,
    currency: 'USD',
    active: true,
    features: [
      '5 AI Consultations per day',
      '1 Personalized Daily Insight per day',
      'Full D1, D9, D10 Kundli Charts',
      '120-Year Vimshottari Dasha Hierarchy',
      '30-Year Life Curve Trajectory',
      '90-Day Transit Lookahead',
    ],
    limits: {
      aiChatMessagesPerDay: 5,
      dailyInsightsPerDay: 1,
      lifeCurveMaxHorizonYears: 30,
      transitLookaheadDays: 90,
      allowHighResolutionLifeCurve: false,
      prioritySupport: false,
      voiceConsultationMinutesPerDay: 0,
      pdfReportsPerMonth: 1,
    },
  },
  PREMIUM_MONTHLY: {
    planId: 'premium_monthly',
    name: 'Cosmic Premium Monthly',
    tier: 'premium',
    price: 1900, // $19.00 USD (in cents)
    displayPrice: 19,
    currency: 'USD',
    billingPeriod: 'monthly',
    active: true,
    features: [
      '100 AI Consultations per day',
      '20 Personalized Daily Insights per day',
      'Full 80-Year Life Curve Trajectory',
      '730-Day (2-Year) Transit Timeline',
      'High-Resolution Monthly Sampling',
      'Unlimited PDF Horoscope Reports',
      'Voice AI Consultation Access',
      'Priority Ephemeris Engine Access',
    ],
    limits: {
      aiChatMessagesPerDay: 100,
      dailyInsightsPerDay: 20,
      lifeCurveMaxHorizonYears: 100,
      transitLookaheadDays: 730,
      allowHighResolutionLifeCurve: true,
      prioritySupport: true,
      voiceConsultationMinutesPerDay: 30,
      pdfReportsPerMonth: 50,
    },
  },
  PREMIUM_YEARLY: {
    planId: 'premium_yearly',
    name: 'Cosmic Premium Annual',
    tier: 'premium',
    price: 14900, // $149.00 USD (in cents - ~35% discount)
    displayPrice: 149,
    currency: 'USD',
    billingPeriod: 'yearly',
    active: true,
    features: [
      '100 AI Consultations per day',
      '20 Personalized Daily Insights per day',
      'Full 80-Year Life Curve Trajectory',
      '730-Day (2-Year) Transit Timeline',
      'High-Resolution Monthly Sampling',
      'Unlimited PDF Horoscope Reports',
      'Voice AI Consultation Access',
      'Priority Ephemeris Engine Access',
      'Annual Astrological Forecast Dossier',
    ],
    limits: {
      aiChatMessagesPerDay: 100,
      dailyInsightsPerDay: 20,
      lifeCurveMaxHorizonYears: 100,
      transitLookaheadDays: 730,
      allowHighResolutionLifeCurve: true,
      prioritySupport: true,
      voiceConsultationMinutesPerDay: 60,
      pdfReportsPerMonth: 200,
    },
  },
};

export const resolvePlanById = (planId: string): SubscriptionPlanDefinition | null => {
  const normalized = planId.toLowerCase().trim();
  for (const key of Object.keys(SUBSCRIPTION_PLANS)) {
    const plan = SUBSCRIPTION_PLANS[key];
    if (plan.planId === normalized || key.toLowerCase() === normalized) {
      return plan;
    }
  }
  return null;
};
