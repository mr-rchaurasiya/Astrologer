# Multi-Channel Notification System

## Overview
The Notification System provides in-app alerts and asynchronous transactional emails (via SMTP) for key lifecycle and astrological events:
- Daily Vedic Insight notifications
- Major planetary transit events (e.g., Sade Sati peaks, Jupiter/Saturn ingress)
- Subscription and billing updates (upgrades, cancellations, invoices)
- PDF report compilation readiness alerts

## Architecture

```
[ Domain Events / Cron Triggers ]
               │
               ▼
     [ NotificationService ]
               │
     ┌─────────┴─────────┐
     ▼                   ▼
[ In-App Ledger ]  [ SMTP Email Provider ]
 (MongoDB Record)   (HTML Email Dispatch)
```

## Notification Preferences

Users can customize their alert channels through `GET /api/v1/notifications/preferences` and `PUT /api/v1/notifications/preferences`:
- `dailyInsight` (boolean)
- `transitEvents` (boolean)
- `subscription` (boolean)
- `payment` (boolean)
- `report` (boolean)
- `emailEnabled` (boolean)
- `inAppEnabled` (boolean)

## In-App Notification Features
- Real-time unread badge indicator (`NotificationBell.tsx`)
- Slide-over notification tray with icon category styling (`NotificationPanel.tsx`)
- Mark single notification as read (`POST /api/v1/notifications/:id/read`)
- Mark all notifications as read (`POST /api/v1/notifications/read-all`)
- Idempotency deduplication using `idempotencyKey` prevents spamming repeat notifications.
