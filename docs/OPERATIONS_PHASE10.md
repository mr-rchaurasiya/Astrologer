# Production Operations, Feature Flags & Observability (Phase 10)

## 1. Dynamic Feature Flags (`server/src/features/featureFlags.ts`)
Server-controlled flags allow operational toggling without code deployments:
- `pwa_features`: Controls PWA service worker prompts and offline banners.
- `multi_style_charts`: Toggles North/South/East Indian chart styles.
- `kundli_sharing`: Toggles public chart sharing capabilities.
- `conversation_summary`: Toggles AI background summarization.
- `saved_consultations`: Toggles saved consultation archiving.
- `coupons_enabled`: Toggles coupon redemption at checkout.
- `referral_system`: Toggles referral invite loops.
- `voice_consultation`: Toggles voice STT/TTS consultation.

## 2. Notification Delivery Engine (`Notification.ts`, `notification.service.ts`)
- **Status Lifecycle**: Tracks state transitions (`queued` -> `sent` -> `delivered` -> `failed` -> `read`).
- **Priority Queues**: `urgent`, `high`, `normal`, `low`.
- **Deduplication**: Enforces unique idempotency keys per notification event.

## 3. Revenue & AI Telemetry (`admin.controller.ts`)
- `GET /api/v1/admin/analytics/revenue`: Real-time MRR, ARR, and captured payment ledger.
- `GET /api/v1/admin/analytics/ai-feedback`: Response helpfulness distribution, issue category breakdown, and feedback comments.
