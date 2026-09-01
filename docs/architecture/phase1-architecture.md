# Phase 1 Architecture Document

## 1. Overview
**Astrologer** is an AI-powered Vedic astrology platform designed with an architectural split between high-precision deterministic mathematical calculations and contextual AI reasoning.

Phase 1 establishes the foundational monorepo structure, Node.js/Express TypeScript backend with production security middleware and standardized API responses, and React + Vite + TypeScript frontend with a luxury dark-mode design system, responsive navigation, and placeholder routing.

---

## 2. Monorepo Project Structure

```text
Astrologer/
│
├── client/                     # Frontend Application (React + Vite + TypeScript)
│   ├── public/                 # Static public assets
│   ├── src/
│   │   ├── assets/             # Asset constants and metadata
│   │   ├── components/         # Reusable atomic UI components (Badge, Button, Card)
│   │   ├── context/            # Global context state (Auth placeholder for Phase 2)
│   │   ├── hooks/              # Custom hooks (useHealth telemetry hook)
│   │   ├── layouts/            # Layout wrappers (MainLayout with responsive Navbar/Footer)
│   │   ├── pages/              # Routed pages (Home, Login, Register, Dashboard, Kundli, Chat, Profile)
│   │   ├── services/           # HTTP API client layer
│   │   ├── styles/             # Style imports and token bridges
│   │   ├── types/              # Client TypeScript type definitions
│   │   ├── utils/              # Client formatting helpers
│   │   ├── App.tsx             # Route declarations
│   │   ├── index.css           # Global design system & CSS custom properties
│   │   └── main.tsx            # React DOM mounting with BrowserRouter
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts          # Reverse proxy configuration (/api -> http://localhost:5000)
│   └── .env.example
│
├── server/                     # Backend API (Node.js + Express + TypeScript)
│   ├── src/
│   │   ├── config/             # Typed environment variable loader & configuration
│   │   ├── controllers/        # Request handling and HTTP response dispatch
│   │   ├── middleware/         # Helmet, CORS, Rate Limiters, Error Handling
│   │   ├── routes/             # Express API route declarations
│   │   ├── services/           # Service layer interface abstractions
│   │   ├── repositories/       # Database repository interface abstractions
│   │   ├── types/              # Server TypeScript type definitions & API contracts
│   │   ├── utils/              # Response creation and validation helpers
│   │   ├── app.ts              # Express application factory & middleware pipeline
│   │   └── server.ts           # HTTP server bootstrap & graceful shutdown handler
│   ├── tests/                  # Backend Vitest unit & integration test suites
│   ├── package.json
│   ├── tsconfig.json
│   └── .env.example
│
├── docs/
│   └── architecture/           # Architectural specifications
│       └── phase1-architecture.md
│
├── .gitignore
├── README.md
└── package.json                # Root orchestration scripts (dev, build, test)
```

---

## 3. API Architecture & Standards

### Standard Success Response:
```json
{
  "success": true,
  "message": "Astrologer API is healthy",
  "data": {
    "status": "ok",
    "timestamp": "2026-09-01T07:30:00.000Z",
    "uptime": 120
  }
}
```

### Standard Error Response:
```json
{
  "success": false,
  "message": "Cannot find endpoint GET /api/v1/unknown-route on this server",
  "error": {
    "code": "NOT_FOUND"
  }
}
```

### Active Endpoints:
* `GET /api/v1/health` — Verifies API health, uptime, and timestamp.
* `GET /api/v1` — Returns API version and descriptor.

---

## 4. Security Middleware Foundation

* **Helmet**: Secures HTTP response headers against clickjacking, MIME sniffing, and cross-site scripting.
* **CORS**: Configured with explicit origin whitelists (`http://localhost:5173`).
* **Rate Limiting**:
  * Global API Limiter: 100 requests per 15 minutes.
  * Auth Route Limiter: 10 requests per 15 minutes (prepared for Phase 2).
* **Body Size Limiting**: JSON and URL-encoded parsers capped at 5MB.
* **Centralized Error Handler**: Captures all synchronous and asynchronous errors; suppresses stack traces in production mode.

---

## 5. Environment Configuration

### Backend (`server/.env.example`):
* `NODE_ENV` — `development` | `production` | `test`
* `PORT` — Server listening port (default: `5000`)
* `CLIENT_URL` — Frontend origin for CORS
* `MONGODB_URI` — Database connection string (prepared for Phase 2)
* `JWT_ACCESS_SECRET` / `JWT_REFRESH_SECRET` — Token signing secrets (prepared for Phase 2)

### Frontend (`client/.env.example`):
* `VITE_API_URL` — Base API endpoint (default: `http://localhost:5000/api/v1`)

---

## 6. Frontend Routing & Design System

### Route Map:
* `/` — Home (Hero, features, live engine health monitor)
* `/login` — Login UI placeholder
* `/register` — Account registration UI placeholder
* `/dashboard` — Telemetry & feature card overview placeholder
* `/kundli` — Kundli engine roadmap & chart visualizer placeholder
* `/chat` — AI Astrologer consultation interface placeholder
* `/profile` — User birth parameters management placeholder

### Design Tokens:
* **Theme**: Deep Cosmic (`#07090E`, `#0C101A`, `#121826`) with Celestial Gold accents (`#F5D061`, `#D4AF37`).
* **Typography**: Cinzel (Serif headings), Outfit (Sans subheadings), Plus Jakarta Sans (Body UI).
* **Glassmorphism**: Backdrop blur with subtle translucent borders.

---

## 7. Future Extension Points

* **Phase 2**: MongoDB & Mongoose schemas (`User`, `BirthProfile`), JWT authentication, protected routes.
* **Phase 3**: Deterministic Vedic calculation engine (Ephemeris, Lahiri Ayanamsa, D1/D9/D10, 120-year Vimshottari Dasha, Panchang, Muhurta).
* **Phase 4**: Interactive SVG North/South Indian Kundli chart visualizers, geocoding API integration.
* **Phase 5**: AI provider abstraction layer, structured chart context serialization, natural language chat.
* **Phase 6**: Subscriptions, usage credits, life curve timeline, admin analytics.
