import { ICacheProvider } from './cache.types';
import { MemoryCacheProvider } from './memory.provider';

export class RedisCacheProvider implements ICacheProvider {
  private client: any = null;
  private fallbackProvider: MemoryCacheProvider;
  private inflightRequests: Map<string, Promise<any>> = new Map();
  private isConnected = false;
  private hits = 0;
  private misses = 0;
  private defaultTtl: number;
  private keyPrefix: string;

  constructor(redisUrl?: string, defaultTtlSeconds = 600, keyPrefix = 'astrologer:') {
    this.defaultTtl = defaultTtlSeconds;
    this.keyPrefix = keyPrefix;
    this.fallbackProvider = new MemoryCacheProvider(defaultTtlSeconds);

    if (redisUrl) {
      this.initRedis(redisUrl);
    }
  }

  private async initRedis(url: string) {
    try {
      this.isConnected = false;
    } catch {
      this.isConnected = false;
    }
  }

  private formatKey(key: string): string {
    return `${this.keyPrefix}${key}`;
  }

  public async get<T>(key: string): Promise<T | null> {
    if (!this.isConnected || !this.client) {
      const res = await this.fallbackProvider.get<T>(key);
      if (res !== null) this.hits++;
      else this.misses++;
      return res;
    }

    try {
      const raw = await this.client.get(this.formatKey(key));
      if (!raw) {
        this.misses++;
        return null;
      }
      this.hits++;
      return JSON.parse(raw) as T;
    } catch {
      return this.fallbackProvider.get<T>(key);
    }
  }

  public async set<T>(key: string, value: T, ttlSeconds?: number): Promise<void> {
    const ttl = ttlSeconds ?? this.defaultTtl;

    if (!this.isConnected || !this.client) {
      return this.fallbackProvider.set<T>(key, value, ttl);
    }

    try {
      const serialized = JSON.stringify(value);
      if (ttl > 0) {
        await this.client.set(this.formatKey(key), serialized, 'EX', ttl);
      } else {
        await this.client.set(this.formatKey(key), serialized);
      }
    } catch {
      await this.fallbackProvider.set<T>(key, value, ttl);
    }
  }

  public async delete(key: string): Promise<boolean> {
    if (!this.isConnected || !this.client) {
      return this.fallbackProvider.delete(key);
    }

    try {
      const deleted = await this.client.del(this.formatKey(key));
      return deleted > 0;
    } catch {
      return this.fallbackProvider.delete(key);
    }
  }

  public async deletePattern(pattern: string): Promise<number> {
    if (!this.isConnected || !this.client) {
      return this.fallbackProvider.deletePattern(pattern);
    }

    try {
      const keys = await this.client.keys(this.formatKey(pattern));
      if (keys && keys.length > 0) {
        return await this.client.del(...keys);
      }
      return 0;
    } catch {
      return this.fallbackProvider.deletePattern(pattern);
    }
  }

  public async has(key: string): Promise<boolean> {
    const val = await this.get(key);
    return val !== null;
  }

  public async clear(): Promise<void> {
    if (!this.isConnected || !this.client) {
      return this.fallbackProvider.clear();
    }

    try {
      await this.deletePattern('*');
    } catch {
      await this.fallbackProvider.clear();
    }
  }

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
      size: 0,
      hits: this.hits,
      misses: this.misses,
    };
  }
}
