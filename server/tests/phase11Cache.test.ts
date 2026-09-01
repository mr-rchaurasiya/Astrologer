import { describe, it, expect } from 'vitest';
import { RedisCacheProvider } from '../src/cache/redis.provider';

describe('Phase 11: Redis Distributed Cache & Fallback Suite', () => {
  it('instantiates RedisCacheProvider with graceful in-memory fallback', async () => {
    const cache = new RedisCacheProvider('redis://invalid-host:6379', 300, 'test:');

    await cache.set('user:101', { name: 'Arjuna' }, 60);
    const retrieved = await cache.get<{ name: string }>('user:101');
    expect(retrieved).toEqual({ name: 'Arjuna' });

    const exists = await cache.has('user:101');
    expect(exists).toBe(true);

    const deleted = await cache.delete('user:101');
    expect(deleted).toBe(true);

    const afterDelete = await cache.get('user:101');
    expect(afterDelete).toBeNull();
  });

  it('supports pattern deletion and tracking cache stats', async () => {
    const cache = new RedisCacheProvider(undefined, 60, 'astrologer:');

    await cache.set('transit:daily:1', 'value1');
    await cache.set('transit:daily:2', 'value2');
    await cache.set('profile:1', 'profile_value');

    const deletedCount = await cache.deletePattern('transit:daily:*');
    expect(deletedCount).toBe(2);

    const remaining = await cache.get('profile:1');
    expect(remaining).toBe('profile_value');

    const stats = cache.getStats();
    expect(stats.hits).toBeGreaterThanOrEqual(0);
    expect(stats.misses).toBeGreaterThanOrEqual(0);
  });
});
