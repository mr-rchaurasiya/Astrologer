import { getCacheProvider } from '../cache';
import { Logger } from '../observability/logger';

export interface LockOptions {
  ttlSeconds?: number;
  retryIntervalMs?: number;
  maxRetries?: number;
}

export class DistributedLock {
  private static locks: Map<string, { owner: string; expiresAt: number }> = new Map();

  /**
   * Attempts to acquire a distributed lock for a given resource.
   */
  public static async acquire(
    resourceKey: string,
    ownerId: string,
    options: LockOptions = {}
  ): Promise<boolean> {
    const ttlSeconds = options.ttlSeconds ?? 10;
    const retryIntervalMs = options.retryIntervalMs ?? 100;
    const maxRetries = options.maxRetries ?? 5;
    const lockKey = `lock:${resourceKey}`;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      const now = Date.now();
      const existing = this.locks.get(lockKey);

      // Check if lock is free or expired
      if (!existing || existing.expiresAt <= now) {
        this.locks.set(lockKey, {
          owner: ownerId,
          expiresAt: now + ttlSeconds * 1000,
        });

        // Also attempt cache provider sync if available
        try {
          const cache = getCacheProvider();
          await cache.set(lockKey, { owner: ownerId }, ttlSeconds);
        } catch {
          // Fallback to local memory lock
        }

        return true;
      }

      // If already owned by same ownerId, refresh TTL
      if (existing.owner === ownerId) {
        existing.expiresAt = now + ttlSeconds * 1000;
        return true;
      }

      // Wait before retrying
      if (attempt < maxRetries) {
        await new Promise((resolve) => setTimeout(resolve, retryIntervalMs));
      }
    }

    Logger.warn(`⚠️ Failed to acquire lock for resource: ${resourceKey} by owner: ${ownerId}`);
    return false;
  }

  /**
   * Releases an acquired lock if the owner matches.
   */
  public static async release(resourceKey: string, ownerId: string): Promise<boolean> {
    const lockKey = `lock:${resourceKey}`;
    const existing = this.locks.get(lockKey);

    if (existing && existing.owner === ownerId) {
      this.locks.delete(lockKey);
      try {
        const cache = getCacheProvider();
        await cache.delete(lockKey);
      } catch {
        // Fallback
      }
      return true;
    }

    return false;
  }

  /**
   * Executes a critical callback within an acquired lock.
   */
  public static async withLock<T>(
    resourceKey: string,
    ownerId: string,
    callback: () => Promise<T>,
    options?: LockOptions
  ): Promise<T> {
    const acquired = await this.acquire(resourceKey, ownerId, options);
    if (!acquired) {
      throw new Error(`Could not acquire distributed lock for resource: ${resourceKey}`);
    }

    try {
      return await callback();
    } finally {
      await this.release(resourceKey, ownerId);
    }
  }
}
