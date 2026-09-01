import { Request, Response, NextFunction } from 'express';
import { getCacheProvider } from '../cache';
import { sendError } from '../utils/response';
import { Logger } from '../observability/logger';

export class AbuseProtection {
  private static suspiciousIps: Map<string, { count: number; blockedUntil: number }> = new Map();

  /**
   * Tracks failed authentication attempts and temporarily blocks IP if threshold exceeded.
   */
  public static async recordFailedAttempt(ip: string, category = 'auth'): Promise<void> {
    const key = `abuse:${category}:${ip}`;
    const cache = getCacheProvider();
    const current = (await cache.get<number>(key)) || 0;
    const nextCount = current + 1;

    await cache.set(key, nextCount, 900); // 15-minute tracking window

    if (nextCount >= 10) {
      Logger.warn(`🚨 Excessive failed attempts from IP: ${ip} for category: ${category}. Temporarily blocked.`);
      this.suspiciousIps.set(ip, {
        count: nextCount,
        blockedUntil: Date.now() + 15 * 60 * 1000,
      });
    }
  }

  /**
   * Middleware guarding sensitive endpoints against brute-force abuse.
   */
  public static middleware(category = 'auth') {
    return async (req: Request, res: Response, next: NextFunction) => {
      const ip = req.ip || 'unknown';
      const blocked = AbuseProtection.suspiciousIps.get(ip);

      if (blocked && Date.now() < blocked.blockedUntil) {
        const remainingSeconds = Math.ceil((blocked.blockedUntil - Date.now()) / 1000);
        res.setHeader('Retry-After', remainingSeconds.toString());
        return sendError(
          res,
          'SECURITY_BLOCK',
          `Too many suspicious requests from this IP. Please try again in ${remainingSeconds} seconds.`,
          429
        );
      }

      next();
    };
  }

  /**
   * Clears failure record for IP upon successful authentication.
   */
  public static async clearFailureRecord(ip: string, category = 'auth'): Promise<void> {
    const key = `abuse:${category}:${ip}`;
    const cache = getCacheProvider();
    await cache.delete(key);
    this.suspiciousIps.delete(ip);
  }
}
