# Production Structured Logging & Error Tracking (Phase 11)

## 1. Structured Logging Standard
All log output is rendered as single-line JSON objects conforming to the schema below:

```json
{
  "timestamp": "2026-09-01T12:00:00.000Z",
  "level": "INFO",
  "message": "User registered successfully",
  "environment": "production",
  "meta": {
    "requestId": "req_123456",
    "userId": "65fc123456789abcdef01234",
    "ip": "203.0.113.1"
  }
}
```

---

## 2. Automated PII & Secret Redaction
The logging system automatically scans and redacts the following key patterns:
- `password`, `passwordHash`
- `token`, `accessToken`, `refreshToken`, `authorization`
- `secret`, `apiKey`, `key`
- `razorpayKeySecret`, `razorpayWebhookSecret`
- `smtpPassword`
- `storageAccessKey`, `storageSecretKey`

---

## 3. Log Levels & Environment Policies
- **`development`**: `DEBUG` / `INFO`
- **`production`**: `INFO` / `WARN` / `ERROR` (managed via `LOG_LEVEL` environment variable)
- **`test`**: Silenced by default for clean test runner output.
