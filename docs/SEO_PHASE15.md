# SEO Strategy, Metadata & Indexing Guidelines (Phase 15)

## 1. Metadata Architecture (`<SEOHead />`)
- Standardized page title structure: `{Page Title} — Astrologer`.
- Curated descriptions (under 160 characters) containing natural primary keywords.
- Canonical URL generation prevents duplicate indexation across query parameters or trailing slashes.
- Robots directives enforce `noindex, nofollow` on private authenticated routes (`/dashboard`, `/kundli`, `/chat`, `/analytics`, `/reports`, `/settings`, `/profile`, `/admin`).

---

## 2. Public Route Indexing Matrix

| Route | Purpose | Indexing Status | Structured Data |
|---|---|---|---|
| `/` | Homepage | `index, follow` | `WebSite`, `Organization` |
| `/kundli-online` | Online Kundli Calculator | `index, follow` | `WebApplication` |
| `/vedic-astrology` | Vedic Astrology Guide | `index, follow` | `Article` |
| `/ai-astrologer` | AI Astrologer Consultation | `index, follow` | `WebApplication` |
| `/astrology-reports`| PDF Horoscope Dossiers | `index, follow` | `WebApplication` |
| `/blog` | Knowledge Base Index | `index, follow` | `BreadcrumbList` |
| `/blog/:slug` | Published Articles | `index, follow` | `Article`, `BreadcrumbList` |
| `/shared/kundli/:token` | Sanitized Shared Chart | `index, follow` | `WebPage` |
| `/dashboard` | Authenticated Dashboard | `noindex, nofollow` | None |
| `/admin/*` | Admin Platform | `noindex, nofollow` | None |
