# Push Notification Architecture & Subscription Lifecycle (Phase 14)

## 1. Web Push Registration Lifecycle

```
[Client (ServiceWorker)]
  ↓ 1. Request Notification.requestPermission()
  ↓ 2. Fetch VAPID public key (GET /api/v1/notifications/push/public-key)
  ↓ 3. navigator.serviceWorker.ready.pushManager.subscribe()
  ↓ 4. POST /api/v1/notifications/push/subscribe { endpoint, keys }
[Server (PushSubscription Model)]
  ↓ 5. Store endpoint & encryption keys linked to userId
```

---

## 2. Privacy & Payload Security
- Push notifications never include private birth data, astrological calculations, or sensitive chat contents in the push payload.
- Generic title and body text are delivered with secure deep link URLs (e.g. `/reports/rep_123` or `/dashboard`).
- User notification preferences (`dailyInsight`, `transitEvents`, `subscription`, `report`) are enforced prior to dispatch.
