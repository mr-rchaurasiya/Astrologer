import { describe, it, expect } from 'vitest';
import { CircuitBreaker } from '../../src/utils/circuitBreaker';

describe('Phase 16: Circuit Breaker & Dependency Resilience Suite', () => {
  it('trips from CLOSED to OPEN after failure threshold and returns fallback result', async () => {
    const cb = new CircuitBreaker('test_ai_provider', {
      failureThreshold: 3,
      resetTimeoutMs: 1000,
      timeoutMs: 500,
    });

    const failingService = async () => {
      throw new Error('500 Internal Provider Error');
    };

    const fallbackService = async () => {
      return { response: 'fallback_cached_astrology' };
    };

    // Attempt 1, 2, 3 fail
    await cb.execute(failingService, fallbackService);
    await cb.execute(failingService, fallbackService);
    await cb.execute(failingService, fallbackService);

    expect(cb.getState()).toBe('OPEN');

    // Subsequent call immediately returns fallback without invoking failing service
    const result = await cb.execute(failingService, fallbackService);
    expect(result.response).toBe('fallback_cached_astrology');
  });
});
