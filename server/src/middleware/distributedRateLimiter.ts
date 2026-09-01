import { Request, Response, NextFunction } from 'express';
import { getCacheProvider } from '../cache';
import { sendError } from '../utils/response';

export interface RateLimitConfig {
  windowMs: number;
  max: number;
  message?: string;
  keyGenerator?: (req: Request) => string;
}

export const createDistributedRateLimiter = (config: RateLimitConfig) => {
  const windowSeconds = Math.ceil(config.windowMs / 1000);
  const maxRequests = config.max;
  const message = config.message || 'Too many requests. Please slow down and try again later.';

  return async (req: Request, res: Response, next: NextFunction) => {
    const key = config.keyGenerator
      ? config.keyGenerator(req)
      : `ratelimit:${req.ip || 'unknown'}:${req.baseUrl || req.path}`;

    try {
      const cache = getCacheProvider();
      const currentCount = (await cache.get<number>(key)) || 0;

      if (currentCount >= maxRequests) {
        res.setHeader('Retry-After', windowSeconds.toString());
        res.setHeader('X-RateLimit-Limit', maxRequests.toString());
        res.setHeader('X-RateLimit-Remaining', '0');
        return sendError(res, 'RATE_LIMIT_EXCEEDED', message, 429);
      }

      await cache.set(key, currentCount + 1, windowSeconds);

      res.setHeader('X-RateLimit-Limit', maxRequests.toString());
      res.setHeader('X-RateLimit-Remaining', Math.max(0, maxRequests - (currentCount + 1)).toString());
      next();
    } catch {
      // In case of cache failure, fail-open to preserve availability
      next();
    }
  };
};

export const distributedApiLimiter = createDistributedRateLimiter({
  windowMs: 60 * 1000, // 1 minute
  max: 120, // 120 reqs/min
});

export const distributedAuthLimiter = createDistributedRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // 20 attempts / 15 min
  message: 'Too many authentication attempts. Please try again later.',
  keyGenerator: (req: Request) => `ratelimit:auth:${req.ip || 'unknown'}`,
});

export const distributedAiLimiter = createDistributedRateLimiter({
  windowMs: 60 * 1000, // 1 minute
  max: 30, // 30 AI reqs / min
  message: 'AI rate limit reached. Please wait a moment before sending more queries.',
  keyGenerator: (req: Request) => `ratelimit:ai:${req.user?.id || req.ip || 'unknown'}`,
});
