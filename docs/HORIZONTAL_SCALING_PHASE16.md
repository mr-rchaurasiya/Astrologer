# Horizontal Application Scaling Guidelines (Phase 16)

## 1. Multi-Instance Principles
1. **Stateless Request Handlers**: All API endpoints treat each request independently.
2. **Distributed Locking (`DistributedLock`)**: Prevents race conditions during concurrent payments, quota increments, or batch report exports.
3. **Request Correlation (`X-Request-ID` & `X-Correlation-ID`)**: Traces transactions across microservices, reverse proxies, and log aggregators.
4. **Graceful Connection Draining**:
   - Catches `SIGTERM` and `SIGINT`.
   - Stops accepting new connections.
   - Waits up to 10 seconds for in-flight requests and background workers to complete cleanly before terminating.

---

## 2. In-Memory vs Distributed State Classification

| State Type | Previous State | Phase 16 Strategy |
|---|---|---|
| **User Authentication** | Stateless JWT | Distributed Blacklist on Revocation |
| **API Rate Limits** | Process-local Map | Shared Redis Token Bucket |
| **Resource Locks** | In-memory Mutex | `DistributedLock` with Redis + Memory Fallback |
| **AI Token Quotas** | Local Counters | Redis Monthly Counter with Mongo Sync |
| **Background Queues** | Local `Map<string, Job>`| Worker Pool with Category Partitioning |
