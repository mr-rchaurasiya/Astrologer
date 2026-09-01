# Astrologer — AI-Powered Vedic Astrology Platform

An original, production-grade Vedic Astrology SaaS platform combining high-precision deterministic astronomical calculations (Lahiri Ayanamsa, D1/D9/D10, Vimshottari Dasha, Panchang) with context-grounded AI consultation, advanced multi-decade analytics (Life Curve, Transits), vector PDF horoscope dossiers, Razorpay payments, voice consultations, multi-channel notifications, account data export/deletion governance, distributed caching, containerization, and a commercial launch infrastructure.

---

## Current Status & Phase Roadmap

* **Phase 1 — Project Foundation & Scaffolding (Completed & Verified)**
* **Phase 2 — Database, Authentication & User Management (Completed & Verified)**
* **Phase 3 — Deterministic Vedic Astrology Calculation Engine (Completed & Verified)**
* **Phase 4 — Birth Profile + Kundli Visualization + Dashboard Integration (Completed & Verified)**
* **Phase 5 — AI Astrology Consultation + Point & Ask + Structured AI Context (Completed & Verified)**
* **Phase 6 — Advanced Astrology Analytics, Life Curve, Transit Insights & Subscription Foundation (Completed & Verified)**
* **Phase 7 — Production Platform, Real Subscriptions, PDF Reports, Voice AI, Notifications, Admin & Deployment Readiness (Completed & Verified)**
* **Phase 8 — Production Launch, Advanced UX, Astrology Quality Hardening & Platform Maturity (Completed & Verified)**
* **Phase 9 — Intelligence, Personalization, Performance & Production Observability (Completed & Verified)**
* **Phase 10 — Mobile/PWA Excellence, Advanced Kundli UX, AI Conversation Intelligence, Monetization Expansion & Production Operations (Completed & Verified)**
* **Phase 11 — Production Infrastructure, Cloud Deployment & Commercial Launch Readiness (Completed & Verified)**
* **Phase 12 — Advanced Astrology Engine, Calculation Accuracy & Deep Chart Analysis (Completed & Verified)**
* **Phase 13 — Advanced AI Astrologer, Personalization & AI Intelligence (Completed & Verified)**
* **Phase 14 — Mobile App, Advanced PWA & Cross-Platform Readiness (Completed & Verified)**
* **Phase 15 — Growth, Advanced SEO, Marketing & Monetization Optimization (Completed & Verified)**
* **Phase 16 — Scale, Enterprise Security, High Availability & Operational Excellence (Completed & Verified)**

---

## Architecture

```text
React + Vite (Mobile-First PWA & SEO/Marketing Growth Layer)
  ├── Public SEO Landing Pages (/kundli-online, /vedic-astrology, /ai-astrologer, /astrology-reports)
  ├── Blog & Educational Content Architecture (/blog, /blog/:slug)
  ├── Dynamic XML Sitemap (/api/v1/seo/sitemap.xml) & Search Engine Robots Protocol (robots.txt)
  ├── Structured Schema.org JSON-LD (WebSite, WebApplication, Article, Organization)
  ├── Privacy-Safe Pluggable Analytics Engine (10-Stage Funnel Telemetry & Attribute Sanitization)
  ├── Secure Attribution Engine (UTM & Referral Tracking with Strict XSS Sanitization)
  ├── Deterministic Experimentation & A/B Testing Manager (ExperimentManager)
  ├── Server-Authoritative MRR / ARR / ARPU / Churn & Retention Analytics (/admin/growth)
  ├── CMS & Content Management Platform (/admin/articles)
  ├── Affiliate Partner Architecture & Commission Tracking (/api/v1/affiliates)
  ├── Ergonomic Mobile Bottom Navigation (<MobileBottomNav />) with >=44px touch targets
  ├── Slide-over Secondary Navigation Drawer (<MobileDrawer />)
  ├── Safe Deep-Link Resolution & Redirect Engine (DeepLinkManager)
  ├── Progressive Web App Engine (sw.js v14.0.0, Network-First shell caching, Offline awareness)
  ├── Cross-Platform Container Architecture (Capacitor com.astrologer.app)
  ├── Web Push Device Subscription Lifecycle & Sanitized Push Dispatch
  ├── Route-Level Code Splitting (React.lazy & Suspense)
  ├── Multi-Style Regional Kundli Visualization (North, South, East)
  ├── Expiring & Sanitized Kundli Sharing (/shared/kundli/:token)
  ├── Saved Consultations Vault (/saved-consultations with tags, search, and notes)
  ├── AI Personalization Controls & Feedback Scoring (/settings, <AIFeedbackModal />)
  ├── Viral Referral Loop & Rewards (/referrals)
  ├── Coupon & Promo Code Engine at Checkout (/subscription)
  ├── Personalized AI Memory & Preferences Management (/settings)
  ├── Smart Jyotish Recommendations Engine (<RecommendationList />)
  ├── Multi-chart Correlated Insights (<InsightCard />)
  ├── Advanced Analytics Hub (/analytics)
  ├── Vector PDF Horoscope Dossier Generator (/reports)
  ├── Voice AI Consultation & Neural TTS Playback (/chat)
  ├── Razorpay Checkout Modal & Real Subscriptions (/subscription)
  ├── In-App Real-time Notification Center & Preferences
  ├── Admin Platform (/admin, /admin/users, /admin/subscriptions, /admin/audit-logs, /admin/analytics)
  └── Point & Ask Contextual Triggering
      ↓ HTTPS / REST & Server-Sent Events (SSE)
Ingress Reverse Proxy (Nginx)
  ├── Port 80/443 SSL/TLS Termination & HTTP-to-HTTPS Redirection
  ├── Security Headers (CSP, HSTS, X-Content-Type-Options, X-Frame-Options)
  ├── Compression (Gzip) & Static Asset Caching
  └── SSE Buffering Bypass & 25MB Body Size Allowance
      ↓
Express API (Backend Server - Docker Non-Root)
  ├── Centralized Environment Startup Validation (`validateEnvironment()`)
  ├── Dynamic CORS Whitelist & Tiered Rate Limiting
  ├── Polymorphic Cache Layer (Redis with in-memory fallback)
  ├── Asynchronous Background Job Queue (Email, Cleanup, Subscriptions, Reconciliation)
  ├── Cloud & Local Object Storage Abstraction (S3/R2/GCS with Signed URLs)
  ├── Structured JSON Logger with Automated PII & Secret Redaction
  ├── Subsystem Readiness Probes (/api/v1/health/ready)
  ├── Server-Authoritative Razorpay Payment Engine & Webhook HMAC Verification
  ├── Deterministic Astrology Calculation Engine (VSOP87 / JPL with Golden Dataset QA)
  ├── OpenAI Whisper Voice STT & Neural TTS Synthesis Provider
  └── Mongoose Optimized Compound Indexes (28 indexes across core models)
      ↓
MongoDB & Redis Clusters
```

