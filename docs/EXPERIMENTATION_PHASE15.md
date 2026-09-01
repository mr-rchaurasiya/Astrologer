# Privacy-Safe A/B Testing & Experimentation (Phase 15)

## 1. Experimentation Principles
- **Deterministic Assignment**: Deterministic hash of `(userId || sessionId) + experimentId` ensures consistent user experience across sessions without tracking cookies.
- **Safety Boundaries**: Experiments are restricted to copy (CTA wording), UI presentation, and pricing layout. Experiments are strictly prohibited on core astrological calculations, birth charts, or security rules.
- **Privacy First**: Exposure events log only `experimentId`, `variant`, and timestamp.
