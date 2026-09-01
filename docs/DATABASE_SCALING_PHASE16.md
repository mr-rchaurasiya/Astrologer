# MongoDB Performance, Indexing & Query Scaling (Phase 16)

## 1. Compound Index Catalog

| Collection | Indexed Fields | Purpose |
|---|---|---|
| `users` | `{ email: 1 }` (unique), `{ role: 1 }` | Fast authentication & admin filtering |
| `birthprofiles` | `{ userId: 1, isPrimary: 1 }`, `{ userId: 1, createdAt: -1 }` | Profile list & primary lookup |
| `chatmessages` | `{ sessionId: 1, createdAt: 1 }`, `{ userId: 1, profileId: 1, createdAt: -1 }` | Fast conversation replay & user history |
| `payments` | `{ userId: 1, createdAt: -1 }`, `{ userId: 1, status: 1 }`, `{ orderId: 1 }` | Idempotent payment verification & user billing ledger |
| `notifications` | `{ userId: 1, isRead: 1, createdAt: -1 }` | Unread badge counts & user feed |
| `dailyinsights` | `{ profileId: 1, date: 1, category: 1 }` (unique) | O(1) daily horoscope cache lookups |
| `articles` | `{ status: 1, publishedAt: -1 }`, `{ category: 1, status: 1, publishedAt: -1 }` | SEO blog pagination & category filtering |
| `aiusagelogs` | `{ userId: 1, createdAt: -1 }`, `{ model: 1, createdAt: -1 }` | Cost analysis & quota aggregation |

---

## 2. Bounded Query & Pagination Guardrails
- All user list endpoints enforce a hard cap of `limit <= 100` via `PaginationHelper`.
- Deep queries utilize cursor-based offsets (`PaginationHelper.encodeCursor`) avoiding expensive `skip()` performance penalties at scale.
