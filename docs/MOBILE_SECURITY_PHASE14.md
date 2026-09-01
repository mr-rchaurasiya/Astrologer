# Mobile & Cross-Platform Security Audit (Phase 14)

## 1. Client Storage Classification

| Storage Mechanism | Permitted Data Classes | Strictly Prohibited Data |
|---|---|---|
| **localStorage** | Theme preference (`dark`/`light`), Chart style preference (`north`/`south`/`east`) | JWT Access Tokens, Refresh Tokens, Passwords, Payment details, Private Chat history |
| **sessionStorage** | Safe pending deep link redirect (`astrologer_pending_redirect`), PWA install dismiss state | Authentication secrets, Personally Identifiable Information |
| **Service Worker Cache** | Pre-cached static assets (`.js`, `.css`, `.svg`, `.woff2`) | Any response from `/api/v1/auth/`, `/api/v1/payments/`, `/api/v1/ai/chat`, `/api/v1/account/` |
| **HttpOnly Cookies** | Refresh Token with `SameSite=Strict` and `Secure=true` | Inaccessible to JavaScript; immune to XSS token theft |
