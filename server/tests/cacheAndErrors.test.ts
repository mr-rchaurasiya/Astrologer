import { describe, it, expect, beforeEach } from 'vitest';
import { MemoryCacheProvider, getCacheProvider } from '../src/cache';
import {
  AppError,
  ValidationError,
  AuthError,
  ForbiddenError,
  NotFoundError,
  PaymentError,
  AiError,
} from '../src/middleware/errorHandler';

describe('Phase 8: Caching Layer & Error Handling Architecture', () => {
  describe('MemoryCacheProvider', () => {
    let cache: MemoryCacheProvider;

    beforeEach(() => {
      cache = new MemoryCacheProvider(2); // 2 second TTL
    });

    it('stores and retrieves values accurately', async () => {
      await cache.set('panchang:2026-09-01:delhi', { tithi: 'Shukla Navami' });
      const val = await cache.get<{ tithi: string }>('panchang:2026-09-01:delhi');
      expect(val).toEqual({ tithi: 'Shukla Navami' });
    });

    it('returns null on cache miss', async () => {
      const val = await cache.get('nonexistent_key');
      expect(val).toBeNull();
    });

    it('deletes values by exact key and pattern', async () => {
      await cache.set('transit:mars', { sign: 'Cancer' });
      await cache.set('transit:jupiter', { sign: 'Taurus' });
      await cache.set('plan:free', { price: 0 });

      const deletedCount = await cache.deletePattern('transit:*');
      expect(deletedCount).toBe(2);

      expect(await cache.get('transit:mars')).toBeNull();
      expect(await cache.get('plan:free')).toBeDefined();
    });

    it('tracks hits and misses accurately in stats', async () => {
      await cache.set('k1', 'v1');
      await cache.get('k1'); // hit
      await cache.get('k1'); // hit
      await cache.get('k2'); // miss

      const stats = cache.getStats();
      expect(stats.hits).toBe(2);
      expect(stats.misses).toBe(1);
    });
  });

  describe('Typed Application Errors', () => {
    it('instantiates ValidationError with 400 status', () => {
      const err = new ValidationError('Invalid latitude', [{ field: 'latitude' }]);
      expect(err.statusCode).toBe(400);
      expect(err.errorCode).toBe('VALIDATION_ERROR');
      expect(err.isOperational).toBe(true);
      expect(err.details).toBeDefined();
    });

    it('instantiates AuthError with 401 status', () => {
      const err = new AuthError('Token expired');
      expect(err.statusCode).toBe(401);
      expect(err.errorCode).toBe('UNAUTHORIZED');
    });

    it('instantiates ForbiddenError with 403 status', () => {
      const err = new ForbiddenError('Admin only');
      expect(err.statusCode).toBe(403);
      expect(err.errorCode).toBe('FORBIDDEN');
    });

    it('instantiates NotFoundError with 404 status', () => {
      const err = new NotFoundError('Chart not found');
      expect(err.statusCode).toBe(404);
      expect(err.errorCode).toBe('NOT_FOUND');
    });

    it('instantiates PaymentError and AiError with correct codes', () => {
      const payErr = new PaymentError('Signature mismatch');
      expect(payErr.statusCode).toBe(400);
      expect(payErr.errorCode).toBe('PAYMENT_ERROR');

      const aiErr = new AiError('OpenAI timeout');
      expect(aiErr.statusCode).toBe(503);
      expect(aiErr.errorCode).toBe('AI_SERVICE_ERROR');
    });
  });
});
