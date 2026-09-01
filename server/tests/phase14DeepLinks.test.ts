import { describe, it, expect } from 'vitest';

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

function isSafeRedirectPath(path: string | null | undefined): boolean {
  if (!path || typeof path !== 'string') return false;
  const trimmed = path.trim();
  if (
    trimmed.startsWith('//') ||
    trimmed.startsWith('http://') ||
    trimmed.startsWith('https://') ||
    trimmed.startsWith('javascript:') ||
    trimmed.startsWith('data:')
  ) {
    return false;
  }
  if (!trimmed.startsWith('/')) return false;
  return ALLOWED_DEEP_LINK_PREFIXES.some((prefix) => trimmed.startsWith(prefix));
}

describe('Phase 14: Deep Link Validation & Open-Redirect Security Suite', () => {
  it('permits valid internal application deep links', () => {
    expect(isSafeRedirectPath('/dashboard')).toBe(true);
    expect(isSafeRedirectPath('/kundli')).toBe(true);
    expect(isSafeRedirectPath('/chat')).toBe(true);
    expect(isSafeRedirectPath('/reports/rep_12345')).toBe(true);
    expect(isSafeRedirectPath('/shared/kundli/sample_token_abc')).toBe(true);
    expect(isSafeRedirectPath('/subscription?plan=premium')).toBe(true);
  });

  it('rejects external URL open-redirect attack payloads', () => {
    expect(isSafeRedirectPath('https://malicious-site.com')).toBe(false);
    expect(isSafeRedirectPath('http://phishing.com/login')).toBe(false);
    expect(isSafeRedirectPath('//attacker.com/dashboard')).toBe(false);
    expect(isSafeRedirectPath('javascript:alert(document.cookie)')).toBe(false);
    expect(isSafeRedirectPath('data:text/html,<script>alert(1)</script>')).toBe(false);
  });

  it('rejects non-whitelisted internal paths', () => {
    expect(isSafeRedirectPath('/internal_debug_endpoint')).toBe(false);
    expect(isSafeRedirectPath('/unknown_random_page')).toBe(false);
    expect(isSafeRedirectPath('')).toBe(false);
    expect(isSafeRedirectPath(null)).toBe(false);
  });
});
