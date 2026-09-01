# Blog & Content Architecture (Phase 15)

## 1. Data Model (`Article.ts`)
- **Fields**: `title`, `slug` (unique), `excerpt`, `content`, `author`, `category`, `tags`, `seoTitle`, `seoDescription`, `canonicalUrl`, `status` (`draft` / `published`), `publishedAt`, `readTimeMinutes`, `viewCount`.
- **Categories**: `kundli`, `vedic-astrology`, `dashas`, `yogas`, `transits`, `compatibility`, `ai-astrology`.

---

## 2. Editorial Workflow
- **Public Endpoints**: Only articles marked with `status: 'published'` are accessible to search crawlers and public visitors (`GET /api/v1/articles`, `GET /api/v1/articles/:slug`).
- **Admin Management**: Full CRUD lifecycle (`POST /api/v1/articles/admin/create`, `PUT /api/v1/articles/admin/:id`, `DELETE /api/v1/articles/admin/:id`) protected by `requireAdmin` middleware.
