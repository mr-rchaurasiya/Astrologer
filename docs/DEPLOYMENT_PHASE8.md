# Phase 8 Production Deployment & Operations Manual

## 1. Prerequisites
- **Node.js**: >= 18.18.0 LTS
- **Database**: MongoDB >= 6.0 with Replica Set (required for Mongoose transactions if used)
- **Reverse Proxy**: NGINX / Cloudflare with TLSv1.3 Termination and HTTP/2
- **Process Manager**: PM2 or Docker / Kubernetes container runtime

---

## 2. Production Build Commands

```bash
# 1. Install Dependencies
npm ci

# 2. Build Backend Server
npm --prefix server run build

# 3. Build Frontend Single-Page Application
npm --prefix client run build

# 4. Run Test Verification Matrix
npm --prefix server run test -- --run
npm --prefix client run test -- --run
```

---

## 3. Webhook & Payment Gateway Configuration
1. Configure Razorpay Dashboard Webhook URL: `https://api.astrologer.app/api/v1/payments/webhook`.
2. Subscribe to events: `payment.captured`, `payment.failed`, `order.paid`.
3. Set secret in `server/.env` as `RAZORPAY_WEBHOOK_SECRET`.

---

## 4. Health & Monitoring Endpoints
- **Liveness Probe**: `GET /api/v1/health` (HTTP 200)
- **Readiness Probe**: `GET /api/v1/health/ready` (HTTP 200 if MongoDB connected; HTTP 503 if disconnected)
