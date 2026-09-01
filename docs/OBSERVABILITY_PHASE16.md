# Observability, Prometheus Metrics & SRE Telemetry (Phase 16)

## 1. Metrics Exposition (`GET /api/v1/metrics`)

The platform exports production-standard Prometheus metrics covering:

```text
# HELP astrologer_http_requests_total Total HTTP requests
# TYPE astrologer_http_requests_total counter
astrologer_http_requests_total{method="GET",path="/api/v1/astrology/chart",status="200"} 4280

# HELP astrologer_process_memory_heap_bytes Process heap memory used
# TYPE astrologer_process_memory_heap_bytes gauge
astrologer_process_memory_heap_bytes 48329016

# HELP astrologer_cache_hits_total Total cache hits
# TYPE astrologer_cache_hits_total counter
astrologer_cache_hits_total 8912

# HELP astrologer_worker_queue_depth Total jobs queued by category
# TYPE astrologer_worker_queue_depth gauge
astrologer_worker_queue_depth{category="AI_REPORTS"} 0
```

---

## 2. Distributed Tracing
- `X-Request-ID` and `X-Correlation-ID` headers are injected and propagated through all logs and responses.
