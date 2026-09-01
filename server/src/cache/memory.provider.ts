import { ICacheProvider } from './cache.types';
import { CacheMetricsTracker } from './cacheMetrics';

interface CacheEntry<T> {
  value: T;
  expiresAt: number | null; // null means no expiration
}

export class MemoryCacheProvider implements ICacheProvider {
  private store: Map<string, CacheEntry<any>> = new Map();
  private inflightRequests: Map<string, Promise<any>> = new Map();
  private hits: number = 0;
  private misses: number = 0;

  constructor(private defaultTtlSeconds: number = 300) {}

  public async get<T>(key: string): Promise<T | null> {
    const entry = this.store.get(key);
    if (!entry) {
      this.misses++;
      CacheMetricsTracker.recordMiss();
      return null;
    }

    if (entry.expiresAt && Date.now() > entry.expiresAt) {
      this.store.delete(key);
      this.misses++;
      CacheMetricsTracker.recordExpiration();
      CacheMetricsTracker.recordMiss();
      return null;
    }

    this.hits++;
    CacheMetricsTracker.recordHit();
    return entry.value as T;
  }

  public async set<T>(key: string, value: T, ttlSeconds?: number): Promise<void> {
    const effectiveTtl = ttlSeconds !== undefined ? ttlSeconds : this.defaultTtlSeconds;
    const expiresAt = effectiveTtl > 0 ? Date.now() + effectiveTtl * 1000 : null;

    this.store.set(key, {
      value,
      expiresAt,
    });
    CacheMetricsTracker.recordWrite();
  }

  public async delete(key: string): Promise<boolean> {
    const res = this.store.delete(key);
    if (res) CacheMetricsTracker.recordDelete();
    return res;
  }

  public async deletePattern(pattern: string): Promise<number> {
    const regex = new RegExp(`^${pattern.replace(/\*/g, '.*')}$`);
    let deletedCount = 0;

    for (const key of this.store.keys()) {
      if (regex.test(key)) {
        this.store.delete(key);
        deletedCount++;
      }
    }

    if (deletedCount > 0) {
      for (let i = 0; i < deletedCount; i++) {
        CacheMetricsTracker.recordDelete();
      }
    }

    return deletedCount;
  }

  public async has(key: string): Promise<boolean> {
    const val = await this.get(key);
    return val !== null;
  }

  public async clear(): Promise<void> {
    this.store.clear();
  }

  /**
   * Stampede-protected cached getter.
   * If multiple concurrent requests hit a cache miss simultaneously, only one executes `fetchFn`.
   */
  public async getOrSet<T>(key: string, fetchFn: () => Promise<T>, ttlSeconds?: number): Promise<T> {
    const cached = await this.get<T>(key);
    if (cached !== null) {
      return cached;
    }

    if (this.inflightRequests.has(key)) {
      return this.inflightRequests.get(key) as Promise<T>;
    }

    const promise = (async () => {
      try {
        const fresh = await fetchFn();
        await this.set(key, fresh, ttlSeconds);
        return fresh;
      } finally {
        this.inflightRequests.delete(key);
      }
    })();

    this.inflightRequests.set(key, promise);
    return promise;
  }

  public getStats(): { size: number; hits: number; misses: number } {
    return {
      size: this.store.size,
      hits: this.hits,
      misses: this.misses,
    };
  }
}
