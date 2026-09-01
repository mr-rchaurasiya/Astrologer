# Phase 6 Architecture: Advanced Analytics, Life Curve & Subscriptions

```text
┌────────────────────────────────────────────────────────┐
│               Client (React 18 + Vite)                │
│  - AnalyticsPage (/analytics)                         │
│  - LifeCurveChart & LifeCurveTooltip (SVG)             │
│  - TransitTimeline (Ingress & Station Feed)            │
│  - DailyInsightCard (Cached Category Tabs)             │
│  - SubscriptionPage (/subscription)                   │
│  - PremiumGuard & SubscriptionContext                  │
└───────────────────────────┬────────────────────────────┘
                            │
                            ▼
┌────────────────────────────────────────────────────────┐
│           Astrologer Express API Layer                 │
│  - requireAuth & User Ownership Middleware             │
│  - requireFeatureQuota (Atomic Usage Enforcement)      │
│  - AI Rate Limiter (aiRateLimiter)                     │
└───────────────────────────┬────────────────────────────┘
                            │
            ┌───────────────┴───────────────┐
            ▼                               ▼
┌────────────────────────┐      ┌────────────────────────┐
│ Astrology Engine       │      │ AI Consultation Layer  │
│ - LifeCurveGenerator   │      │ - DailyInsightService  │
│ - LifeCurveScoring     │      │ - AIService & Provider │
│ - TransitEventDetector │      │ - Structured Context   │
└───────────┬────────────┘      └───────────┬────────────┘
            │                               │
            └───────────────┬───────────────┘
                            ▼
┌────────────────────────────────────────────────────────┐
│               MongoDB Persistence Layer                │
│  - Users & BirthProfiles (Ownership Isolation)         │
│  - ChatSessions & ChatMessages (Windowed Context)      │
│  - DailyInsights (Cached Unique by profile+date+cat)   │
│  - Subscriptions & UsageRecords (Atomic Quotas)        │
└────────────────────────────────────────────────────────┘
```
