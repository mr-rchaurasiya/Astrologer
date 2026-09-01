import express, { Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import { config } from './config/environment';
import { requestIdMiddleware } from './middleware/requestId';
import { requestMetricsMiddleware } from './observability/requestMetrics';
import { securityHeadersMiddleware } from './middleware/securityHeaders';
import { globalRateLimiter } from './middleware/rateLimiter';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import apiRouter from './routes';

export const createApp = (): Express => {
  const app = express();

  // Trust reverse proxy (X-Forwarded-For) in production/staging
  if (config.isProd || config.isStaging) {
    app.set('trust proxy', 1);
  }

  // Request ID Tracing & Observability
  app.use(requestIdMiddleware);
  app.use(requestMetricsMiddleware);

  // Security Headers (Helmet + Custom CSP/HSTS)
  app.use(helmet());
  app.use(securityHeadersMiddleware);

  // Dynamic Origin CORS Configuration
  const allowedOriginsSet = new Set(config.allowedOrigins);
  // Always permit local development origins in test/dev
  if (!config.isProd) {
    allowedOriginsSet.add('http://localhost:5173');
    allowedOriginsSet.add('http://127.0.0.1:5173');
    allowedOriginsSet.add('http://localhost:3000');
  }

  app.use(
    cors({
      origin: (origin, callback) => {
        // Allow requests with no origin (e.g. mobile apps, curl, server-to-server)
        if (!origin || allowedOriginsSet.has(origin)) {
          callback(null, true);
        } else {
          callback(new Error(`CORS blocked request from origin: ${origin}`));
        }
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: [
        'Content-Type',
        'Authorization',
        'X-Requested-With',
        'X-Request-ID',
        'x-razorpay-signature',
      ],
      exposedHeaders: ['X-Request-ID', 'Content-Disposition'],
    })
  );

  // Rate Limiting
  app.use(globalRateLimiter);

  // Parsers
  app.use(cookieParser());
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Request Logging
  if (config.isDev) {
    app.use(morgan('dev'));
  } else if (!config.isTest) {
    app.use(morgan('combined'));
  }

  // Mount API v1
  app.use('/api/v1', apiRouter);

  // Fallback 404 handler
  app.use(notFoundHandler);

  // Centralized Error handler
  app.use(errorHandler);

  return app;
};
