import { describe, it, expect } from 'vitest';

export function sanitizeParam(param: string | null | undefined): string | undefined {
  if (!param) return undefined;
  const cleaned = param.trim().replace(/[^\w\s-._]/gi, '').substring(0, 100);
  return cleaned || undefined;
}

describe('Phase 15: Marketing Campaign Attribution & Sanitization Suite', () => {
  it('parses valid UTM and marketing parameters safely', () => {
    expect(sanitizeParam('google_ads')).toBe('google_ads');
    expect(sanitizeParam('diwali_2026_campaign')).toBe('diwali_2026_campaign');
    expect(sanitizeParam('cpc')).toBe('cpc');
  });

  it('strips XSS and malicious characters from attribution parameters', () => {
    expect(sanitizeParam('<script>alert(1)</script>')).toBe('scriptalert1script');
    expect(sanitizeParam('eval(document.cookie)')).toBe('evaldocument.cookie');
    expect(sanitizeParam('param; DROP TABLE users;--')).toBe('param DROP TABLE users--');
  });
});
