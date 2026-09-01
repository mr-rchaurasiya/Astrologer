# Payment & Webhook Resilience Architecture (Phase 16)

## 1. Idempotency & Replay Defense (`PaymentResilienceService`)

1. **Order Processing Mutex (`DistributedLock`)**:
   - `acquire("payment:order:{orderId}")` ensures only one thread/instance processes a Razorpay order at any given millisecond.
2. **Webhook Replay Ledger (`WebhookEvent`)**:
   - Every incoming Razorpay webhook event ID is recorded upon receipt.
   - Duplicate delivery of already-processed event IDs is rejected idempotently.
3. **Cryptographic HMAC Signature Verification**:
   - Rejection of any unverified webhook payload before database interaction.

---

## 2. Subscription Reconciliation
- Automatic reconciliation syncs user plan state directly from captured payment records if network drops occurred during browser redirection.
