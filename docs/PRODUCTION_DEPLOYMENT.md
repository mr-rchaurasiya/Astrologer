# Production Deployment Guide

## Prerequisites
- Node.js >= 18.x
- MongoDB >= 6.0 (or MongoDB Atlas cluster)
- Domain with TLS/SSL certificate (HTTPS)
- Razorpay account (Key ID & Key Secret)
- OpenAI API Key (or compatible AI provider)
- SMTP server (or SendGrid / AWS SES) for transactional emails

## Environment Configuration

Create a production `.env` file in `server/` with the following variables:

```bash
# Core Server Configuration
NODE_ENV=production
PORT=5000
HOST=0.0.0.0
CORS_ORIGIN=https://astrologer.yourdomain.com

# Database Connection
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/astrologer_prod?retryWrites=true&w=majority

# JWT Authentication Secrets
JWT_SECRET=super_secure_random_production_jwt_secret_at_least_64_chars_long
JWT_REFRESH_SECRET=super_secure_random_production_jwt_refresh_secret_at_least_64_chars_long
JWT_ACCESS_EXPIRATION=15m
JWT_REFRESH_EXPIRATION=7d

# Payments (Razorpay)
PAYMENTS_ENABLED=true
PAYMENT_PROVIDER=razorpay
RAZORPAY_KEY_ID=rzp_live_xxxxxxxxxxxxxx
RAZORPAY_KEY_SECRET=xxxxxxxxxxxxxxxxxxxxxxxx
RAZORPAY_WEBHOOK_SECRET=xxxxxxxxxxxxxxxxxxxxxxxx

# AI & Voice Consultation
AI_PROVIDER=openai
AI_API_KEY=sk-proj-xxxxxxxxxxxxxxxxxxxxxxxx
AI_MODEL=gpt-4o-mini
VOICE_ENABLED=true
VOICE_PROVIDER=openai
VOICE_STT_MODEL=whisper-1
VOICE_TTS_MODEL=tts-1
VOICE_TTS_VOICE=nova

# Storage Configuration
STORAGE_TYPE=local
STORAGE_LOCAL_PATH=storage/reports

# Transactional Email (SMTP)
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=apikey
SMTP_PASSWORD=SG.xxxxxxxxxxxxxxxxxxxxxxxx
EMAIL_FROM="Vedic Astrologer <no-reply@yourdomain.com>"
```

## Build and Run Steps

### 1. Backend Build & Process Management
```bash
cd server
npm ci --production=false
npm run build
npm prune --production

# Run with PM2 or Docker
pm2 start dist/server.js --name "astrologer-server" -i max
```

### 2. Frontend Build & Static Hosting
```bash
cd client
npm ci
npm run build

# Serve dist/ folder using NGINX or Cloudflare Pages
```

## Health Checks & Monitoring
- **Liveness Probe**: `GET /api/v1/health` (returns `200 OK`)
- **Readiness Probe**: `GET /api/v1/health/ready` (validates MongoDB connection state)
