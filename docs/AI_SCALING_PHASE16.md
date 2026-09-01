# AI Cost, Token Quotas & Compute Optimization (Phase 16)

## 1. Token Budgets & Plan Quotas (`AICostManager`)

| Plan Tier | Monthly Token Budget | Cost Cap (INR) | Allowed Models |
|---|---|---|---|
| **Free** | 50,000 tokens | ~₹10.00 | Gemini 1.5 Flash |
| **Pro** | 500,000 tokens | ~₹150.00 | Gemini 1.5 Pro, Claude 3.5 Sonnet, GPT-4o |
| **Premium** | 2,000,000 tokens | ~₹600.00 | Gemini 1.5 Pro, Claude 3.5 Sonnet, GPT-4o |

---

## 2. Prompt Deduplication & Provider Circuit Breakers
- **Prompt Caching**: Identical consultation inquiries on identical birth charts within a 1-hour window are served from cache, eliminating redundant LLM billing.
- **Circuit Breakers**: If an AI provider (e.g. Claude or Gemini) encounters rate limits or 5xx server errors for 5 consecutive calls, the system automatically falls back to an alternate provider without failing the user experience.
