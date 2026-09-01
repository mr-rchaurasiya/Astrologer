# High-Concurrency Load & Stress Testing Protocol (Phase 16)

## 1. Load Test Scenario Definitions

### Scenario 1: High-Volume Public Traffic (SEO & Landing Pages)
- **Target**: `/kundli-online`, `/vedic-astrology`, `/ai-astrologer`, `/blog`
- **Concurrency**: 500 virtual users (VUs)
- **Target Latency**: p95 < 250ms, Error Rate: 0.00%

### Scenario 2: High-Volume Calculation & Dasha Generation
- **Target**: `POST /api/v1/astrology/chart`, `GET /api/v1/astrology/dasha/:id`
- **Concurrency**: 200 VUs
- **Target Latency**: p95 < 400ms, Error Rate: 0.00%

### Scenario 3: AI Consultation & SSE Streaming
- **Target**: `POST /api/v1/ai/chat`
- **Concurrency**: 100 concurrent AI requests
- **Target Latency**: First token < 1200ms, Error Rate: < 0.1%

---

## 2. Load Testing Script
Reproducible load-test scenarios can be run via:
```bash
npx autocannon -c 100 -d 30 http://localhost:5000/api/v1/health
```
*(Production cluster load validation marked as PENDING EXTERNAL INFRASTRUCTURE).*
