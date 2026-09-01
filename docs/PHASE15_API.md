# Phase 15 Growth, SEO & Content API Reference

## 1. Articles & Blog API

### `GET /api/v1/articles`
- **Auth**: Public
- **Query**: `?category=&tag=&search=&page=1&limit=10`
- **Response**: `{ success: true, data: { articles: [...], pagination: {...} } }`

### `GET /api/v1/articles/:slug`
- **Auth**: Public
- **Response**: `{ success: true, data: { article: {...} } }`

### `POST /api/v1/articles/admin/create`
- **Auth**: Bearer Token (Admin role required)
- **Body**: `{ title, slug?, excerpt, content, category, tags?, status, seoTitle?, seoDescription? }`
- **Response**: `{ success: true, message: "Article created successfully", data: { article: {...} } }`

---

## 2. Affiliate API

### `POST /api/v1/affiliates/register`
- **Auth**: Bearer Token
- **Body**: `{ partnerName, email, customCode? }`
- **Response**: `{ success: true, data: { affiliate: {...} } }`

### `POST /api/v1/affiliates/track-click/:code`
- **Auth**: Public
- **Response**: `{ success: true, data: { tracked: boolean } }`

---

## 3. SEO & Sitemap API

### `GET /api/v1/seo/sitemap.xml`
- **Auth**: Public
- **Response**: Content-Type `application/xml`

### `GET /api/v1/seo/robots.txt`
- **Auth**: Public
- **Response**: Content-Type `text/plain`

---

## 4. Admin Growth Telemetry

### `GET /api/v1/admin/analytics/growth`
- **Auth**: Bearer Token (Admin role required)
- **Response**: `{ success: true, data: { overview: {...}, funnel: {...}, retention: {...}, growthChannels: {...} } }`
