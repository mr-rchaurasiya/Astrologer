# Phase 13 AI API Reference

## Endpoints

### 1. Chat & Streaming
- `POST /api/v1/ai/chat`: Standard grounded consultation with metadata (`intent`, `confidence`, `groundingScore`).
- `POST /api/v1/ai/chat/stream`: Real-time Server-Sent Events (SSE) streaming.
- `POST /api/v1/ai/daily-insight`: Cached daily personalized horoscope insight.

### 2. Dossier & Report Generation
- `POST /api/v1/ai/reports`: Generates structured multi-section report grounded in Phase 12 calculations.
  - Body: `{ profileId: string, reportType: AIReportType, personalization?: object }`
- `GET /api/v1/ai/reports/:id`: Retrieves saved report with user ownership verification.

### 3. Context & Quotas
- `GET /api/v1/ai/context/:profileId`: Introspects selective astrology context for debugging.
- `GET /api/v1/ai/quota`: Returns remaining AI consultations, tokens, and report balance.
