# Product Analytics & Business Intelligence

## Overview
Phase 9 adds high-level business intelligence and product telemetry to understand feature adoption, user engagement, and conversion bottlenecks.

## Tracked Events
- `ai_chat_message`: Chat consultation interactions
- `kundli_viewed`: Chart calculations and divisional switches
- `life_curve_viewed`: Life trajectory explorations
- `report_downloaded`: PDF report generation and streaming
- `recommendation_clicked`: Smart recommendation conversions
- `voice_consultation_used`: Audio interactions

## Admin BI Endpoints
- `POST /api/v1/analytics/events`: Track client-side user interactions.
- `GET /api/v1/analytics/activity`: User self-activity timeline.
- `GET /api/v1/admin/analytics/business-intelligence?days=30`: Aggregate event breakdown, top events, active user counts, and conversion funnel statistics.
