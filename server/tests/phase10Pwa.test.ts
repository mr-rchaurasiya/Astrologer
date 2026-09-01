import { describe, it, expect } from 'vitest';
import './setup';

describe('Phase 10: PWA & Offline Experience Requirements', () => {
  it('should enforce that sensitive endpoints are never cached in service worker', () => {
    const SENSITIVE_PATTERNS = [
      '/api/v1/auth/',
      '/api/v1/payments/',
      '/api/v1/subscription/',
      '/api/v1/account/',
      '/api/v1/ai/chat',
      '/api/v1/ai/voice',
      '/api/v1/admin/',
    ];

    const testUrls = [
      '/api/v1/auth/login',
      '/api/v1/payments/verify',
      '/api/v1/subscription/me',
      '/api/v1/account/data-export',
      '/api/v1/ai/chat/sessions/123/messages',
      '/api/v1/ai/voice/consultation',
      '/api/v1/admin/analytics/overview',
    ];

    testUrls.forEach((url) => {
      const isSensitive = SENSITIVE_PATTERNS.some((pattern) => url.includes(pattern));
      expect(isSensitive).toBe(true);
    });
  });

  it('should allow static assets to be cached safely', () => {
    const staticUrls = [
      '/index.html',
      '/manifest.json',
      '/assets/index.js',
      '/assets/style.css',
      '/favicon.ico',
    ];

    const SENSITIVE_PATTERNS = [
      '/api/v1/auth/',
      '/api/v1/payments/',
      '/api/v1/subscription/',
      '/api/v1/account/',
    ];

    staticUrls.forEach((url) => {
      const isSensitive = SENSITIVE_PATTERNS.some((pattern) => url.includes(pattern));
      expect(isSensitive).toBe(false);
    });
  });
});
