export type FeatureFlagKey =
  | 'AI_MEMORY'
  | 'SMART_RECOMMENDATIONS'
  | 'ADVANCED_INSIGHTS'
  | 'VOICE_AI'
  | 'PDF_REPORTS'
  | 'DAILY_AI_INSIGHTS'
  | 'ANALYTICS'
  | 'PREMIUM_FEATURES'
  | 'PWA_ENABLED'
  | 'ADVANCED_CHART_STYLES'
  | 'KUNDLI_SHARING'
  | 'CONVERSATION_SUMMARIES'
  | 'SAVED_CONSULTATIONS'
  | 'COUPON_SYSTEM'
  | 'REFERRAL_SYSTEM'
  | 'AI_FEEDBACK'
  | 'ADVANCED_ANALYTICS';

export interface FeatureFlagDefinition {
  key: FeatureFlagKey;
  name: string;
  description: string;
  defaultEnabled: boolean;
  minPlanRequired?: 'free' | 'pro' | 'premium';
}

export const FEATURE_FLAGS: Record<FeatureFlagKey, FeatureFlagDefinition> = {
  AI_MEMORY: {
    key: 'AI_MEMORY',
    name: 'Personalized AI Memory',
    description: 'Stores conversational user preferences and contextual interests for personalized astrological consultation.',
    defaultEnabled: true,
    minPlanRequired: 'free',
  },
  SMART_RECOMMENDATIONS: {
    key: 'SMART_RECOMMENDATIONS',
    name: 'Intelligent Action Recommendations',
    description: 'Generates explainable, deterministic platform suggestions based on active Dasha and chart factors.',
    defaultEnabled: true,
    minPlanRequired: 'free',
  },
  ADVANCED_INSIGHTS: {
    key: 'ADVANCED_INSIGHTS',
    name: 'Multi-Chart Insight Correlation',
    description: 'Synthesizes D1, D9, D10, Lagna, Moon, and Dasha factors into structured observations.',
    defaultEnabled: true,
    minPlanRequired: 'free',
  },
  VOICE_AI: {
    key: 'VOICE_AI',
    name: 'Voice AI Consultation',
    description: 'Speech-to-text audio consultation and neural speech synthesis for horoscope audio.',
    defaultEnabled: true,
    minPlanRequired: 'pro',
  },
  PDF_REPORTS: {
    key: 'PDF_REPORTS',
    name: 'Vector PDF Horoscope Dossiers',
    description: 'Generates multi-page vector PDF horoscope reports with embedded North Indian SVG charts.',
    defaultEnabled: true,
    minPlanRequired: 'free',
  },
  DAILY_AI_INSIGHTS: {
    key: 'DAILY_AI_INSIGHTS',
    name: 'Daily Personalized Transit Insights',
    description: 'Generates cached daily planetary transit alignments customized to active Dasha and birth Moon.',
    defaultEnabled: true,
    minPlanRequired: 'free',
  },
  ANALYTICS: {
    key: 'ANALYTICS',
    name: 'Life Curve & Transit Analytics Hub',
    description: 'Multi-decade harmonic life curve trajectory and planetary transit timeline.',
    defaultEnabled: true,
    minPlanRequired: 'free',
  },
  PREMIUM_FEATURES: {
    key: 'PREMIUM_FEATURES',
    name: 'Premium Subscription Suite',
    description: 'High-frequency AI consultations, multi-profile tracking, and expedited ephemeris.',
    defaultEnabled: true,
    minPlanRequired: 'premium',
  },
  PWA_ENABLED: {
    key: 'PWA_ENABLED',
    name: 'Progressive Web App Mode',
    description: 'Enables mobile installability, offline caching, and responsive standalone display.',
    defaultEnabled: true,
    minPlanRequired: 'free',
  },
  ADVANCED_CHART_STYLES: {
    key: 'ADVANCED_CHART_STYLES',
    name: 'Multi-Style Kundli Visualizer',
    description: 'Renders North Indian Diamond, South Indian Box, and East Indian Bengali chart formats.',
    defaultEnabled: true,
    minPlanRequired: 'free',
  },
  KUNDLI_SHARING: {
    key: 'KUNDLI_SHARING',
    name: 'Secure Expiring Kundli Links',
    description: 'Allows generating privacy-safe, read-only public chart links with automated expiry.',
    defaultEnabled: true,
    minPlanRequired: 'free',
  },
  CONVERSATION_SUMMARIES: {
    key: 'CONVERSATION_SUMMARIES',
    name: 'AI Conversation Intelligence Summaries',
    description: 'Automatically creates structured consultation summaries of topics and remedies.',
    defaultEnabled: true,
    minPlanRequired: 'free',
  },
  SAVED_CONSULTATIONS: {
    key: 'SAVED_CONSULTATIONS',
    name: 'Saved Consultations & Bookmarks',
    description: 'Bookmarking, tagging, and archiving important astrological readings.',
    defaultEnabled: true,
    minPlanRequired: 'free',
  },
  COUPON_SYSTEM: {
    key: 'COUPON_SYSTEM',
    name: 'Coupon & Discount Engine',
    description: 'Server-authoritative promo codes and discount calculations for subscriptions.',
    defaultEnabled: true,
    minPlanRequired: 'free',
  },
  REFERRAL_SYSTEM: {
    key: 'REFERRAL_SYSTEM',
    name: 'Referral & Invitation Rewards',
    description: 'Unique user invite codes and conversion rewards.',
    defaultEnabled: true,
    minPlanRequired: 'free',
  },
  AI_FEEDBACK: {
    key: 'AI_FEEDBACK',
    name: 'AI Response Quality Feedback',
    description: 'Submits user sentiment ratings for continuous consultation refinement.',
    defaultEnabled: true,
    minPlanRequired: 'free',
  },
  ADVANCED_ANALYTICS: {
    key: 'ADVANCED_ANALYTICS',
    name: 'Platform Product Analytics',
    description: 'Event telemetry and usage metrics for user journey insights.',
    defaultEnabled: true,
    minPlanRequired: 'free',
  },
};
