# Production Cloud Deployment Guide (Phase 11)

## 1. Prerequisites
- Linux host (Ubuntu 22.04 LTS / Debian 12 / AWS EC2 / DigitalOcean Droplet / GCP Compute Engine) or managed container runtime (AWS ECS / GCP Cloud Run / Kubernetes).
- Docker 24+ and Docker Compose v2.
- Registered domain name (e.g. `astrologer.ai`).

---

## 2. Step-by-Step Production Deployment

### Step 1: Clone Repository & Configure Environment
```bash
git clone https://github.com/your-org/astrologer.git /var/www/astrologer
cd /var/www/astrologer
cp server/.env.example server/.env
```

Populate `server/.env` with your production values:
```ini
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/astrologer_prod?retryWrites=true&w=majority
CLIENT_URL=https://app.astrologer.ai
ALLOWED_ORIGINS=https://app.astrologer.ai,https://admin.astrologer.ai
JWT_ACCESS_SECRET=your_super_secret_64_character_access_key
JWT_REFRESH_SECRET=your_super_secret_64_character_refresh_key
AI_API_KEY=sk-proj-your_production_openai_api_key
RAZORPAY_KEY_ID=rzp_live_your_live_key_id
RAZORPAY_KEY_SECRET=your_live_razorpay_secret
RAZORPAY_WEBHOOK_SECRET=your_live_webhook_secret
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASSWORD=your_sendgrid_api_key
EMAIL_FROM=noreply@astrologer.ai
REDIS_URL=redis://redis:6379
```

### Step 2: Build & Start Containers
```bash
docker-compose -f docker-compose.production.yml up --build -d
```

### Step 3: Verify Subsystem Readiness
```bash
curl -i http://localhost/api/v1/health/ready
```
Ensure HTTP response is `200 OK` with all subsystems marked `healthy` or `configured`.

---

## 3. Zero-Downtime Rolling Update Workflow
1. Pull new release tag: `git fetch --tags && git checkout v1.1.0`
2. Build new container: `docker-compose -f docker-compose.production.yml build server client`
3. Execute rolling restart: `docker-compose -f docker-compose.production.yml up -d --no-deps --scale server=2 server`
4. Confirm health, then prune old container: `docker-compose -f docker-compose.production.yml up -d --no-deps server`
