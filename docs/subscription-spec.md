# Subscription Foundation & Entitlements Specification

## 1. Overview

The subscription architecture manages user feature quotas, feature gates, and atomic daily usage tracking.

---

## 2. Plan Entitlements Matrix

| Feature | Seeker Free Plan | Cosmic Premium Plan |
| :--- | :--- | :--- |
| **AI Chat Consultations** | 5 messages / day | 100 messages / day |
| **Personalized Daily Insights** | 1 category / day | 20 categories / day |
| **Life Curve Horizon** | Up to 30 years | Full 80+ years |
| **Life Curve Resolution** | Year | Year, Quarter, Month |
| **Transit Timeline Lookahead** | 90 days | 730 days (2 years) |
| **Kundli Visualizer (D1/D9/D10)** | Unlimited | Unlimited |
| **Vimshottari Dasha Tree** | Unlimited | Unlimited |

---

## 3. Database Persistence

* **`Subscription` Collection**:
  - `userId`: ObjectId (unique index)
  - `plan`: `'free' | 'premium'`
  - `status`: `'active' | 'expired' | 'cancelled'`
  - `startedAt`: Date
  - `expiresAt`: Date (optional)
* **`UsageRecord` Collection**:
  - `userId`: ObjectId
  - `feature`: `'ai_chat' | 'daily_insight' | 'life_curve' | 'transits'`
  - `date`: `YYYY-MM-DD`
  - `count`: Number (atomic counter)
  - Unique index on `{ userId: 1, feature: 1, date: 1 }`

---

## 4. Endpoints

* `GET /api/v1/subscription/me` — Retrieves current tier, quotas, and today's usage.
* `POST /api/v1/subscription/upgrade` — Upgrades plan tier (mock / trial activation).
