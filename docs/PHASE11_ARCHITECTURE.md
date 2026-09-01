# Phase 11 Architecture: Production Infrastructure & Cloud Launch

## 1. System Overview

```
+-----------------------------------------------------------------------------------+
|                                 CLIENT LAYER (PWA)                                |
|  - React 18 + Vite (SPA)                                                          |
|  - Progressive Web App Service Worker (Strict Privacy Partitioning)               |
|  - Dynamic Nginx Web Server (Gzip, Asset Hashing, Long-Lived Cache Headers)       |
+------------------------------------------+----------------------------------------+
                                           | HTTPS / REST / SSE / WSS
+------------------------------------------v----------------------------------------+
|                               INGRESS REVERSE PROXY                               |
|  - Nginx (Port 80 / 443)                                                          |
|  - SSL/TLS Termination & HTTP->HTTPS Redirect                                     |
|  - Security Headers (CSP, HSTS, X-Content-Type-Options, X-Frame-Options)          |
|  - SSE / WebSocket Connection Proxying                                            |
|  - Request Body Limiting (25MB)                                                   |
+------------------------------------------+----------------------------------------+
                                           | Reverse Proxy to Port 5000
+------------------------------------------v----------------------------------------+
|                                BACKEND APPLICATION                                |
|  - Node.js 20 Express Server (Running as non-root user `nodejs`)                  |
|  - Dynamic CORS Whitelist & Tiered Rate Limiting                                  |
|  - Environment Startup Validation (`validateEnvironment()`)                      |
|  - Polymorphic Cache Layer (Redis with graceful In-Memory Fallback)               |
|  - Asynchronous Background Job Queue (Email, Daily Insights, Cleanup)             |
|  - Structured JSON Logging & Error Telemetry (Auto-PII Redaction)                 |
|  - Server-Authoritative Razorpay Engine & Webhook Verification                    |
|  - Cloud Object Storage Abstraction (S3/R2/GCS with Signed URLs)                  |
+-------------------+------------------------------------+--------------------------+
                    |                                    |
+-------------------v------------------+  +--------------v--------------------------+
|           MONGODB CLUSTER            |  |              REDIS CLUSTER              |
|  - Connection Pooling (50 conn max)  |  |  - Distributed Cache & State            |
|  - Auto-reconnect & Socket Timeouts  |  |  - Namespace Isolation (`astrologer:`)  |
|  - 28 Compound Indexes               |  |  - Key Invalidation & TTL Policies      |
+--------------------------------------+  +-----------------------------------------+
```

---

## 2. Key Architectural Guarantees
1. **Zero Secret Leakage**: Server secrets never cross into client bundles or error payloads.
2. **Graceful Degradation**: If Redis or Cloud Storage is unavailable, the system transparently falls back to local providers without interrupting user sessions.
3. **Resilient Shutdown**: SIGTERM signals cleanly drain HTTP requests and background jobs before closing database connections.
