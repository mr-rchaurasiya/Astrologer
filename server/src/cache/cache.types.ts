export interface ICacheProvider {
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T, ttlSeconds?: number): Promise<void>;
  delete(key: string): Promise<boolean>;
  deletePattern(pattern: string): Promise<number>;
  has(key: string): Promise<boolean>;
  clear(): Promise<void>;
  getOrSet<T>(key: string, fetchFn: () => Promise<T>, ttlSeconds?: number): Promise<T>;
  getStats(): { size: number; hits: number; misses: number };
}

export interface CacheOptions {
  ttlSeconds?: number;
  prefix?: string;
  namespace?: string;
}
