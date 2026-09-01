# Phase 16 Operational & SRE API Reference

## 1. Health & Probes

### `GET /api/v1/health`
- **Auth**: Public
- **Response**: `{ success: true, data: { status: "ok", uptime: number, environment: string } }`

### `GET /api/v1/health/liveness`
- **Auth**: Public
- **Response**: `{ status: "alive", uptime: number, timestamp: string }`

### `GET /api/v1/health/readiness` (alias `/ready`)
- **Auth**: Public
- **Response**: `{ success: true, data: { status: "ready", subsystems: { database, cache, workers, ... } } }`

---

## 2. Telemetry & Metrics

### `GET /api/v1/metrics`
- **Auth**: Public (or internal cluster IP)
- **Response**: Content-Type `text/plain; version=0.0.4` (Prometheus format)

---

## 3. Feature Flags API

### `GET /api/v1/features`
- **Auth**: Optional Bearer Token
- **Response**: `{ success: true, data: { flags: { AI_MEMORY: true, VOICE_AI: false, ... } } }`
