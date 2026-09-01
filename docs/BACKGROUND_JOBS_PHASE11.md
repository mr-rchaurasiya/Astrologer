# Background Job & Queue Architecture (Phase 11)

## 1. Overview
The platform utilizes an asynchronous job queue abstraction (`IJobQueue`) to process time-consuming or deferred workloads without blocking synchronous REST API response cycles.

```
[Express Controller]
         |
         | enqueue(jobName, payload, { maxRetries, backoffMs })
         v
+--------------------------------------------------------+
|                   Background Job Queue                 |
|  +--------------------+  +--------------------------+  |
|  | State Machine      |  | Exponential Backoff      |  |
|  | (pending, running, |  | (delay = backoff * 2^n)  |  |
|  | completed, failed) |  |                          |  |
|  +--------------------+  +--------------------------+  |
+--------------------------------------------------------+
         |
         | dispatch
         v
+------------------+   +-------------------+   +-------------------------+
| send_email       |   | daily_insights    |   | cleanup_expired_shares  |
+------------------+   +-------------------+   +-------------------------+
```

---

## 2. Core Handled Jobs
1. **`send_email`**: Dispatches transactional emails (welcome, verification, password reset, invoices) through SMTP with automatic retries.
2. **`cleanup_expired_shares`**: Scans the `SharedKundli` collection and flags expired or unviewed records for pruning.
3. **`sync_subscription_expiration`**: Identifies subscriptions past their `expiresAt` date and updates status to `expired`.
4. **`payment_reconciliation`**: Polls payment provider for uncaptured orders and synchronizes missing state transitions.

---

## 3. Reliability & Lifecycle
- **Exponential Backoff**: Configurable retry limit with exponential delay calculation.
- **Dead-Letter Logging**: Permanently failed jobs log full contextual details via the structured JSON logger.
- **Graceful Shutdown**: Intercepts `SIGTERM` and drains active in-flight executions before closing database and network listeners.
