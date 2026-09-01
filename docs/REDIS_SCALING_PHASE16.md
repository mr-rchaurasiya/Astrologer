# Redis Scaling, Caching Namespaces & Stampede Protection (Phase 16)

## 1. Key Namespaces Strategy
- `astrologer:chart:{profileId}:{ayanamsa}` — Cached divisional charts (TTL: 24h)
- `astrologer:insight:{profileId}:{date}:{category}` — Daily AI horoscope insights (TTL: 24h)
- `astrologer:quota:{userId}:{YYYY-MM}` — Monthly AI token quota counter (TTL: 31d)
- `astrologer:ratelimit:{ip}:{path}` — Distributed rate limit counters (TTL: 1m / 15m)
- `astrologer:lock:{resourceKey}` — Distributed mutual exclusion locks (TTL: 10s–30s)

---

## 2. Cache Stampede & Failure Mitigation
- **Promise Coalescing (`getOrSet`)**: When a cache miss occurs on high-concurrency resources (e.g. daily transit data), concurrent requests share a single pending in-flight promise rather than hammering the database.
- **Fail-Open Fallback**: If Redis becomes unreachable, the provider automatically falls back to an in-memory TTL store without crashing the application.
