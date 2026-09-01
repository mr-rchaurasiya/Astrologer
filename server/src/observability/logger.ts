export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const LOG_LEVEL_PRIORITY: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

const SENSITIVE_KEYS = new Set([
  'password',
  'passwordhash',
  'token',
  'accesstoken',
  'refreshtoken',
  'authorization',
  'cookie',
  'secret',
  'apikey',
  'key',
  'razorpaykeysecret',
  'razorpaywebhooksecret',
  'smtppassword',
  'storageaccesskey',
  'storagesecretkey',
]);

export class Logger {
  private static currentLogLevel: LogLevel = (process.env.LOG_LEVEL?.toLowerCase() as LogLevel) || 'info';

  public static setLogLevel(level: LogLevel): void {
    this.currentLogLevel = level;
  }

  public static log(level: LogLevel, message: string, meta?: Record<string, any>): void {
    const minLevel = this.currentLogLevel;
    if (LOG_LEVEL_PRIORITY[level] < LOG_LEVEL_PRIORITY[minLevel]) {
      return;
    }

    const timestamp = new Date().toISOString();
    const sanitizedMeta = meta ? this.sanitize(meta) : undefined;

    const logObject = {
      timestamp,
      level: level.toUpperCase(),
      message,
      environment: process.env.NODE_ENV || 'development',
      ...(sanitizedMeta ? { meta: sanitizedMeta } : {}),
    };

    if (process.env.NODE_ENV === 'test') {
      return;
    }

    const json = JSON.stringify(logObject);
    if (level === 'error') {
      console.error(json);
    } else if (level === 'warn') {
      console.warn(json);
    } else {
      console.log(json);
    }
  }

  public static info(message: string, meta?: Record<string, any>): void {
    this.log('info', message, meta);
  }

  public static warn(message: string, meta?: Record<string, any>): void {
    this.log('warn', message, meta);
  }

  public static error(message: string, meta?: Record<string, any>): void {
    this.log('error', message, meta);
  }

  public static debug(message: string, meta?: Record<string, any>): void {
    this.log('debug', message, meta);
  }

  public static sanitize(obj: any): any {
    if (obj === null || obj === undefined) return obj;
    if (typeof obj !== 'object') return obj;

    if (Array.isArray(obj)) {
      return obj.map((item) => this.sanitize(item));
    }

    const sanitized: Record<string, any> = {};
    for (const [k, v] of Object.entries(obj)) {
      const lower = k.toLowerCase().replace(/[^a-z]/g, '');
      if (SENSITIVE_KEYS.has(lower)) {
        sanitized[k] = '[REDACTED]';
      } else if (typeof v === 'object') {
        sanitized[k] = this.sanitize(v);
      } else {
        sanitized[k] = v;
      }
    }
    return sanitized;
  }
}
