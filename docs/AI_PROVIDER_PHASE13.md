# AI Provider Abstraction & Model Routing (Phase 13)

## 1. Provider Independence
Business logic in `AIService` and `AIReportGeneratorService` depends exclusively on the `AIProvider` interface.

---

## 2. Intelligent Model Routing Rules

| Task | Free Tier Model | Premium Tier Model | Max Tokens | Temperature |
|---|---|---|---|---|
| **Simple Consultation** | `gpt-4o-mini` | `gpt-4o` | 1,000 | 0.5 |
| **Deep Synthesis** | `gpt-4o-mini` | `gpt-4o` | 1,500 | 0.4 |
| **Report Generation** | `gpt-4o-mini` | `gpt-4o` | 3,000 | 0.3 |
| **Intent Classification** | `gpt-4o-mini` | `gpt-4o-mini` | 100 | 0.1 |
| **Conversation Summary** | `gpt-4o-mini` | `gpt-4o-mini` | 600 | 0.2 |
