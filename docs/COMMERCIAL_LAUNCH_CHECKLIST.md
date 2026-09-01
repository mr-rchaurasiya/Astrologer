# Commercial Launch Readiness Checklist (Phase 11)

## 1. Infrastructure & Networking
- [x] Multi-stage production Docker images compiled with non-root security.
- [x] Nginx reverse proxy configured with gzip compression, security headers, and SSE proxying.
- [x] Health (`/api/v1/health`) and Readiness (`/api/v1/health/ready`) probes validated.
- [x] Dynamic origin CORS whitelist protecting API from unauthorized web clients.
- [ ] Custom apex & subdomain DNS records (A / CNAME) pointed to cloud load balancer.
- [ ] Wildcard TLS certificate installed with automatic renewal via Let's Encrypt / Cloudflare.

---

## 2. Database & Storage
- [x] MongoDB connection pooling configured (`maxPoolSize: 50`, socket timeouts).
- [x] All 28 compound database indexes verified.
- [x] Automated backup script and restore verification procedures tested.
- [x] Cloud object storage abstraction implemented with authenticated signed URLs.

---

## 3. Payments & Monetization
- [x] Centralized plan configuration synchronized between frontend and backend.
- [x] Server-authoritative order creation and coupon discount math verified.
- [x] Razorpay Webhook HMAC-SHA256 signature verification and idempotency verified.
- [x] Automated daily payment reconciliation tested.
- [ ] Switch Razorpay dashboard to **Live Mode** and configure production webhook secret.

---

## 4. Email & Notifications
- [x] Transactional email provider integrated with HTML and text templates.
- [x] Asynchronous background queue prevents slow SMTP calls from blocking HTTP responses.
- [ ] Production DNS SPF, DKIM, and DMARC TXT records verified for `astrologer.ai`.

---

## 5. Security & Observability
- [x] Environment validation with fail-fast on missing production secrets.
- [x] Automated secret leak audit passing with 0 secrets in client bundles.
- [x] Machine-readable structured JSON logging with automatic PII & credential scrubbing.
- [x] Tiered rate limiting protecting Auth, AI, Voice, Reports, Payments, and Sharing.
- [x] All 51 automated test suites passing (217 tests).
