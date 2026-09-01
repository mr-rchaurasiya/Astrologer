# Phase 14 Mobile & Push Notification API Reference

## 1. Web Push Notification Endpoints

### 1.1 `GET /api/v1/notifications/push/public-key`
- **Auth**: Bearer Token
- **Response**: `{ success: true, data: { publicKey: string } }`

### 1.2 `POST /api/v1/notifications/push/subscribe`
- **Auth**: Bearer Token
- **Body**:
```json
{
  "endpoint": "https://fcm.googleapis.com/fcm/send/...",
  "keys": {
    "p256dh": "BNc...",
    "auth": "tB..."
  },
  "deviceType": "android",
  "platform": "Android"
}
```
- **Response**: `{ success: true, message: "Push subscription registered successfully", data: { subscriptionId: string } }`

### 1.3 `POST /api/v1/notifications/push/unsubscribe`
- **Auth**: Bearer Token
- **Body**: `{ "endpoint": "https://fcm.googleapis.com/fcm/send/..." }`
- **Response**: `{ success: true, message: "Push subscription deactivated", data: { unsubscribed: boolean } }`
