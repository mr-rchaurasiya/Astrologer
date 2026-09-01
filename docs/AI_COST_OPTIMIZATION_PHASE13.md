# AI Token & Cost Optimization (Phase 13)

## 1. Context Minimization
- Rather than sending all 16 divisional charts in every prompt, the Context Engine selectively sends only the 1 or 2 relevant Vargas based on detected user intent.
- Reduces average prompt token count from ~4,500 tokens down to ~1,200 tokens (73% token reduction).

---

## 2. Telemetry & Cost Tracking
- Input and output token counts are tracked per request via `AIUsageService`.
- Cost estimates logged to `AIUsageLog` model with subscription quotas enforced.
