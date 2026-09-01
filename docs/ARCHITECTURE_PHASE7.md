# Phase 7 — Production Platform Architecture

## Executive Overview
Phase 7 extends the Vedic Jyotish intelligence platform into a production-grade SaaS ecosystem. It integrates:
1. **Server-Authoritative Subscriptions & Payments**: Real order creation, signature verification, idempotent webhook processing, and tier entitlement synchronization.
2. **Deterministic PDF Horoscope Reports Engine**: Print-ready multi-page dossiers rendered server-side with vector diagrams (D1, D9), 120-year Vimshottari dasha tables, sacred panchang, and real-time transits.
3. **In-App & Multi-Channel Notifications**: Real-time astrological transit ingress alerts, daily guidance digests, and notification preference controls.
4. **Voice AI Consultation Foundation**: OpenAI Whisper speech-to-text input with audio duration/format validation and TTS neural voice synthesis.
5. **Admin Operations & Platform Telemetry**: Role-based access control (`admin`), aggregate operational metrics, user status controls, and security audit ledger.
6. **Production Hardening**: Distributed request tracing (`X-Request-ID`), readiness health probes (`GET /api/v1/health/ready`), zero client secrets, and strict user isolation.

```
                                  [ Web Client / Browser ]
                                              │
                         ┌────────────────────┼───────────────────┐
                         │                    │                   │
                 Razorpay Checkout       Voice STT/TTS       PDF Downloads
                         │                    │                   │
                         ▼                    ▼                   ▼
                 ┌────────────────────────────────────────────────────────┐
                 │                   Express Gateway                      │
                 │   - Request ID Tracing   - Rate Limiting   - JWT Auth  │
                 └────────────────────────────┬───────────────────────────┘
                                              │
      ┌──────────────┬────────────────────────┼────────────────────────┬─────────────┐
      ▼              ▼                        ▼                        ▼             ▼
[PaymentService] [ReportService]   [NotificationService]   [VoiceService] [AdminService]
      │              │                        │                        │             │
      │       [KundliPdfGenerator]            │                 [Whisper/TTS]        │
      ▼              ▼                        ▼                        ▼             ▼
  (Razorpay)   (Local/S3 Storage)      (SMTP / In-App)            (OpenAI API)  (Audit Logs)
      │              │                        │                        │             │
      └──────────────┴────────────────────────┴────────────────────────┴─────────────┘
                                              │
                                              ▼
                                    [ MongoDB Database ]
```

## Core Infrastructure Components

### 1. Payment Layer
- Abstract `IPaymentProvider` with `RazorpayProvider` implementation.
- HMAC-SHA256 signature verification for client payment verification and webhook callbacks.
- Database ledger tracking all payment orders, statuses (`created`, `captured`, `failed`, `refunded`), and raw webhook payloads.

### 2. PDF Report Compilation
- High-fidelity vector PDF generation powered by `pdfkit`.
- Multi-page layout:
  - Page 1: Native metadata, Lagna, Rashi, and philosophical disclaimers.
  - Page 2: Sidereal planetary longitudes, dignities, retrograde states, and 12 Bhava spans.
  - Page 3: North Indian diamond vector charts for D1 Rashi and D9 Navamsha.
  - Page 4: 120-year Vimshottari Mahadasha timeline, sacred Panchang, and Abhijit Muhurta.
  - Page 5: Current planetary Gochar transits with house-from-lagna mappings and karmic synthesis.

### 3. Voice AI Foundation
- Audio transcription supporting `audio/webm`, `audio/mp3`, `audio/wav`, `audio/ogg`, and `audio/m4a` with <10MB payload validation.
- OpenAI Whisper STT (`whisper-1`) and neural TTS synthesis (`tts-1`).
- Fallback offline mocks for non-API runtime environments.

### 4. Admin Management Platform
- Guarded by `requireRole('admin')` middleware.
- Platform analytics: total users, active accounts, MRR, premium conversion rate, total AI consultations, generated PDF reports.
- User management: account search, status toggle (active/deactivated).
- Audit trail: filterable security actions, IP records, and timestamps.
