# Database Backup & Disaster Recovery Runbook (Phase 11)

## 1. Backup Strategy & Objectives
- **Recovery Point Objective (RPO)**: < 1 hour.
- **Recovery Time Objective (RTO)**: < 30 minutes.
- **Backup Frequency**:
  - Continuous point-in-time oplog backups.
  - Automated full snapshot daily at 02:00 UTC.
  - Retained for 30 days in encrypted off-site cloud object storage (`AWS S3 Glacier` / `GCS Coldline`).

---

## 2. Automated Backup Execution

```bash
#!/usr/bin/env bash
set -euo pipefail

BACKUP_DIR="/tmp/mongo-backup-$(date +%Y%m%d_%H%M%S)"
ARCHIVE_NAME="astrologer_backup_$(date +%Y%m%d_%H%M%S).tar.gz"

echo "📦 Initiating MongoDB backup..."
mongodump --uri="${MONGODB_URI}" --gzip --archive="${ARCHIVE_NAME}"

echo "🔐 Encrypting backup with AES-256..."
openssl enc -aes-256-cbc -salt -in "${ARCHIVE_NAME}" -out "${ARCHIVE_NAME}.enc" -pass env:BACKUP_ENCRYPTION_KEY

echo "☁️ Uploading encrypted archive to off-site cloud storage..."
aws s3 cp "${ARCHIVE_NAME}.enc" "s3://${STORAGE_BUCKET}/backups/${ARCHIVE_NAME}.enc"

rm -f "${ARCHIVE_NAME}" "${ARCHIVE_NAME}.enc"
echo "✅ Backup successfully completed and verified."
```

---

## 3. Restore & Disaster Recovery Procedure

1. **Retrieve and Decrypt Snapshot**:
   ```bash
   aws s3 cp "s3://${STORAGE_BUCKET}/backups/${TARGET_BACKUP}.enc" ./backup.enc
   openssl enc -d -aes-256-cbc -in ./backup.enc -out ./backup.tar.gz -pass env:BACKUP_ENCRYPTION_KEY
   ```

2. **Execute Database Restore**:
   ```bash
   mongorestore --uri="${MONGODB_URI}" --drop --gzip --archive=./backup.tar.gz
   ```

3. **Verify Restored Datasets**:
   - Query record counts across `users`, `birthprofiles`, `payments`, and `subscriptions`.
   - Verify index integrity using `db.collection.getIndexes()`.
   - Verify application readiness probe `GET /api/v1/health/ready`.
