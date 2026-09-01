# Distributed Caching & Redis Architecture (Phase 11)

## 1. Overview
The platform utilizes a polymorphic cache layer (`ICacheProvider`) supporting both localized development (`MemoryCacheProvider`) and distributed cloud production deployment (`RedisCacheProvider`).

```
                     +-----------------------+
                     |    ICacheProvider     |
                     +-----------+-----------+
                                 |
                 +---------------+---------------+
                 |                               |
     +-----------v-----------+       +-----------v-----------+
     |  MemoryCacheProvider  |       |   RedisCacheProvider  |
     |   (LRU In-Memory)     |       | (Distributed Cluster) |
     +-----------------------+       +-----------+-----------+
                                                 | (on failure)
                                                 v
                                     [Automatic Memory Fallback]
```

---

## 2. Key Features
1. **Configurable TTL**: Default 600s (10 minutes) with per-key custom overrides.
2. **Namespace Prefixing**: Default prefix `astrologer:` avoids key collisions across shared Redis instances.
3. **Pattern Invalidation**: `deletePattern('daily_insight:*')` allows bulk cache invalidation on major transit events.
4. **Resilient Fallback**: If Redis disconnects or `REDIS_URL` is omitted, requests gracefully fallback to in-memory caching without throwing 500 errors.
5. **Cache Statistics**: Tracks total keys, hits, misses, hit ratio %, and approximate memory footprint.

---

## 3. Production Invalidation Policies
- **Kundli Calculations**: Cached for 24 hours (`86400s`) keyed by birth coordinate hash.
- **Daily AI Insights**: Cached until midnight IST (`86400s`) keyed by `insight:{profileId}:{date}:{category}`.
- **Transit Timeline**: Cached for 7 days (`604800s`).
- **Feature Flags**: Cached for 60 seconds (`60s`).
