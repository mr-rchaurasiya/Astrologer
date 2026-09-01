# Phase 14 Architecture: Mobile-First, Advanced PWA & Cross-Platform

## 1. System Overview

```
+-------------------------------------------------------------------------------+
|                       CLIENT CROSS-PLATFORM ARCHITECTURE                      |
|                                                                               |
|  [Mobile Browser PWA / Native Container (Capacitor)]                          |
|  ├── Responsive Viewports (320px, 360px, 375px, 390px, 414px, Tablet, Desktop)|
|  ├── Mobile Bottom Navigation (<MobileBottomNav />) - >= 44x44px Targets      |
|  ├── Slide-over Secondary Drawer (<MobileDrawer />)                          |
|  ├── Safe Deep Link Engine (DeepLinkManager)                                  |
|  ├── PWA Engine (sw.js v14.0.0, manifest.json, InstallAppPrompt iOS/Android)  |
|  └── Web Push Registration & Token Lifecycle                                  |
+---------------------------------------+---------------------------------------+
                                        | HTTPS / WSS / Push Service
+---------------------------------------v---------------------------------------+
|                               EXPRESS BACKEND API                             |
|  ├── Auth & Session Governance (JWT with HttpOnly refresh cookies)            |
|  ├── Web Push Lifecycle (POST /push/subscribe, POST /push/unsubscribe)       |
|  ├── PushNotificationService (Safe generic payloads, Preference checks)       |
|  └── PushSubscription Mongoose Model (Device registration & token management) |
+-------------------------------------------------------------------------------+
```
