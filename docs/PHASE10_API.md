# Phase 10 API Reference

This document provides the complete API specification for all endpoints introduced in Phase 10.

---

## 1. Kundli Expiring Share API

### 1.1 Create Expiring Share Link
- **Method**: `POST`
- **Path**: `/api/v1/astrology/share/create`
- **Auth**: Required (Bearer token)
- **Request Body**:
  ```json
  {
    "profileId": "65fc123456789abcdef01234",
    "title": "Arjuna Dev's Vedic Horoscope",
    "expiresInDays": 7,
    "allowedSections": ["lagna", "planets", "dasha", "panchang"]
  }
  ```
- **Response `201 Created`**:
  ```json
  {
    "success": true,
    "message": "Share link generated successfully",
    "data": {
      "token": "4f9a8b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e",
      "shareUrl": "/shared/kundli/4f9a8b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e",
      "expiresAt": "2026-03-08T12:00:00.000Z",
      "title": "Arjuna Dev's Vedic Horoscope",
      "allowedSections": ["lagna", "planets", "dasha", "panchang"]
    }
  }
  ```

### 1.2 Access Public Shared Kundli
- **Method**: `GET`
- **Path**: `/api/v1/astrology/share/public/:token`
- **Auth**: None (Public)
- **Response `200 OK`**:
  ```json
  {
    "success": true,
    "data": {
      "title": "Arjuna Dev's Vedic Horoscope",
      "nativeName": "Arjuna Dev",
      "birthDate": "1990-05-15",
      "ascendantSign": "Cancer",
      "ascendantDegree": 14.52,
      "planets": [...],
      "d1Chart": {...},
      "d9Chart": {...},
      "d10Chart": {...},
      "currentDasha": {...},
      "panchang": {...},
      "expiresAt": "2026-03-08T12:00:00.000Z",
      "viewCount": 4
    }
  }
  ```

### 1.3 List My Shared Links
- **Method**: `GET`
- **Path**: `/api/v1/astrology/share/my-links`
- **Auth**: Required

### 1.4 Revoke Shared Link
- **Method**: `DELETE`
- **Path**: `/api/v1/astrology/share/:id`
- **Auth**: Required

---

## 2. Saved Consultations API

### 2.1 List Saved Consultations
- **Method**: `GET`
- **Path**: `/api/v1/ai/saved`
- **Auth**: Required
- **Query Parameters**:
  - `tag` (optional): Filter by tag (e.g. `career`)
  - `favorite` (optional): `true`
  - `archived` (optional): `true`
  - `search` (optional): Search query

### 2.2 Save Consultation Reading
- **Method**: `POST`
- **Path**: `/api/v1/ai/saved`
- **Auth**: Required
- **Request Body**:
  ```json
  {
    "sessionId": "65fc987654321fedcba98765",
    "title": "Saturn Sade Sati Analysis",
    "tags": ["saturn", "remedy", "career"],
    "notes": "Light sesame oil lamp on Saturdays",
    "isFavorite": true
  }
  ```

### 2.3 Update Saved Consultation
- **Method**: `PUT`
- **Path**: `/api/v1/ai/saved/:id`
- **Auth**: Required

### 2.4 Delete Saved Consultation
- **Method**: `DELETE`
- **Path**: `/api/v1/ai/saved/:id`
- **Auth**: Required

---

## 3. AI Personalization & Feedback API

### 3.1 Get Settings
- **Method**: `GET`
- **Path**: `/api/v1/ai/personalization`
- **Auth**: Required

### 3.2 Update Settings
- **Method**: `PUT`
- **Path**: `/api/v1/ai/personalization`
- **Auth**: Required
- **Request Body**:
  ```json
  {
    "languagePreference": "Hindi",
    "astrologyTerminology": "sanskrit",
    "responseStyle": "detailed"
  }
  ```

### 3.3 Submit Feedback
- **Method**: `POST`
- **Path**: `/api/v1/ai/personalization/feedback`
- **Auth**: Required
- **Request Body**:
  ```json
  {
    "messageId": "msg_abc123",
    "sessionId": "session_xyz456",
    "rating": "helpful",
    "category": "accuracy",
    "comment": "Precise Mahadasha transit timeline"
  }
  ```

---

## 4. Coupons & Referrals API

### 4.1 Validate Coupon
- **Method**: `POST`
- **Path**: `/api/v1/coupons/validate`
- **Auth**: Required
- **Request Body**:
  ```json
  {
    "code": "VEDIC25",
    "planId": "premium_annual"
  }
  ```

### 4.2 Create Admin Coupon
- **Method**: `POST`
- **Path**: `/api/v1/coupons/admin/create`
- **Auth**: Admin Required

### 4.3 Get Referral Stats
- **Method**: `GET`
- **Path**: `/api/v1/referrals/me`
- **Auth**: Required

### 4.4 Claim Referral Code
- **Method**: `POST`
- **Path**: `/api/v1/referrals/claim`
- **Auth**: Required
- **Request Body**:
  ```json
  {
    "code": "VEDIC-ARJUNA"
  }
  ```

---

## 5. Admin Revenue & Telemetry API

### 5.1 Revenue Breakdown
- **Method**: `GET`
- **Path**: `/api/v1/admin/analytics/revenue`
- **Auth**: Admin Required

### 5.2 AI Feedback Telemetry
- **Method**: `GET`
- **Path**: `/api/v1/admin/analytics/ai-feedback`
- **Auth**: Admin Required
