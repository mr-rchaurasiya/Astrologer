/**
 * Centralized Deep Link & Safe Redirection Utility (Phase 14)
 */

export const ALLOWED_DEEP_LINK_PREFIXES = [
  '/dashboard',
  '/kundli',
  '/chat',
  '/analytics',
  '/reports',
  '/saved-consultations',
  '/subscription',
  '/referrals',
  '/settings',
  '/shared/kundli/',
  '/admin',
];

const PENDING_REDIRECT_KEY = 'astrologer_pending_redirect';

export class DeepLinkManager {
  /**
   * Validates whether a target path is an internal, safe redirect destination.
   * Prevents Open Redirect attacks (e.g. //attacker.com or javascript: URIs).
   */
  public static isSafeRedirectPath(path: string | null | undefined): boolean {
    if (!path || typeof path !== 'string') return false;

    const trimmed = path.trim();

    // Disallow external URLs, protocol-relative URLs, and script schemes
    if (
      trimmed.startsWith('//') ||
      trimmed.startsWith('http://') ||
      trimmed.startsWith('https://') ||
      trimmed.startsWith('javascript:') ||
      trimmed.startsWith('data:')
    ) {
      return false;
    }

    // Must start with '/' and match allowed internal paths
    if (!trimmed.startsWith('/')) return false;

    return ALLOWED_DEEP_LINK_PREFIXES.some((prefix) => trimmed.startsWith(prefix));
  }

  /**
   * Saves a pending redirect URL in sessionStorage for post-login redirection.
   */
  public static savePendingRedirect(path: string): void {
    if (this.isSafeRedirectPath(path)) {
      try {
        sessionStorage.setItem(PENDING_REDIRECT_KEY, path);
      } catch {
        // Fallback if sessionStorage is disabled
      }
    }
  }

  /**
   * Retrieves and clears the pending redirect destination.
   */
  public static consumePendingRedirect(defaultFallback: string = '/dashboard'): string {
    try {
      const stored = sessionStorage.getItem(PENDING_REDIRECT_KEY);
      if (stored && this.isSafeRedirectPath(stored)) {
        sessionStorage.removeItem(PENDING_REDIRECT_KEY);
        return stored;
      }
    } catch {
      // Ignore storage errors
    }
    return defaultFallback;
  }

  /**
   * Constructs a shareable deep link URL for a shared Kundli token.
   */
  public static createSharedKundliUrl(token: string, origin: string = window.location.origin): string {
    return `${origin}/shared/kundli/${encodeURIComponent(token)}`;
  }
}
