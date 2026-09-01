# AI Astrology Consultation Architecture

## 1. System Overview & Core Principle

```
┌────────────────────────────────────────────────────────┐
│               Client (React 18 + Vite)                │
│  - ChatPage (/chat)                                    │
│  - Point & Ask Button / Context Trigger                │
│  - SSE Streaming & AbortController                    │
└───────────────────────────┬────────────────────────────┘
                            │ HTTP POST (SSE) / REST
                            ▼
┌────────────────────────────────────────────────────────┐
│           Astrologer Backend API Layer                │
│  - Authentication Middleware (requireAuth)             │
│  - Profile Ownership Verification                      │
│  - AI Rate Limiter (aiRateLimiter)                     │
│  - Zod Request Validators                              │
└───────────────────────────┬────────────────────────────┘
                            │
                            ▼
┌────────────────────────────────────────────────────────┐
│   Deterministic Astrology Engine (Single Source)       │
│  - Ephemeris & VSOP87 Sidereal Coordinates             │
│  - Lahiri Ayanamsa                                     │
│  - Whole Sign Houses (12 Bhavas)                       │
│  - Divisional Charts (D1, D9, D10)                     │
│  - 120-Year Vimshottari Dasha Hierarchy                │
│  - Panchang & Muhurta Windows                          │
└───────────────────────────┬────────────────────────────┘
                            │ Calculated Astrological Facts
                            ▼
┌────────────────────────────────────────────────────────┐
│         Astrology Context Builder (Sanitizer)          │
│  - Controlled DTO (No hashes, tokens, or private IDs)  │
│  - Point & Ask Target Resolver                         │
│  - Context Version: "1.0"                              │
└───────────────────────────┬────────────────────────────┘
                            │ Structured Context DTO
                            ▼
┌────────────────────────────────────────────────────────┐
│                  AI Service Layer                      │
│  - System Prompt Builder (Safety + Factual Grounding)  │
│  - Conversation History Windowing (Last 20 messages)   │
│  - Provider Abstraction Layer (AIProvider)             │
│  - OpenAIProvider (OpenAI-compatible & SSE streaming)  │
└───────────────────────────┬────────────────────────────┘
                            │
                            ▼
┌────────────────────────────────────────────────────────┐
│             Database Persistence & Security            │
│  - ChatSession ({ userId, profileId, updatedAt })      │
│  - ChatMessage ({ sessionId, userId, profileId, role })│
│  - AuditLog (AI_CHAT_COMPLETED, AI_CHAT_FAILED)        │
└────────────────────────────────────────────────────────┘
```

---

## 2. Pluggable AI Provider Architecture

The AI layer strictly decouples controllers from specific AI model vendors through the `AIProvider` interface:

* **`AIProvider` Interface (`server/src/ai/providers/AIProvider.ts`)**:
  - `generateResponse(params)`: Generates complete structured AI response.
  - `streamResponse(params)`: Streams partial chunks over SSE with client-side abort support.
* **`OpenAIProvider` (`server/src/ai/providers/OpenAIProvider.ts`)**:
  - Standard provider implementation utilizing the official `openai` SDK.
  - Supports configurable `AI_MODEL`, `AI_BASE_URL`, `AI_TEMPERATURE`, and `AI_MAX_TOKENS`.
  - Implements graceful fallback when `AI_API_KEY` is not configured, preventing server crashes.

---

## 3. Strict Deterministic Astrology Principle

1. **Zero Frontend Calculations**: The client never computes planetary coordinates or interpretations.
2. **Zero AI Astronomical Calculations**: The AI is explicitly forbidden from calculating longitudes, degrees, or dashas. It interprets and synthesizes only backend-provided calculated data.
3. **Missing Data Handling**: If an astrological attribute is absent from the context, the AI explicitly states that the calculated value is unavailable.

---

## 4. Point & Ask Architecture

Users can click any astrological element in the Kundli (Graha, Bhava, Nakshatra, or Dasha period) to trigger a contextual inquiry:

1. **Client Trigger**: Passes `pointType` (`planet` | `house` | `nakshatra` | `dasha` | `chart`) and `pointId` (e.g. `Mars`, `10`).
2. **Server-Side Grounding**: `ContextBuilder.resolvePointContext()` independently looks up the authoritative calculation for the target element from the user's verified profile chart.
3. **Context Injection**: Highlights the selected point and its Vedic aspects directly in the system prompt.

---

## 5. Security & User Data Isolation

* **Strict Profile & Session Ownership**: Every query requires `userId === req.user.id` and `profile.userId === req.user.id`.
* **Zero Secrets on Client**: `AI_API_KEY` and `OPENAI_API_KEY` are strictly server-side environment variables.
* **Sanitized AI Context**: Passwords, refresh tokens, IP addresses, and database `_id` fields are excluded before sending to the AI model.
