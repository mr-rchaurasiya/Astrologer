import { Request, Response } from 'express';
import { config } from '../config/environment';
import { getCacheProvider } from '../cache';
import { getDatabaseHealth } from '../config/database';
import { getStorageProvider } from '../storage';
import { WorkerPool } from '../queue/workerPool';
import { sendSuccess } from '../utils/response';

export const getHealth = (req: Request, res: Response) => {
  const healthData = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: Math.floor(process.uptime()),
    version: config.observability.release || '1.0.0',
    environment: config.nodeEnv,
  };

  return sendSuccess(res, healthData, 'Astrologer API is healthy');
};

export const getLiveness = (req: Request, res: Response) => {
  return res.status(200).json({
    status: 'alive',
    uptime: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
  });
};

export const getReadiness = (req: Request, res: Response) => {
  const dbHealth = getDatabaseHealth();
  const isDbReady = dbHealth.isHealthy || process.env.NODE_ENV === 'test';

  const cache = getCacheProvider();
  const isCacheReady = Boolean(cache);

  const storage = getStorageProvider();
  const isStorageReady = Boolean(storage);

  const workerStats = WorkerPool.getStats();

  const isAiConfigured = Boolean(config.ai?.apiKey && config.ai.apiKey !== 'mock-key-development');
  const isPaymentConfigured = Boolean(config.payments?.razorpayKeyId && config.payments?.razorpayKeySecret);
  const isEmailConfigured = Boolean(config.email?.smtpHost && config.email?.smtpUser);

  const subsystems = {
    database: isDbReady ? 'healthy' : 'unhealthy',
    cache: isCacheReady ? 'healthy' : 'degraded',
    storage: isStorageReady ? 'healthy' : 'degraded',
    workers: {
      active: workerStats.activeJobsCount,
      deadLetter: workerStats.deadLetterCount,
    },
    ai: isAiConfigured ? 'configured' : 'unconfigured',
    payments: isPaymentConfigured ? 'configured' : 'unconfigured',
    email: isEmailConfigured ? 'configured' : 'unconfigured',
  };

  if (!isDbReady) {
    return res.status(503).json({
      success: false,
      message: 'Database service is unavailable',
      status: 'not_ready',
      subsystems,
    });
  }

  return sendSuccess(
    res,
    {
      status: 'ready',
      subsystems,
      timestamp: new Date().toISOString(),
    },
    'Astrologer API is ready to accept traffic'
  );
};
