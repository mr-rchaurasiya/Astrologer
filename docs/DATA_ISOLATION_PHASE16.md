# Data Isolation & Multi-Tenant Security (Phase 16)

## 1. Multi-Tenant IDOR Defenses
Every database query retrieving or modifying user data enforces `userId: req.user.id`:

- **Birth Profiles**: User B cannot view, edit, or delete User A's birth charts.
- **AI Chat & Sessions**: User B cannot view or append to User A's chat history.
- **AI Memory**: User B cannot access User A's private astrological preferences.
- **PDF Reports**: User B cannot download User A's generated horoscope dossiers.
- **Payment Records**: User B cannot inspect User A's billing invoices.

---

## 2. Shared Kundli Redaction
- Publicly shared Kundlis via `/shared/kundli/:token` sanitize exact birth time, seconds, and geographical coordinates, rendering only planetary signs and charts without exposing PII.
