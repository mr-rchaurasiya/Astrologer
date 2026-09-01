# Kundli Secure Expiring Sharing Architecture

## 1. Overview
Enables users to generate privacy-safe, expiring public links to share their Vedic charts with family, friends, or traditional astrologers without exposing sensitive account or billing data.

## 2. Privacy & Security Rules
- **Cryptographic Tokens**: Generated using Node.js `crypto.randomBytes(24).toString('hex')` (48-character high entropy token).
- **Sanitized Astronomical Output**:
  - The public endpoint `/api/v1/astrology/share/public/:token` exposes only the native's name, birth date, planetary coordinates, and divisional charts.
  - Internal database IDs (`_id`, `userId`, `profileId`), billing details, auth tokens, AI memories, and chat logs are **strictly excluded**.
- **Expiration TTL**: Links default to 7 days, configurable from 1 to 90 days.
- **Revocation**: The chart owner can revoke a shared link at any time with immediate effect.
- **Telemetry**: Tracks anonymous view counts to show engagement to the chart owner.
