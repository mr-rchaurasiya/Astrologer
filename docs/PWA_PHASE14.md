# Advanced PWA Specification & Offline Strategy (Phase 14)

## 1. Web App Manifest Highlights
- `display: standalone`
- `orientation: any`
- `background_color: #07090E`
- `theme_color: #C89D3C`
- App shortcuts configured for:
  - `/kundli` (View Kundli Chart)
  - `/chat` (AI Astrology Consultation)
  - `/analytics` (Life Curve Analytics)
  - `/reports` (Astrology Reports)

---

## 2. Service Worker Caching Strategies (`sw.js v14.0.0`)

| Asset Class | Caching Strategy | Description |
|---|---|---|
| **Static Assets** (`.js`, `.css`, `.svg`, `.png`, `.woff2`) | **Cache-First / Stale-While-Revalidate** | Cached in `astrologer-static-v14` for instantaneous cold launches |
| **Navigation Requests** | **Network-First with App Shell Fallback** | Tries network; falls back to cached `/index.html` shell when offline |
| **Sensitive & Private API Endpoints** | **Network-Only (NEVER Cached)** | Excludes `/api/v1/auth/`, `/api/v1/payments/`, `/api/v1/subscription/`, `/api/v1/account/`, `/api/v1/ai/chat`, `/api/v1/admin/` |
