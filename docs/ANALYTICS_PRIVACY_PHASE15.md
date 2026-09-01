# Privacy-Safe Analytics & Telemetry (Phase 15)

## 1. Data Classification in Analytics Payloads

| Data Category | Permitted in Telemetry | Sanitization Action |
|---|---|---|
| **Funnel Stage Events** | `page_view`, `signup_completed`, `kundli_created`, `pricing_viewed`, `payment_completed` | Allowed with event name and timestamp |
| **Plan / Tier Info** | `pro`, `premium`, `free` | Allowed |
| **UTM Attribution** | `utm_source`, `utm_campaign`, `utm_medium` | Sanitized to alphanumeric + dashes; truncated to 100 chars |
| **User Passwords / Secrets** | STRICTLY FORBIDDEN | Discarded automatically by `sanitizeAnalyticsProperties()` |
| **JWT Tokens** | STRICTLY FORBIDDEN | Discarded |
| **Credit Card / Payment Secrets**| STRICTLY FORBIDDEN | Discarded |
| **Private AI Chat Text** | STRICTLY FORBIDDEN | Discarded |
| **Raw Planetary Longitudes** | STRICTLY FORBIDDEN | Discarded |

---

## 2. Pluggable Analytics Provider Abstraction
- Defined in `client/src/utils/analytics.ts` (`IAnalyticsProvider`).
- Supports zero-crash failure tolerance if analytics networks are offline or blocked by ad-blockers.
