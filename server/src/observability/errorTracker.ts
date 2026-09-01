import { Logger } from './logger';
import { config } from '../config/environment';

export interface ErrorContext {
  userId?: string;
  requestId?: string;
  route?: string;
  action?: string;
  tags?: Record<string, string>;
  extra?: Record<string, any>;
}

export class ErrorTracker {
  private static isInitialized = false;

  public static init(): void {
    if (config.observability.sentryDsn) {
      this.isInitialized = true;
      Logger.info('📡 ErrorTracker initialized with remote monitoring.');
    }
  }

  public static captureException(error: Error | any, context?: ErrorContext): void {
    const errorPayload = {
      message: error?.message || String(error),
      name: error?.name || 'Error',
      stack: error?.stack,
      context: context ? Logger.sanitize(context) : undefined,
      environment: config.nodeEnv,
      release: config.observability.release,
    };

    Logger.error(`[ErrorTracker] Exception captured: ${errorPayload.message}`, errorPayload);

    // If Sentry/Remote SDK is loaded in future, dispatch here
  }

  public static captureMessage(message: string, level: 'info' | 'warning' | 'error' = 'info', context?: ErrorContext): void {
    Logger.log(level === 'warning' ? 'warn' : level, `[ErrorTracker] ${message}`, context);
  }
}
