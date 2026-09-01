import { Request, Response, NextFunction } from 'express';
import { ApplicationMetrics } from './metrics';
import { Logger } from './logger';

export const requestMetricsMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const startTime = Date.now();
  const requestId = (req as any).id || req.headers['x-request-id'] || 'req_' + Math.random().toString(36).substring(2, 9);
  (req as any).id = requestId;
  res.setHeader('X-Request-ID', requestId);

  res.on('finish', () => {
    const latencyMs = Date.now() - startTime;
    const route = req.baseUrl ? `${req.baseUrl}${req.path}` : req.path;

    ApplicationMetrics.recordRequest(route, res.statusCode, latencyMs);

    if (res.statusCode >= 400) {
      Logger.warn(`HTTP ${req.method} ${route} ${res.statusCode} (${latencyMs}ms)`, {
        requestId,
        method: req.method,
        route,
        statusCode: res.statusCode,
        latencyMs,
      });
    }
  });

  next();
};
