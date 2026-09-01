export interface PlanDefinition {
  id: string;
  name: string;
  tier: 'free' | 'pro' | 'premium';
  billingInterval: 'monthly' | 'annual' | 'lifetime' | 'none';
  priceInr: number;
  originalPriceInr?: number;
  currency: 'INR';
  description: string;
  features: string[];
  quotas: {
    birthProfiles: number;
    dailyAiQuestions: number;
    pdfReports: number;
    voiceConsultationMinutes: number;
  };
  trialDays?: number;
  isPopular?: boolean;
}

export const SUBSCRIPTION_PLANS: Record<string, PlanDefinition> = {
  free: {
    id: 'free',
    name: 'Cosmic Free',
    tier: 'free',
    billingInterval: 'none',
    priceInr: 0,
    currency: 'INR',
    description: 'Basic natal chart calculation and introductory AI consultations.',
    features: [
      '1 Birth Profile',
      '5 Daily AI Astrology Questions',
      'North, South & East Indian Chart Views',
      'Basic D1 Rashi & D9 Navamsha Charts',
      'Standard Panchang & Muhurta Info',
    ],
    quotas: {
      birthProfiles: 1,
      dailyAiQuestions: 5,
      pdfReports: 0,
      voiceConsultationMinutes: 0,
    },
  },
  pro_monthly: {
    id: 'pro_monthly',
    name: 'Cosmic Pro (Monthly)',
    tier: 'pro',
    billingInterval: 'monthly',
    priceInr: 499,
    originalPriceInr: 799,
    currency: 'INR',
    description: 'Enhanced astrological intelligence with multi-decade Life Curve & Voice AI.',
    features: [
      'Up to 5 Birth Profiles',
      '50 Daily AI Astrology Questions',
      'Multi-decade Life Curve & Transit Timeline',
      '3 High-Res PDF Horoscope Dossiers / month',
      '15 Minutes Voice AI Consultation',
      'Personalized AI Memory & Preferences',
    ],
    quotas: {
      birthProfiles: 5,
      dailyAiQuestions: 50,
      pdfReports: 3,
      voiceConsultationMinutes: 15,
    },
    isPopular: true,
  },
  pro_annual: {
    id: 'pro_annual',
    name: 'Cosmic Pro (Annual)',
    tier: 'pro',
    billingInterval: 'annual',
    priceInr: 3999,
    originalPriceInr: 5988,
    currency: 'INR',
    description: 'Annual Cosmic Pro pass with 33% discount and priority AI processing.',
    features: [
      'All Cosmic Pro Features',
      'Save 33% over monthly billing',
      '36 PDF Horoscope Reports / year',
      '180 Minutes Voice AI Consultation',
    ],
    quotas: {
      birthProfiles: 5,
      dailyAiQuestions: 50,
      pdfReports: 36,
      voiceConsultationMinutes: 180,
    },
  },
  premium_monthly: {
    id: 'premium_monthly',
    name: 'Cosmic Premium (Monthly)',
    tier: 'premium',
    billingInterval: 'monthly',
    priceInr: 999,
    originalPriceInr: 1499,
    currency: 'INR',
    description: 'Unlimited astrological consultations, unlimited PDF dossiers, and priority Voice AI.',
    features: [
      'Unlimited Birth Profiles',
      'Unlimited AI Astrology Consultations',
      'Unlimited PDF Horoscope Dossiers',
      '60 Minutes Voice AI Consultation / month',
      'All Divisional Charts (D1, D9, D10, D60)',
      'VIP Priority AI Provider Route',
    ],
    quotas: {
      birthProfiles: 100,
      dailyAiQuestions: 1000,
      pdfReports: 100,
      voiceConsultationMinutes: 60,
    },
  },
  premium_annual: {
    id: 'premium_annual',
    name: 'Cosmic Premium (Annual)',
    tier: 'premium',
    billingInterval: 'annual',
    priceInr: 7999,
    originalPriceInr: 11988,
    currency: 'INR',
    description: 'Complete annual mastery with unlimited consultations and dedicated Jyotish model.',
    features: [
      'All Cosmic Premium Features',
      'Save 33% over monthly billing',
      '720 Minutes Voice AI Consultation / year',
      'Early access to all upcoming planetary tools',
    ],
    quotas: {
      birthProfiles: 100,
      dailyAiQuestions: 1000,
      pdfReports: 500,
      voiceConsultationMinutes: 720,
    },
  },
};

export const getPlanById = (planId: string): PlanDefinition => {
  return SUBSCRIPTION_PLANS[planId] || SUBSCRIPTION_PLANS.free;
};
