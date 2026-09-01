# Progressive Web Application (PWA) Architecture & Offline Caching (Phase 10)

## 1. Overview
The platform includes full PWA support conforming to W3C standards with service worker caching, offline resilience, and mobile installation prompts.

## 2. Web App Manifest (`client/public/manifest.json`)
- **Name**: Vedic Astrologer AI - Precision Vedic Kundli & Horoscope
- **Short Name**: Astrologer AI
- **Display Mode**: `standalone`
- **Theme Color**: `#07090E`
- **Background Color**: `#07090E`
- **Icons**: 192x192, 512x512, and 512x512 maskable PNG icons.
- **Shortcuts**:
  - `/kundli`: Kundli & Birth Charts
  - `/chat`: AI Vedic Consultation
  - `/reports`: Vedic PDF Dossiers

## 3. Service Worker Lifecycle (`client/public/sw.js`)
- **Static Asset Cache**: Cache-first for CSS, JS chunks, and SVG icons.
- **Security Partitioning**: Never caches auth tokens, payments, user settings, or chat streaming endpoints.
- **Update Handling**: Broadcasts state changes to trigger `PWAUpdatePrompt`.

## 4. UI Indicators
- `OfflineBanner.tsx`: Top bar indicating offline status.
- `InstallAppPrompt.tsx`: Non-blocking prompt to add to homescreen.
- `PWAUpdatePrompt.tsx`: One-click update banner on service worker update.
