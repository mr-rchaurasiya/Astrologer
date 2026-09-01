# Authoritative Revenue Analytics & Telemetry (Phase 15)

## 1. Financial Truth Principles
1. **Server-Authoritative Truth**: Revenue metrics are computed strictly from verified `captured` payment records in the database.
2. **Zero Client Trust**: No client-side JavaScript event is trusted for financial calculations.

---

## 2. Core Metrics Formulas
- **Monthly Recurring Revenue (MRR)**:
  $$\text{MRR} = (\text{Active Pro Subscriptions} \times \text{₹499}) + (\text{Active Premium Subscriptions} \times \text{₹999})$$
- **Annual Recurring Revenue (ARR)**:
  $$\text{ARR} = \text{MRR} \times 12$$
- **Average Revenue Per User (ARPU)**:
  $$\text{ARPU} = \frac{\text{Total Captured Revenue (INR)}}{\text{Total Registered Users}}$$
