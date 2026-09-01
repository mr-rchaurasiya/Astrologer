# Monetization Architecture & Pricing Plans (Phase 10)

## 1. Centralized Plan Configuration (`plans.ts`)
Plans are defined centrally in `server/src/config/plans.ts` and mirrored in `client/src/config/plans.ts`:

| Plan ID | Display Name | Price (INR) | Billing | Features | Quotas |
|---|---|---|---|---|---|
| `free` | Free Starter | ₹0 | Free | D1 chart, basic Dasha, daily panchang | 5 AI queries/mo, 1 profile |
| `pro_monthly` | Vedic Pro Monthly | ₹499 | Monthly | D1/D9/D10, Muhurta, transit timeline | 50 AI queries/mo, 5 profiles |
| `pro_annual` | Vedic Pro Annual | ₹4,999 | Annual (2 months free) | All Pro features | 50 AI queries/mo, 5 profiles |
| `premium_monthly` | Vedic Sage Monthly | ₹999 | Monthly | Vector PDF dossiers, voice AI, advanced analytics | Unlimited AI, unlimited profiles |
| `premium_annual` | Vedic Sage Annual | ₹9,999 | Annual (2 months free) | All Sage features | Unlimited AI, unlimited profiles |

## 2. Server-Authoritative Pricing
- The frontend never submits raw prices to payment processors.
- Razorpay order creation strictly retrieves amounts from the server plan configuration, applying validated coupon discounts on the server side.
