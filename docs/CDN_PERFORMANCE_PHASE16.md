# CDN & Static Asset Performance (Phase 16)

## 1. Static Asset Caching Hierarchy

| Asset Type | Cache Directive | TTL |
|---|---|---|
| **Vite JS/CSS Chunks** (`/assets/*-[hash].js`) | `public, max-age=31536000, immutable` | 1 Year |
| **PWA Web App Manifest & Icons** | `public, max-age=86400` | 24 Hours |
| **Public Blog & SEO HTML** | `public, max-age=3600, stale-while-revalidate=86400`| 1 Hour / 1 Day SWR |
| **Authenticated App APIs** | `private, no-cache, no-store, must-revalidate` | 0 Seconds |

---

## 2. Payload Compression
- All static text/JS/JSON assets are Gzip and Brotli compressed at the Nginx edge reverse proxy layer.
