import { describe, it, expect } from 'vitest';
import { getCacheProvider } from '../../src/cache';
import '../setup';

describe('Phase 16: Distributed Cache & Stampede Protection Suite', () => {
  it('getOrSet coalesces concurrent misses and executes expensive fetch function exactly once', async () => {
    const cache = getCacheProvider();
    const key = `expensive_data_${Date.now()}`;
    let fetchCount = 0;

    const expensiveOperation = async () => {
      fetchCount++;
      await new Promise((resolve) => setTimeout(resolve, 50));
      return { answer: 42, calculatedAt: Date.now() };
    };

    // Trigger 5 concurrent calls simultaneously
    const results = await Promise.all([
      cache.getOrSet(key, expensiveOperation, 60),
      cache.getOrSet(key, expensiveOperation, 60),
      cache.getOrSet(key, expensiveOperation, 60),
      cache.getOrSet(key, expensiveOperation, 60),
      cache.getOrSet(key, expensiveOperation, 60),
    ]);

    expect(fetchCount).toBe(1);
    expect(results[0].answer).toBe(42);
    expect(results[4].answer).toBe(42);
  });
});
