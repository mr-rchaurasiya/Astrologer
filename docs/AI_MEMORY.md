# Personalized AI Memory System

## Overview
The AI Memory System enables the AI Astrologer to remember user preferences, astrological focus areas, relationship contexts, and historical questions across consultation sessions.

## Storage & Schema
Memories are stored in the `AIMemory` collection with compound indexing:
- `{ userId: 1, category: 1 }`
- `{ userId: 1, key: 1 }`
- `{ userId: 1, lastUsedAt: -1 }`

### Categories
- `preference`: Response length, language, tone, technical depth.
- `astrology_interest`: Planetary affinities, Dasha focus, divisional chart queries.
- `personal_context`: Life situation, career goals, spiritual aspirations.
- `consultation_topic`: Recurring questions, major milestones.
- `remedy_feedback`: Gemstone, mantra, or fasting feedback.

## Sanitization & Security
Before saving any memory, the `MemorySanitizer` executes regex-based filters to block:
- Passwords & secrets
- Credit card numbers (Luhn pattern detection)
- Bearer tokens and JWTs
- API keys (OpenAI, Razorpay, AWS, Generic keys)

## Context Injection
When preparing context for an AI consultation (`prepareContextAndPrompt`), the top ranked memories for the user (scored by confidence and recency decay with a 30-day half-life) are injected under the `[USER PREFERENCES & HISTORICAL CONTEXT]` section in the system prompt.
