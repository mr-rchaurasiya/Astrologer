import { describe, it, expect } from 'vitest';
import { sanitizeParam } from './phase15Attribution.test';

export function sanitizeAnalytics(props: Record<string, any> = {}): Record<string, any> {
  const forbidden = ['password', 'token', 'jwt', 'secret', 'creditcard'];
  const sanitized: Record<string, any> = {};
  for (const [key, value] of Object.entries(props)) {
    if (forbidden.some((f) => key.toLowerCase().includes(f))) continue;
    sanitized[key] = value;
  }
  return sanitized;
}

describe('Phase 15: Growth & SEO Security Audit Suite', () => {
  it('strips all sensitive credentials from analytics payloads', () => {
    const raw = {
      plan: 'premium',
      password: 'PlainSecretPassword!',
      jwt: 'eyJhbGciOiJIUzI1NiIsIn...',
      source: 'web_pricing',
    };

    const clean = sanitizeAnalytics(raw);
    expect(clean.plan).toBe('premium');
    expect(clean.source).toBe('web_pricing');
    expect(clean.password).toBeUndefined();
    expect(clean.jwt).toBeUndefined();
  });

  it('rejects XSS and unsafe script injection in URL parameters', () => {
    const malicious = '"><script>document.location="http://evil.com"</script>';
    const cleaned = sanitizeParam(malicious);
    expect(cleaned).not.toContain('<script>');
    expect(cleaned).not.toContain('"');
  });
});
