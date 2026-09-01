# Admin Operations & Management Platform

## Overview
The Admin Platform provides authorized administrative users (`user.role === 'admin'`) full operational control, security visibility, user management, and aggregate business metrics.

## Role-Based Access Control
- All admin endpoints are protected by `requireAuth` and `requireRole('admin')` middleware.
- Unauthorized or non-admin attempts receive `403 Forbidden` with a generic security rejection.
- Frontend navigation automatically gates the `/admin/*` routes using `<AdminRoute>`.

## Key Capabilities

### 1. Telemetry & Analytics Overview (`/admin`)
- Total registered users and active accounts.
- Active premium subscriptions and monthly recurring revenue (MRR).
- Conversion rate from Free to Premium.
- Total AI chat consultation queries executed.
- Total PDF horoscope reports generated.
- Daily usage metrics broken down by feature.

### 2. User Account Registry (`/admin/users`)
- Search users by name or email.
- Paginated table showing role, active status, and creation date.
- Toggle user status (Activate / Deactivate account). Deactivated accounts are immediately blocked from logging in or using API endpoints.

### 3. Subscription Ledger (`/admin/subscriptions`)
- Real-time list of all user subscriptions (`free`, `premium`).
- Status indicators (`active`, `expired`, `cancelled`), start dates, and expiration timestamps.

### 4. Security Audit Trail (`/admin/audit-logs`)
- Chronological immutable log of critical events:
  - `USER_REGISTER`, `USER_LOGIN`, `PASSWORD_UPDATED`
  - `PAYMENT_ORDER_CREATED`, `PAYMENT_CAPTURED`
  - `SUBSCRIPTION_UPGRADED`, `SUBSCRIPTION_CANCELLED`
  - `REPORT_GENERATED`, `REPORT_DOWNLOADED`
  - `ADMIN_USER_STATUS_TOGGLED`
- Filterable by specific action name.
