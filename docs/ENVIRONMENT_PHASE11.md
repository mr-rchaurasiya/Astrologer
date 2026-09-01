# Production Environment Variable Reference (Phase 11)

This document provides the exhaustive specification for all environment variables used in the Astrologer platform across development, test, staging, and production environments.

---

## 1. Server Environment Variables

| Variable | Required in Prod | Purpose | Default / Example | Secret? |
|---|---|---|---|---|
| `NODE_ENV` | Yes | Target runtime mode (`development`, `test`, `staging`, `production`) | `development` | No |
| `PORT` | No | Express HTTP listening port | `5000` | No |
| `CLIENT_URL` | Yes | Frontend application root URL (used for CORS and shared links) | `https://app.astrologer.ai` | No |
| `ALLOWED_ORIGINS` | No | Comma-separated list of allowed CORS origins | `https://app.astrologer.ai,https://admin.astrologer.ai` | No |
| `MONGODB_URI` | Yes | MongoDB connection string with credentials & replica set | `mongodb+srv://user:pass@cluster.mongodb.net/astrologer_prod` | **YES** |
| `JWT_ACCESS_SECRET` | Yes | HMAC key for signing short-lived access tokens (15m) | *(64-char random hex)* | **YES** |
| `JWT_REFRESH_SECRET` | Yes | HMAC key for signing long-lived refresh tokens (7d) | *(64-char random hex)* | **YES** |
| `JWT_ACCESS_EXPIRES_IN` | No | Access token lifespan | `15m` | No |
| `JWT_REFRESH_EXPIRES_IN` | No | Refresh token lifespan | `7d` | No |
| `AI_PROVIDER` | No | LLM provider (`openai`) | `openai` | No |
| `AI_API_KEY` | Yes | OpenAI API key for consultations and summarization | `sk-proj-...` | **YES** |
| `AI_MODEL` | No | AI model name for chat and insights | `gpt-4o-mini` | No |
| `AI_BASE_URL` | No | Custom proxy endpoint for LLM API | `https://api.openai.com/v1` | No |
| `RAZORPAY_KEY_ID` | Yes | Razorpay Public Key ID | `rzp_live_...` | No |
| `RAZORPAY_KEY_SECRET` | Yes | Razorpay Secret Key for HMAC signature verification | `...` | **YES** |
| `RAZORPAY_WEBHOOK_SECRET` | Yes | Webhook secret for validating Razorpay webhook events | `...` | **YES** |
| `SMTP_HOST` | Yes | SMTP server hostname for transactional emails | `smtp.sendgrid.net` | No |
| `SMTP_PORT` | No | SMTP port (`587` for STARTTLS, `465` for TLS) | `587` | No |
| `SMTP_USER` | Yes | SMTP username | `apikey` | No |
| `SMTP_PASSWORD` | Yes | SMTP password or API token | `...` | **YES** |
| `EMAIL_FROM` | No | From email address for outgoing system emails | `noreply@astrologer.ai` | No |
| `REDIS_URL` | No | Redis connection URI for distributed caching and queues | `redis://default:pass@redis-host:6379` | **YES** |
| `STORAGE_PROVIDER` | No | File storage type (`local` or `cloud`) | `local` | No |
| `STORAGE_BUCKET` | Conditional | S3 / R2 / GCS Bucket name (required if `STORAGE_PROVIDER=cloud`) | `astrologer-reports-prod` | No |
| `STORAGE_REGION` | No | Cloud storage region | `ap-south-1` | No |
| `STORAGE_ACCESS_KEY` | Conditional | Cloud storage IAM access key | `AKIA...` | **YES** |
| `STORAGE_SECRET_KEY` | Conditional | Cloud storage IAM secret key | `...` | **YES** |
| `SENTRY_DSN` | No | Sentry DSN for error telemetry | `https://...@sentry.io/...` | No |
| `LOG_LEVEL` | No | Minimum logging level (`debug`, `info`, `warn`, `error`) | `info` | No |

---

## 2. Frontend Environment Variables

> [!CAUTION]
> Frontend bundles are publicly served. **NEVER** expose server secrets, database URIs, API keys, or private HMAC tokens in the client configuration!

| Variable | Required in Prod | Purpose | Example |
|---|---|---|---|
| `VITE_API_URL` | No | Backend API endpoint base (defaults to relative `/api/v1`) | `https://api.astrologer.ai/api/v1` |
| `VITE_RAZORPAY_KEY_ID` | Yes | Public Razorpay Key ID for client checkout modal | `rzp_live_...` |
| `VITE_APP_ENV` | No | Client environment indicator (`production`, `staging`, `development`) | `production` |
| `VITE_SENTRY_DSN` | No | Sentry DSN for frontend exception telemetry | `https://...@sentry.io/...` |

---

## 3. Startup Validation Rules
1. In `production` and `staging`, the application invokes `validateEnvironment()` at startup.
2. Missing critical secrets (`MONGODB_URI`, `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`, `CLIENT_URL`) will throw an error and terminate execution immediately before opening network ports.
3. Development and testing run with safe local mock defaults.
