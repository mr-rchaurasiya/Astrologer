# Database Performance & Indexing Strategy

## Overview
To guarantee sub-millisecond query performance at production scale, all Mongoose models in the platform are optimized with targeted single and compound indexes designed around high-frequency read and aggregation patterns.

---

## Indexing Matrix

| Collection / Model | Compound & Single Indexes | Primary Use Case & Query Pattern |
| :--- | :--- | :--- |
| **`User`** | `email: 1 (unique)` | Authentication login lookups and uniqueness enforcement. |
| **`BirthProfile`** | `userId: 1, isPrimary: 1`<br>`userId: 1, createdAt: -1` | Fetching primary birth chart for native dashboard and listing profile history. |
| **`ChatSession`** | `userId: 1, updatedAt: -1`<br>`profileId: 1` | Paginated session lists sorted by most recent activity; profile context queries. |
| **`ChatMessage`** | `sessionId: 1, createdAt: 1`<br>`userId: 1, createdAt: -1` | Sequential chat history reconstruction and audit log retention scanning. |
| **`DailyInsight`** | `profileId: 1, date: 1, category: 1 (unique)`<br>`userId: 1, date: -1` | Fast atomic cache lookups and preventing duplicate paid AI calls on the same day. |
| **`Notification`** | `userId: 1, createdAt: -1`<br>`userId: 1, isRead: 1`<br>`userId: 1, idempotencyKey: 1 (sparse)` | Real-time notification tray, unread counter badges, and idempotent deduplication. |
| **`NotificationPreference`**| `userId: 1 (unique)` | Direct 1-to-1 lookup for notification dispatch routing. |
| **`Payment`** | `userId: 1, createdAt: -1`<br>`userId: 1, status: 1`<br>`provider: 1, providerOrderId: 1`<br>`providerPaymentId: 1 (sparse)` | User invoice history, entitlement verification, and Razorpay signature/order lookups. |
| **`Report`** | `userId: 1, createdAt: -1`<br>`userId: 1, profileId: 1, createdAt: -1`<br>`storageKey: 1 (unique)` | Report library listing, profile dossier history, and secure download key matching. |
| **`Subscription`** | `userId: 1 (unique)`<br>`status: 1, expiresAt: 1`<br>`plan: 1, status: 1` | O(1) user entitlement lookups and cron background expiry reconciliation. |
| **`UsageRecord`** | `userId: 1, feature: 1, date: 1 (unique)` | Atomic daily quota checks and rate limit enforcement. |
| **`WebhookEvent`** | `provider: 1, eventId: 1 (unique)`<br>`createdAt: -1` | Idempotent webhook processing and replay attack rejection. |
| **`AuditLog`** | `userId: 1, timestamp: -1`<br>`action: 1, timestamp: -1`<br>`timestamp: -1` | Admin security compliance queries, action filtering, and time-range investigations. |
