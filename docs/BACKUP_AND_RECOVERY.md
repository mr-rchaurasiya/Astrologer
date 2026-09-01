# Database Backup, Disaster Recovery & Data Retention

## 1. Automated MongoDB Backup Strategy

### Continuous / Daily Snapshots
- **Tool**: `mongodump` or MongoDB Atlas Continuous Cloud Backups.
- **Schedule**: Nightly full backup (02:00 UTC) with 30-day retention.
- **Encrypted Archive**: AES-256 encrypted archives stored in secondary cloud storage bucket (AWS S3 / GCS).

```bash
# Automated dump script (runs via Cron)
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
mongodump --uri="$MONGODB_URI" --gzip --archive="/backups/astrologer_db_${TIMESTAMP}.gz"
```

---

## 2. Restoration & Disaster Recovery Runbook

```bash
# Point-in-time restore
mongorestore --uri="$MONGODB_URI" --gzip --archive="/backups/astrologer_db_[TIMESTAMP].gz" --drop
```

---

## 3. Data Retention & GDPR Compliance
- **Account Deletion Cascade**: When a user triggers account deletion (`DELETE /api/v1/account`), all birth profiles, chat consultations, PDF reports, and notification records are permanently deleted from database and storage.
- **Financial Audit Ledger**: Payment and webhook event logs retain anonymized transaction IDs for statutory 7-year accounting compliance without persisting personal identifiers.
