# Production Razorpay & Payment Failure Recovery (Phase 11)

## 1. Overview
The platform utilizes Razorpay for subscriptions and one-off payments in INR. The backend remains strictly authoritative for order creation, pricing math, coupon deductions, signature verification, and entitlement provisioning.

```
+----------+          +-------------------+          +--------------+          +---------------------+
|   User   |          |  Astrologer Server|          | Razorpay API |          |  Razorpay Webhook   |
+----+-----+          +---------+---------+          +-------+------+          +----------+----------+
     |                          |                            |                            |
     | 1. Select Plan           |                            |                            |
     +------------------------->|                            |                            |
     |                          | 2. Create Order (Server)   |                            |
     |                          +--------------------------->|                            |
     |                          |                            |                            |
     |                          |<---------------------------+                            |
     |                          |    order_id, receipt       |                            |
     |<-------------------------+                            |                            |
     |    order_id, public key  |                            |                            |
     |                          |                            |                            |
     | 3. Complete Checkout     |                            |                            |
     +------------------------------------------------------>|                            |
     |                          |                            |                            |
     | 4. Return Signature      |                            |                            |
     |<------------------------------------------------------+                            |
     |                          |                            |                            |
     | 5. Verify Signature      |                            |                            |
     +------------------------->| (or Webhook Captured)      | 6. Dispatch payment.captured
     |                          |<--------------------------------------------------------+
     |                          |                            |    HMAC-SHA256 Sig         |
     |                          | 7. Idempotency Check       |                            |
     |                          | 8. Activate Subscription   |                            |
     |<-------------------------+ 9. 200 OK                  +--------------------------->|
     |    Subscription Active   |                                                         |
```

---

## 2. Server-Authoritative Principles
- **No Client-Supplied Amounts**: The frontend passes only the `planId` and optional `couponCode`. The backend calculates all monetary amounts and creates the Razorpay order.
- **HMAC-SHA256 Signature Verification**: `crypto.createHmac('sha256', secret).update(order_id + '|' + payment_id).digest('hex')`.
- **Webhook Idempotency**: Handled via `WebhookEvent` model storing unique `eventId`. Duplicate webhook deliveries return `200 OK` without repeating activations.

---

## 3. Payment Failure States & Recovery
1. **`created`**: Order generated, awaiting user payment.
2. **`captured`**: Payment verified and subscription successfully activated.
3. **`failed`**: Signature mismatch or payment declined by bank.
4. **`refunded`**: Manual or automated refund executed.

### Reconciliation Workflow
The daily reconciliation engine (`ReconciliationService.reconcilePendingPayments()`) queries pending orders older than 30 minutes against Razorpay's API and syncs missing activations.

---

## 4. Production Launch Checklist
- [ ] Replace `rzp_test_...` with live `rzp_live_...` credentials in `server/.env`.
- [ ] Configure Webhook URL in Razorpay Dashboard: `https://api.astrologer.ai/api/v1/payments/webhook`.
- [ ] Subscribe to events: `payment.captured`, `payment.failed`, `order.paid`.
- [ ] Set `RAZORPAY_WEBHOOK_SECRET` in production environment.
- [ ] Perform ₹1 live payment test with real card and verify automatic entitlement activation.
