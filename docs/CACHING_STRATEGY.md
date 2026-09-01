# Caching Architecture & Strategy

## Overview
The platform utilizes a tiered, deterministic caching strategy to accelerate compute-heavy astronomical functions, minimize redundant AI generation costs, and serve static catalog metadata with sub-millisecond response times.

---

## 1. Cache Provider Abstraction

The caching system exposes an `ICacheProvider` interface supporting:
- In-memory Map caching (`MemoryCacheProvider`) for single-instance / local execution.
- Configurable Time-to-Live (TTL) expiration.
- Pattern-based cache invalidation (`deletePattern`).
- Cache hit/miss observability and size statistics.

---

## 2. Safe Caching Candidates & Scopes

| Domain | Cache Key Pattern | TTL | Invalidation Trigger |
| :--- | :--- | :--- | :--- |
| **Panchang** | `panchang:{date}:{lat_round2}:{lon_round2}` | 24 Hours | Deterministic for a given calendar date and geographic coordinate. |
| **Planetary Transits (Gochar)** | `transits:daily:{date}` | 1 Hour | Time-based expiry (hourly planetary progression). |
| **Subscription Catalog** | `plans:catalog` | 24 Hours | Administrative plan pricing updates. |
| **Daily AI Insights** | `daily_insight:{profileId}:{date}:{category}` | Mongoose Cache | Unique compound index in MongoDB persists daily generation. |

---

## 3. Strict Security Isolation & Non-Cacheable Data

- **Zero Secrets**: Secrets, passwords, hashes, payment credentials, and access tokens are **NEVER** stored in cache.
- **Strict User Scoping**: User-specific birth charts or chat responses are only cached when scoped with unambiguous `{userId}` or `{profileId}` identifiers.
- **Generation Locks**: A transient cache lock (`lock:daily_insight:{profileId}:{date}:{category}`, TTL 30s) prevents multiple simultaneous HTTP clicks from initiating duplicate concurrent AI calls.
