# API Response Conventions & Error Formatting

## Overview
All REST API endpoints in the Vedic Astrology SaaS platform adhere to consistent, predictable JSON response envelopes. This design guarantees clean frontend deserialization, type safety, deterministic error diagnostics, and distributed request tracing.

---

## 1. Success Response Envelope

### Standard Object Response
```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    "chart": { ... }
  }
}
```

### Paginated Collection Response
```json
{
  "success": true,
  "data": {
    "items": [ ... ],
    "total": 42,
    "page": 1,
    "limit": 20,
    "totalPages": 3
  },
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 42,
    "totalPages": 3
  }
}
```

---

## 2. Error Response Envelope

Errors return standard HTTP status codes (`400`, `401`, `403`, `404`, `409`, `429`, `500`, `503`) with a standardized error object:

```json
{
  "success": false,
  "message": "Birth profile not found",
  "error": {
    "code": "NOT_FOUND",
    "message": "Birth profile not found",
    "requestId": "e7b0e12d-94c6-48a1-9a74-29d91fbb9c24",
    "details": []
  }
}
```

### Error Codes Catalog

| Code | HTTP Status | Meaning |
| :--- | :--- | :--- |
| `VALIDATION_ERROR` | 400 | Malformed query/body or schema constraint failure. |
| `UNAUTHORIZED` | 401 | Missing, expired, or invalid JWT access token. |
| `FORBIDDEN` | 403 | Insufficient permissions (e.g. non-admin attempting admin routes). |
| `NOT_FOUND` | 404 | Target resource (profile, session, report) does not exist or user lacks ownership. |
| `CONFLICT` | 409 | Duplicate unique constraint (e.g., duplicate email registration). |
| `RATE_LIMIT_EXCEEDED` | 429 | Exceeded IP or user rate limit threshold. |
| `PAYMENT_ERROR` | 400 | Invalid payment signature, order mismatch, or capture failure. |
| `AI_SERVICE_ERROR` | 503 | External AI model timeout or transient provider failure. |
| `INTERNAL_ERROR` | 500 | Unhandled server exception (sanitized in production). |

---

## 3. Production Sanitization Guarantee
In `NODE_ENV=production`:
- Stack traces are omitted from all client responses.
- Internal database paths, connection URIs, and configuration secrets are scrubbed.
- `X-Request-ID` is included in all response headers and error payloads for server-side log correlation.
