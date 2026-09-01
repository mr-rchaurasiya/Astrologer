# Coupon Engine & Viral Referral Foundation

## 1. Coupon Engine (`Coupon.ts`, `CouponRedemption.ts`, `coupon.service.ts`)
- **Discount Types**:
  - `percentage`: Calculates `(amount * discountValue) / 100`.
  - `fixed`: Deducts `discountValue * 100` (in paise).
- **Validation Constraints**:
  - Expiry Date (`validUntil > now`).
  - Active status (`isActive === true`).
  - Total redemption ceiling (`currentRedemptions < maxRedemptions`).
  - Per-user redemption ceiling (tracked via `CouponRedemption` records).
  - Applicable plans whitelist (e.g. only annual plans).
  - Minimum purchase amount.

## 2. Viral Referral Engine (`Referral.ts`, `referral.service.ts`)
- **Referral Code Generation**: Auto-generated format `VEDIC-XXXXXX` from user ID and random alphanumeric salt.
- **Rules & Fraud Prevention**:
  - **Self-referral check**: Users cannot claim their own referral code.
  - **Single claim**: Users can claim a referral code only once.
  - **Converted tracking**: Tracks status transitions from `registered` to `converted` upon first paid subscription.
  - **Rewards credit**: Awards consultation or subscription credits upon qualified conversions.
