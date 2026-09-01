# System Resilience, Circuit Breakers & Fallback Architecture (Phase 16)

## 1. Circuit Breaker State Machine (`CircuitBreaker`)

```
                  ┌────────────────────────┐
                  │         CLOSED         │◄──────────────┐
                  │ (Normal Operation)     │               │
                  └───────────┬────────────┘               │
                              │                            │ Success Threshold
             Failure Threshold│ (e.g. 5 errors)            │ Met
             Exceeded         │                            │
                              ▼                            │
                  ┌────────────────────────┐               │
                  │          OPEN          │               │
                  │ (Fast Fail / Fallback) │               │
                  └───────────┬────────────┘               │
                              │                            │
             Reset Timeout    │ (e.g. 30s)                 │
             Elapsed          ▼                            │
                  ┌────────────────────────┐               │
                  │       HALF-OPEN        │───────────────┘
                  │ (Canary Test Attempt)  │
                  └────────────────────────┘
```

---

## 2. Integration Targets
- **AI Providers** (Gemini / Claude / OpenAI): Fallback from primary model to secondary model upon tripping.
- **Push Notification Gateways**: Queue retries with exponential backoff on network failures.
- **Redis Cache Layer**: Automatic switch to in-memory TTL caching during connection interruptions.
