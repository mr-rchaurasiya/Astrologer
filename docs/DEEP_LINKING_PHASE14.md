# Unified Deep-Linking & Safe Redirection Engine (Phase 14)

## 1. Deep Link Architecture
Centralized in `client/src/utils/deepLinks.ts` via `DeepLinkManager`.

---

## 2. Security Against Open Redirects
- Target redirection URLs are strictly validated against `ALLOWED_DEEP_LINK_PREFIXES`.
- Rejects external protocols (`http:`, `https:`), protocol-relative schemes (`//`), and script execution schemes (`javascript:`, `data:`).
- Preserves deep-link destinations across unauthenticated sessions by storing safe targets in `sessionStorage` and restoring post-login.
