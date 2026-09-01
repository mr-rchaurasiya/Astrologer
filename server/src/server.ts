import { createApp } from './app';
import { config, validateEnvironment } from './config/environment';
import { connectDatabase, disconnectDatabase } from './config/database';
import { getJobQueue } from './queue/jobQueue';
import { ErrorTracker } from './observability/errorTracker';
import { Logger } from './observability/logger';

const startServer = async () => {
  try {
    // 1. Validate Environment on startup
    const envValidation = validateEnvironment();
    if (!envValidation.isValid) {
      console.error('❌ Environment validation failed with fatal errors:');
      envValidation.errors.forEach((err) => console.error(`   - ${err}`));
      process.exit(1);
    }

    if (envValidation.warnings.length > 0 && !config.isTest) {
      console.warn('⚠️ Environment warnings:');
      envValidation.warnings.forEach((w) => console.warn(`   - ${w}`));
    }

    // 2. Initialize Error Tracking
    ErrorTracker.init();

    // 3. Instantiate Application & Start HTTP Listener
    const app = createApp();

    const server = app.listen(config.port, () => {
      console.log(`====================================================`);
      console.log(`🌌 Astrologer Platform Backend API`);
      console.log(`🛰️  Environment: ${config.nodeEnv}`);
      console.log(`🌐 Server running at: http://localhost:${config.port}`);
      console.log(`🩺 Health endpoint:   http://localhost:${config.port}/api/v1/health`);
      console.log(`🩺 Readiness probe:   http://localhost:${config.port}/api/v1/health/ready`);
      console.log(`🔐 Auth endpoints:    http://localhost:${config.port}/api/v1/auth`);
      console.log(`👤 Profile endpoints: http://localhost:${config.port}/api/v1/profiles`);
      console.log(`====================================================`);
    });

    // 4. Connect to Database asynchronously in background
    connectDatabase().catch((err) => {
      console.error('❌ Background MongoDB connection failed:', err.message || err);
    });

    // Graceful shutdown handlers
    let isShuttingDown = false;
    const shutdown = async (signal: string) => {
      if (isShuttingDown) return;
      isShuttingDown = true;

      Logger.info(`\nReceived ${signal}. Shutting down gracefully...`);

      // 1. Stop accepting new HTTP requests
      server.close(async () => {
        Logger.info('HTTP server closed.');

        try {
          // 2. Drain background job queues
          const queue = getJobQueue();
          await queue.shutdown();

          // 3. Disconnect database connections
          await disconnectDatabase();

          Logger.info('Clean graceful shutdown completed.');
          process.exit(0);
        } catch (err: any) {
          Logger.error('Error during graceful shutdown:', err);
          process.exit(1);
        }
      });

      // Force shutdown if connections do not close within timeout
      setTimeout(() => {
        console.error('Forced shutdown due to timeout (10s).');
        process.exit(1);
      }, 10000);
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
  } catch (error: any) {
    console.error('❌ Fatal error during server startup:', error.message || error);
    process.exit(1);
  }
};

startServer();
