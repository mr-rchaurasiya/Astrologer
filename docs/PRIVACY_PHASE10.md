# User Privacy & Data Governance (Phase 10)

## 1. Tenant Data Isolation
All user records enforce strict ownership verification using `userId === req.user.id`:
- Birth Profiles
- AI Chat Sessions & Messages
- AI Memories & Preferences
- Saved Consultations
- Generated PDF Reports
- Shared Kundli Links
- Notifications

## 2. GDPR/CCPA Compliance Capabilities
- **Full Data Export (`GET /api/v1/account/export`)**: Produces a complete, machine-readable JSON archive containing all user profile data, birth charts, chat history, saved consultations, and billing transactions.
- **Account Deletion Cascade (`DELETE /api/v1/account`)**: Permanently cascades deletion across all MongoDB collections, revoking all shared links and purging all cached data.
- **Expiring Public Links**: Shared charts automatically expire and can be revoked instantly by the user.
