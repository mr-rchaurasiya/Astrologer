import { describe, it, expect } from 'vitest';
import { validateEnvironment, maskSecret } from '../src/config/environment';

describe('Phase 11: Environment Validation & Secret Masking Suite', () => {
  it('validates environment in test mode with safe defaults', () => {
    const result = validateEnvironment('test');
    expect(result.isValid).toBe(true);
    expect(result.errors.length).toBe(0);
  });

  it('validates environment in development mode', () => {
    const result = validateEnvironment('development');
    expect(result.isValid).toBe(true);
  });

  it('fails fast when critical secrets are missing in production mode', () => {
    const originalMongo = process.env.MONGODB_URI;
    const originalJwt = process.env.JWT_ACCESS_SECRET;

    delete process.env.MONGODB_URI;
    process.env.JWT_ACCESS_SECRET = 'development_key_unsecured';

    const result = validateEnvironment('production');
    expect(result.isValid).toBe(false);
    expect(result.errors.some((e) => e.includes('MONGODB_URI'))).toBe(true);
    expect(result.errors.some((e) => e.includes('JWT_ACCESS_SECRET'))).toBe(true);

    // Restore
    if (originalMongo) process.env.MONGODB_URI = originalMongo;
    if (originalJwt) process.env.JWT_ACCESS_SECRET = originalJwt;
  });

  it('safely masks secrets for logging and debugging without leaking characters', () => {
    expect(maskSecret('')).toBe('(not configured)');
    expect(maskSecret('short')).toBe('****');
    expect(maskSecret('sk-proj-1234567890abcdef')).toBe('sk-...cdef');
    expect(maskSecret('rzp_live_secret_key_12345678')).toBe('rzp...5678');
  });
});
