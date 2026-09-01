# Phase 10 Architecture Document: Mobile/PWA Excellence, Multi-Style Kundli, AI Intelligence & Monetization Expansion

## 1. System Overview

Phase 10 elevates the Vedic Astrologer SaaS platform into an installable, mobile-first Progressive Web Application (PWA) with multi-regional astrological chart visualization (North, South, and East Indian styles), conversation intelligence with structured summaries, saved consultation vaults, user-customizable AI persona controls, expanded monetization infrastructure (coupons & viral referral engine), and robust production operations.

```
+-----------------------------------------------------------------------------------+
|                                 CLIENT LAYER (PWA)                                |
|  +---------------------+  +----------------------+  +---------------------------+  |
|  | Service Worker (sw) |  | OfflineAware Context |  | Install & Update Prompts  |  |
|  +---------------------+  +----------------------+  +---------------------------+  |
|  +---------------------+  +----------------------+  +---------------------------+  |
|  | SVG Chart Renderers |  | Saved Readings Vault |  | AI Feedback & Rating      |  |
|  | (North/South/East)  |  | (Tags/Notes/Star)    |  | Telemetry UI              |  |
|  +---------------------+  +----------------------+  +---------------------------+  |
+------------------------------------------+----------------------------------------+
                                           | HTTPS / WSS / REST
+------------------------------------------v----------------------------------------+
|                                BACKEND SERVER (Node/Express)                      |
|  +---------------------+  +----------------------+  +---------------------------+  |
|  | Feature Flags Engine|  | Expiring Share Vault |  | Centralized Plans & Coupon|  |
|  | (server-controlled) |  | (Sanitized Coordinates)  Engine (Server Auth)     |  |
|  +---------------------+  +----------------------+  +---------------------------+  |
|  +---------------------+  +----------------------+  +---------------------------+  |
|  | Conversation Summary|  | Notification Engine  |  | Viral Referral System     |  |
|  | Service (Tokens)    |  | (Status/Retries)     |  | (Fraud Protection)        |  |
|  +---------------------+  +----------------------+  +---------------------------+  |
+------------------------------------------+----------------------------------------+
                                           | Strict Tenant Isolation
+------------------------------------------v----------------------------------------+
|                                DATABASE LAYER (MongoDB)                           |
|  SharedKundli | ConversationSummary | SavedConsultation | AIPersonalization        |
|  AIResponseFeedback | Coupon | CouponRedemption | Referral | Notification         |
+-----------------------------------------------------------------------------------+
```

---

## 2. PWA & Mobile Architecture

1. **Manifest & High-Res App Assets (`client/public/manifest.json`)**:
   - Configured with `standalone` display mode, dark theme `#07090E`, gold primary accents `#F5D061`.
   - Native app shortcuts for `/kundli`, `/chat`, and `/reports`.
2. **Service Worker Caching & Security Partitioning (`client/public/sw.js`)**:
   - **Static Cache**: Cache-first with network fallback for fonts, scripts, icons, CSS, and application shell.
   - **Bypass Partition**: Sensitive REST APIs (`/auth/*`, `/payments/*`, `/account/*`, `/ai/chat/*`, `/ai/voice/*`, `/admin/*`) explicitly bypass service worker cache to prevent credential or PII data leakage.
   - **Lifecycle Handling**: Supports `skipWaiting` and clean cache purging on worker version bumps.
3. **Offline Awareness**:
   - `OfflineBanner.tsx` displays non-intrusive alerts upon network interruption and auto-dismisses upon reconnection.
   - `PWAUpdatePrompt.tsx` prompts users when new application bundles are ready for reload.
   - `InstallAppPrompt.tsx` hooks native `beforeinstallprompt` events for seamless homescreen installation.

---

## 3. Multi-Style Regional Kundli Rendering

1. **North Indian Diamond Chart (`KundliChart.tsx`)**:
   - Ascendant fixed in the top central diamond (House 1); houses fixed, zodiac signs rotate.
   - Interactive zoom (+ / - / reset) and fullscreen mode with house and planet selection highlighting.
2. **South Indian Fixed-Sign Grid (`SouthIndianKundliChart.tsx`)**:
   - 12 fixed-sign box grid (Aries in box 2, moving clockwise); Ascendant marked as Lagna.
   - Custom cross-highlighting of selected houses and planets.
3. **East Indian Diamond/Cross Chart (`EastIndianKundliChart.tsx`)**:
   - Fixed Aries at top, moving counter-clockwise (Bengali / Oriya / Assamese tradition).
4. **Interactive Controls & Persistence (`ChartStyleSelector.tsx`)**:
   - User style preference is persistently stored in `localStorage` (`astrologer_chart_style`).

---

## 4. Expiring & Sanitized Kundli Sharing

- **Zero PII & Data Isolation**:
  - `POST /api/v1/astrology/share/create` generates a secure, random 48-character hex token with configurable TTL (1 to 90 days).
  - `GET /api/v1/astrology/share/public/:token` is public and returns strictly sanitized astronomical data (ascendant, planets, houses, dashas, panchang).
  - **Zero user IDs, MongoDB IDs, chat histories, AI memories, or billing records are exposed**.
  - One-click token revocation and view count telemetry.

---

## 5. AI Conversation Intelligence & Personalization

- **Structured Summarization (`conversationSummary.service.ts`)**:
  - Automatically distills key astrological concerns, remedies suggested, and planetary influences into structured records with version tracking.
- **Saved Consultations Vault (`SavedConsultation.ts`)**:
  - Users can bookmark specific readings, assign tags (`#career`, `#saturn`, `#remedy`), add private follow-up notes, filter favorites, and archive readings.
- **AI Persona Controls (`AIPersonalization.ts`)**:
  - Configurable terminology (Standard Vedic, Traditional Sanskrit, Simplified/Beginner).
  - Configurable response style (Concise/Direct, Balanced, In-Depth Philosophical).
  - Multi-language preference (English, Hindi, Sanskrit).
- **Quality Scoring & Telemetry (`AIResponseFeedback.ts`)**:
  - Thumbs up/down with granular categories (accuracy, clarity, depth, hallucination, tone) to continuously improve model prompts.

---

## 6. Monetization Expansion: Coupons & Referrals

- **Centralized Plans (`plans.ts`)**:
  - Single source of truth for free, pro, and premium tiers shared between client and server.
- **Server-Authoritative Coupon Engine (`Coupon.ts`, `coupon.service.ts`)**:
  - Supports percentage and fixed discount types.
  - Server validation of expiration timestamps, total redemption caps, per-user redemption limits, applicable plan filters, and minimum cart amounts.
- **Viral Referral System (`Referral.ts`, `referral.service.ts`)**:
  - Unique vanity/alphanumeric referral codes (`VEDIC-XXXXXX`).
  - Strict self-referral prevention, duplicate registration protection, and referral bonus credits.

---

## 7. Operational Analytics & Notifications

- **Notification Delivery Resilience (`Notification.ts`, `notification.service.ts`)**:
  - Added delivery status lifecycle (`queued`, `sent`, `delivered`, `failed`, `read`), priority tiers (`urgent`, `high`, `normal`, `low`), categories (`astrology`, `billing`, `consultation`, `system`), and idempotency keys.
- **Admin Revenue & Operational Telemetry (`admin.controller.ts`)**:
  - Real-time MRR (Monthly Recurring Revenue), ARR (Annual Recurring Revenue), and lifetime captured revenue aggregations.
  - AI feedback telemetry with rating distributions and category breakdown.
