# Production Alerting Matrix & Severity Classifications (Phase 11)

## 1. Severity Levels

| Level | Response SLA | Target Channels | Description |
|---|---|---|---|
| **CRITICAL** | < 15 minutes | PagerDuty, SMS, Slack #ops-critical | Outage preventing all users from accessing the platform or completing payments |
| **HIGH** | < 1 hour | Slack #ops-alerts, Email | Subsystem degraded (AI consultation failure, email dispatch down) |
| **MEDIUM** | < 4 hours | Slack #ops-general | Non-critical warnings (rate limit spikes, elevated latency) |
| **LOW** | Next business day | Dashboard notifications | Informational anomaly or minor telemetry drift |

---

## 2. Trigger Rules & Thresholds

| Trigger Condition | Severity | Action Required |
|---|---|---|
| MongoDB Connection Lost (`dbState != 1`) | **CRITICAL** | Verify database replica set status and failover connectivity |
| HTTP 5xx error rate > 5% for 5 minutes | **CRITICAL** | Inspect application logs and trigger deployment rollback if needed |
| Razorpay Webhook HMAC failures > 3 in 10m | **HIGH** | Check webhook secret configuration in Razorpay dashboard |
| Payment reconciliation mismatch detected | **HIGH** | Run manual audit in `/admin/reconciliation` |
| AI Consultation latency P95 > 15 seconds | **MEDIUM** | Inspect upstream OpenAI API status or scale concurrent connections |
| Queue backlog > 500 jobs | **MEDIUM** | Scale background worker instances |
| System memory usage > 85% | **MEDIUM** | Profile Node.js heap or allocate higher container memory limits |
