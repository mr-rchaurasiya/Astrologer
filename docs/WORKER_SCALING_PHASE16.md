# Background Worker Architecture & Queue Scaling (Phase 16)

## 1. Categorized Worker Queues (`WorkerPool`)

| Category | Typical Workload | Retry Policy | Max Attempts |
|---|---|---|---|
| `AI_REPORTS` | Long-form multi-page dossier synthesis | Exponential backoff (2s, 4s, 8s) | 3 |
| `PDF_DOSSIER` | Heavy PDF rendering with vector SVG charts | Exponential backoff (1s, 2s, 4s) | 3 |
| `PUSH_NOTIFICATIONS`| Web Push batch payload dispatch | Linear retry (500ms) | 3 |
| `DAILY_INSIGHTS` | Scheduled pre-computation of daily Gochar insights | Exponential backoff (5s, 10s) | 2 |
| `ANALYTICS_FLUSH`| Bulk aggregation of telemetry events | Linear retry (1s) | 3 |
| `WEBHOOK_RETRY` | Razorpay webhook retry delivery | Exponential backoff (5s, 15s, 30s) | 5 |
| `AFFILIATE_COMMISSION`| Commission calculation upon paid subscription | Exponential backoff (2s, 5s) | 3 |

---

## 2. Dead-Letter Queue & Draining
- Jobs exceeding maximum retries are moved to `dead_letter` status for admin inspection and alerting.
- Draining during shutdown (`WorkerPool.drain()`) allows active jobs to finish processing within a 5-second window.