---

## Test Verification Summary

* **Backend Test Suite**: **51 / 51 test suites passed (197 / 197 tests passed, 0 failures)**
* **Frontend Test Suite**: **8 / 8 test suites passed (35 / 35 tests passed, 0 failures)**
* **Total Automated Tests**: **232 passing tests across full-stack integration**
* **TypeScript Compilation**: `tsc` (Server) & `tsc && vite build` (Client) complete with 0 errors.

---

## Documentation Library
- [PHASE 11 ARCHITECTURE](file:///d:/Astrologer/docs/PHASE11_ARCHITECTURE.md)
- [PHASE 11 DEPLOYMENT RUNBOOK](file:///d:/Astrologer/docs/PHASE11_DEPLOYMENT.md)
- [COMMERCIAL LAUNCH CHECKLIST](file:///d:/Astrologer/docs/COMMERCIAL_LAUNCH_CHECKLIST.md)
- [ENVIRONMENT REFERENCE (PHASE 11)](file:///d:/Astrologer/docs/ENVIRONMENT_PHASE11.md)
- [REDIS & DISTRIBUTED CACHE](file:///d:/Astrologer/docs/REDIS_AND_CACHE_PHASE11.md)
- [RAZORPAY PRODUCTION & RECOVERY](file:///d:/Astrologer/docs/RAZORPAY_PRODUCTION_PHASE11.md)
- [BACKGROUND JOBS & QUEUES](file:///d:/Astrologer/docs/BACKGROUND_JOBS_PHASE11.md)
- [PRODUCTION STRUCTURED LOGGING](file:///d:/Astrologer/docs/PRODUCTION_LOGGING_PHASE11.md)
- [ALERTING MATRIX](file:///d:/Astrologer/docs/ALERTING_PHASE11.md)
- [DOCKER & CONTAINERIZATION](file:///d:/Astrologer/docs/DOCKER_PHASE11.md)
- [BACKUP & DISASTER RECOVERY](file:///d:/Astrologer/docs/BACKUP_RECOVERY_PHASE11.md)
- [SECURITY AUDIT (PHASE 11)](file:///d:/Astrologer/docs/SECURITY_AUDIT_PHASE11.md)
- [PERFORMANCE LOAD TESTING](file:///d:/Astrologer/docs/PERFORMANCE_LOAD_TEST_PHASE11.md)
- [PHASE 11 COMPLETION CERTIFICATE](file:///d:/Astrologer/docs/PHASE11_COMPLETION.md)
- [PHASE 10 ARCHITECTURE](file:///d:/Astrologer/docs/PHASE10_ARCHITECTURE.md)
- [PHASE 10 API REFERENCE](file:///d:/Astrologer/docs/PHASE10_API.md)
- [PHASE 10 PWA & OFFLINE](file:///d:/Astrologer/docs/PWA_PHASE10.md)
- [KUNDLI SECURE SHARING](file:///d:/Astrologer/docs/KUNDLI_SHARING.md)
- [AI CONVERSATION INTELLIGENCE](file:///d:/Astrologer/docs/AI_CONVERSATION_INTELLIGENCE.md)
- [MONETIZATION & PLANS](file:///d:/Astrologer/docs/MONETIZATION_PHASE10.md)
- [COUPON & REFERRAL ENGINE](file:///d:/Astrologer/docs/COUPON_AND_REFERRAL.md)
- [PRIVACY & DATA GOVERNANCE](file:///d:/Astrologer/docs/PRIVACY_PHASE10.md)
- [OPERATIONS & TELEMETRY](file:///d:/Astrologer/docs/OPERATIONS_PHASE10.md)
- [PHASE 10 SECURITY AUDIT](file:///d:/Astrologer/docs/SECURITY_AUDIT_PHASE10.md)
- [PHASE 9 ARCHITECTURE](file:///d:/Astrologer/docs/PHASE9_ARCHITECTURE.md)
- [PERSONALIZED AI MEMORY](file:///d:/Astrologer/docs/AI_MEMORY.md)
- [RECOMMENDATION ENGINE](file:///d:/Astrologer/docs/RECOMMENDATION_ENGINE.md)
- [ASTROLOGY INSIGHTS CORRELATION](file:///d:/Astrologer/docs/ASTROLOGY_INSIGHTS.md)
- [PRODUCTION OBSERVABILITY](file:///d:/Astrologer/docs/OBSERVABILITY_PHASE9.md)
- [DATABASE INDEXING MATRIX](file:///d:/Astrologer/docs/DATABASE_INDEXING.md)
