# Production Environment Configuration Reference

## Overview
This reference specifies all environment variables required to operate the Vedic Astrology platform across development, staging, and production tiers. **Never commit real credentials to version control.**

---

## Variable Specifications

| Variable | Category | Required | Default / Example Placeholder | Description |
| :--- | :--- | :--- | :--- | :--- |
| `NODE_ENV` | Server | Required | `production` | Operational environment mode (`development`, `test`, `production`). |
| `PORT` | Server | Optional | `5000` | HTTP port for Express backend server. |
| `HOST` | Server | Optional | `0.0.0.0` | Network binding interface. |
| `CLIENT_URL` | Server | Required | `https://astrologer.app` | Whitelisted origin for CORS headers and cookie domains. |
| `MONGODB_URI` | Database | Required | `mongodb+srv://user:pass@cluster.mongodb.net/astrologer_prod` | Connection string for MongoDB Atlas / Replica Set. |
| `JWT_ACCESS_SECRET` | Security | Required | `[64+ random hex characters]` | Symmetric secret key signing 15-minute access tokens. |
| `JWT_REFRESH_SECRET` | Security | Required | `[64+ random hex characters]` | Symmetric secret key signing 7-day refresh tokens. |
| `JWT_ACCESS_EXPIRES_IN` | Security | Optional | `15m` | Access token lifespan string. |
| `JWT_REFRESH_EXPIRES_IN` | Security | Optional | `7d` | Refresh token lifespan string. |
| `PAYMENTS_ENABLED` | Billing | Optional | `true` | Enables Razorpay payment gateway integration. |
| `PAYMENT_PROVIDER` | Billing | Optional | `razorpay` | Payment provider identifier (`razorpay`). |
| `RAZORPAY_KEY_ID` | Billing | Optional | `rzp_live_xxxxxxxxxxxxxx` | Public Key ID for Razorpay checkout. |
| `RAZORPAY_KEY_SECRET` | Billing | Optional | `xxxxxxxxxxxxxxxxxxxxxxxx` | Private Key Secret for server verification (Strictly Server-Side). |
| `RAZORPAY_WEBHOOK_SECRET`| Billing | Optional | `xxxxxxxxxxxxxxxxxxxxxxxx` | HMAC secret verifying incoming Razorpay webhook webhooks. |
| `AI_PROVIDER` | AI | Optional | `openai` | AI LLM provider backend (`openai`). |
| `AI_API_KEY` | AI | Optional | `sk-proj-xxxxxxxxxxxxxxxx` | OpenAI API key for consultation chat and daily insights. |
| `AI_MODEL` | AI | Optional | `gpt-4o-mini` | LLM model identifier. |
| `VOICE_ENABLED` | Voice | Optional | `true` | Enables speech-to-text and text-to-speech features. |
| `VOICE_PROVIDER` | Voice | Optional | `openai` | Voice engine provider (`openai`). |
| `STORAGE_TYPE` | Reports | Optional | `local` | Storage provider for PDF reports (`local` or `s3`). |
| `STORAGE_LOCAL_PATH` | Reports | Optional | `storage/reports` | Local disk filesystem directory for PDF dossier archives. |
| `SMTP_HOST` | Email | Optional | `smtp.sendgrid.net` | Transactional email SMTP server address. |
| `SMTP_PORT` | Email | Optional | `587` | SMTP port (587 for TLS, 465 for SSL). |
| `SMTP_USER` | Email | Optional | `apikey` | SMTP authentication username. |
| `SMTP_PASSWORD` | Email | Optional | `SG.xxxxxxxxxxxxxxxxxxxx` | SMTP authentication secret password. |
| `EMAIL_FROM` | Email | Optional | `"Astrologer" <noreply@astrologer.app>` | Default sender display header. |
