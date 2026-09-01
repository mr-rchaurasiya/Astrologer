# Payments, Subscriptions & Webhook Idempotency

## Overview
The Vedic Astrology platform implements a server-authoritative payment and subscription model. Prices, entitlements, and upgrades are calculated and verified exclusively on the backend.

## Pricing Plans

| Plan ID | Display Name | Price | Currency | Billing Period | Entitlements |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `free` | Cosmic Free | $0 | USD | Perpetual | 5 AI Chats/day, 1 Daily Insight/day, Standard Charts |
| `premium_monthly` | Cosmic Premium Monthly | $19.00 | USD | Monthly (30 days) | 100 AI Chats/day, Unlimited Insights, Life Curve, PDF Reports, Priority Transits |
| `premium_yearly` | Cosmic Premium Annual | $149.00 | USD | Yearly (365 days) | All Monthly features + 35% savings + Full multi-decade forecasts |

## Payment Architecture & Flow

```
[ Frontend Client ]                    [ Express Backend ]                  [ Razorpay API ]
        │                                       │                                   │
        │── 1. POST /payments/orders ──────────>│                                   │
        │      { planId: "premium_yearly" }     │── 2. Create Order ───────────────>│
        │                                       │<── { id: "order_123", amt } ──────│
        │                                       │                                   │
        │<── 3. { orderId, amount, key } ───────│                                   │
        │                                       │                                   │
        │── 4. Open Razorpay Checkout Modal ────┼──────────────────────────────────>│
        │                                       │                                   │
        │<── 5. Payment Success (signature) ────┼───────────────────────────────────│
        │                                       │                                   │
        │── 6. POST /payments/verify ──────────>│                                   │
        │      { orderId, paymentId, sig }      │── 7. Verify HMAC-SHA256 Sig       │
        │                                       │── 8. Upgrade Subscription         │
        │                                       │── 9. Log Audit Trail              │
        │<── 10. { verified: true, plan } ──────│                                   │
```

## Razorpay Webhook Verification & Idempotency

All asynchronous payment lifecycle notifications from Razorpay are verified and recorded in the database:
- **Webhook Endpoint**: `POST /api/v1/payments/webhook`
- **Header**: `x-razorpay-signature`
- **Verification**: `crypto.createHmac('sha256', secret).update(rawBody).digest('hex')` using constant-time comparison `crypto.timingSafeEqual`.
- **Idempotency Guard**:
  - Webhooks record their `eventId` and `payloadHash` in the `WebhookEvent` collection.
  - If a webhook event is replayed, the backend returns `{ received: true, processed: false, message: 'Duplicate webhook event already recorded.' }` without double-upgrading or altering existing state.
