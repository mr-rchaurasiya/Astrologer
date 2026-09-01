# Phase 13 Architectural Audit: AI Subsystems, Memory & Intelligence

## 1. Executive Summary
This document provides a comprehensive audit of the AI architecture across Phases 1 through 12, mapping out existing providers, prompts, memory lifecycle, token flow, and integration points for Phase 13.

---

## 2. Existing AI Architecture Review

### 2.1 Provider Abstraction & Providers
- **Interface**: `AIProvider` in `server/src/ai/providers/AIProvider.ts` defining `generateResponse()` and `streamResponse()`.
- **Implementations**: `OpenAIProvider.ts` integrating OpenAI-compatible Chat Completions API with fallback error handling.
- **Service Layer**: `AIService` in `server/src/ai/services/ai.service.ts` acting as the central facade for context preparation and provider delegation.

### 2.2 Astrology Context Flow
- **Single Source of Truth**: Deterministic calculations from `AstrologyService` (ephemeris, coordinates, Lahiri ayanamsa, houses, divisional charts, dashas, yogas, shadbala, ashtakavarga, transits).
- **Previous Context Builder**: `ContextBuilder.ts` constructed a basic sanitized context containing D1, D9, D10, active dasha, and point context.
- **Phase 13 Upgrade**: Establish `server/src/ai/astrology/` with dynamic question intent classification and selective context injection (e.g. D1+D10 for career, D1+D9 for marriage, D1+D24 for education, D1+D20 for spirituality).

### 2.3 Memory Lifecycle & Personalization
- **Database Model**: `AIMemory.ts` storing user-isolated memory snippets (`userId`, `profileId`, `category`, `key`, `value`, `confidence`, `source`, `lastUsedAt`, `expiresAt`).
- **Memory Service**: `AIMemoryService` in `server/src/ai/memory/memory.service.ts` providing sanitization, scoring, and retrieval.
- **Phase 13 Upgrade**: Add confidence ranks (`LOW`, `MEDIUM`, `HIGH`, `VERIFIED`), expanded categories (`CAREER_CONTEXT`, `RELATIONSHIP_CONTEXT`, `GOAL`, `CONCERN`, `REMEDY_PREFERENCE`), deterministic conflict resolution (superseding old facts with newer explicit user statements), and confidence decay.

### 2.4 Prompt Engineering & Grounding
- **Current System Prompts**: `systemPrompt.ts` providing behavioral rules, tone, and markdown structure.
- **Phase 13 Upgrade**: Introduce strict fact-grounding, medical/legal disclaimer safeguards, prevention of hallucinated numbers/degrees, and customizable response styles (`CONCISE`, `BALANCED`, `DETAILED`, `EXPERT`, `BEGINNER`).

### 2.5 Token Usage & Cost Management
- **Tracking**: `AIUsageService.ts` records prompt tokens, completion tokens, latency, cost estimation, and user quotas.
- **Rate Limiting**: `rateLimiter.ts` limits AI endpoints by subscription tier.
- **Phase 13 Upgrade**: Add intelligent model routing (lightweight vs advanced models) and tenant-isolated caching.

---

## 3. Phase 13 Integration Plan & Compatibility Safeguards
- **Deterministic Supremacy**: Deterministic astrological truth from Phase 12 always overrides LLM interpretations.
- **Zero Breaking Changes**: All Phase 1–12 endpoints, models, and calculation flows remain 100% operational.
