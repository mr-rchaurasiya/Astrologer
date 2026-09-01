# Phase 13 Architecture: Advanced AI Astrologer & Personalization Engine

## 1. System Architecture Diagram

```
+-----------------------------------------------------------------------------------+
|                                  CLIENT (PWA)                                     |
|  - AI Context Indicator (Intent badge, Active Dasha, Fact Grounding Score)        |
|  - AI Dossier & Report Generator (<AIReportGenerator />)                          |
|  - Real-time SSE Chat & Streaming Consultation                                    |
|  - Personalization Controls & Feedback Logging                                    |
+------------------------------------------+----------------------------------------+
                                           | HTTPS / REST & Server-Sent Events (SSE)
+------------------------------------------v----------------------------------------+
|                                EXPRESS BACKEND API                                |
|  - Auth & Ownership Middleware (`requireAuth`, profile isolation)                 |
|  - AI Rate Limiting & Quota Management (`aiRateLimiter`)                          |
+------------------------------------------+----------------------------------------+
                                           |
+------------------------------------------v----------------------------------------+
|                      ASTROLOGY CONTEXT ORCHESTRATION                              |
|  - High-Speed Intent Classifier (Career, Marriage, Finance, Remedies, etc.)       |
|  - Relevance-Based Selective Context Selector (D1, D9, D10, D24, D30, etc.)       |
|  - Ground Truth Fact Extraction (signs, houses, dashas, yogas, shadbala)         |
+------------------------------------------+----------------------------------------+
                                           |
+------------------------------------------v----------------------------------------+
|                       LONG-TERM MEMORY & CONFIDENCE                               |
|  - Categories: USER_PREFERENCE, CAREER_CONTEXT, RELATIONSHIP_CONTEXT, GOALS, etc. |
|  - Confidence Levels: LOW (0.25), MEDIUM (0.50), HIGH (0.75), VERIFIED (1.00)     |
|  - Deterministic Conflict Resolution (Explicit user statement supersedes)         |
+------------------------------------------+----------------------------------------+
                                           |
+------------------------------------------v----------------------------------------+
|                         INTELLIGENT MODEL ROUTER                                  |
|  - Lightweight/Fast (gpt-4o-mini) for simple queries & summaries                  |
|  - Advanced Reasoning (gpt-4o) for deep chart synthesis & reports                 |
+------------------------------------------+----------------------------------------+
                                           |
+------------------------------------------v----------------------------------------+
|                   GROUNDING, VALIDATION & SAFETY LAYER                            |
|  - AstrologyFactValidator: Checks AI text against calculated astronomical facts   |
|  - AIResponseValidator: Enforces medical/legal disclaimers & blocks guarantees    |
|  - RemedyEngine: Curated peaceful, non-harmful Vedic remedies                     |
+-----------------------------------------------------------------------------------+
```
