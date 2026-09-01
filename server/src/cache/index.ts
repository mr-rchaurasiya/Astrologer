import { ICacheProvider } from './cache.types';
import { MemoryCacheProvider } from './memory.provider';
import { RedisCacheProvider } from './redis.provider';
import { config } from '../config/environment';

let globalCacheInstance: ICacheProvider | null = null;

export const getCacheProvider = (): ICacheProvider => {
  if (!globalCacheInstance) {
    if (config.redis.url) {
      globalCacheInstance = new RedisCacheProvider(config.redis.url, 600, config.redis.keyPrefix);
    } else {
      globalCacheInstance = new MemoryCacheProvider(600); // 10 minutes default TTL
    }
  }
  return globalCacheInstance;
};

export const setCacheProvider = (provider: ICacheProvider): void => {
  globalCacheInstance = provider;
};

export * from './cache.types';
export * from './memory.provider';
export * from './redis.provider';
