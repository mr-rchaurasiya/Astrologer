# Observability, Telemetry & Security Hardening

## Observability & Distributed Tracing

### 1. Request ID Tracking (`X-Request-ID`)
Every incoming HTTP request is assigned a unique UUIDv4 identifier via `requestId` middleware:
- Attached to response headers as `X-Request-ID`.
- Attached to Express request context as `req.id`.
- Passed into structured Winston log messages and security audit entries.

### 2. Structured Logging
- Winston logger configured with JSON format in production.
- Sensitive parameters (passwords, tokens, CVV, payment secrets) are sanitized before writing to logs.
- Daily rotation log files for standard and error streams.

### 3. Health & Readiness Probes
- `GET /api/v1/health`: Liveness endpoint returning server timestamp, uptime, and process status.
- `GET /api/v1/health/ready`: Readiness endpoint returning database connectivity status (`connected`, `connecting`, `disconnected`).

## Security Hardening Matrix

| Security Domain | Implementation Standard |
| :--- | :--- |
| **Authentication** | Dual-token model: short-lived 15m Access Token + 7d HTTP-only Refresh Token. |
| **Password Hashing** | Bcrypt with 12 salt rounds. |
| **Authorization** | Strict user ownership isolation (`profile.userId === req.user.id`, `payment.userId === req.user.id`). |
| **Admin Protection** | `requireRole('admin')` middleware with 403 Forbidden for unauthorized requests. |
| **Secret Isolation** | Zero secrets in client-side bundles. `RAZORPAY_KEY_SECRET`, `JWT_SECRET`, and `AI_API_KEY` exist exclusively on the server. |
| **Payment Integrity** | HMAC-SHA256 signature verification with constant-time equality comparisons. |
| **Webhook Idempotency** | Event ID deduplication and payload SHA256 hashing. |
| **Rate Limiting** | Tiered rate limiter for general API endpoints and strict limiter for authentication / AI endpoints. |
| **CORS Policy** | Whitelisted origin validation preventing unauthorized cross-origin invocations. |
| **Security Headers** | Helmet-configured CSP, XSS protection, anti-clickjacking frame guards, and HSTS. |
