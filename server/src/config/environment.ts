import dotenv from 'dotenv';
import path from 'path';

// Load .env file
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export const config = {
  port: parseInt(process.env.PORT || '5000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  isDev: (process.env.NODE_ENV || 'development') === 'development',
  isProd: process.env.NODE_ENV === 'production',
  isStaging: process.env.NODE_ENV === 'staging',
  isTest: process.env.NODE_ENV === 'test',
  mongodbUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/astrologer_db',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  allowedOrigins: (process.env.ALLOWED_ORIGINS || process.env.CLIENT_URL || 'http://localhost:5173,http://127.0.0.1:5173')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean),
  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET || process.env.JWT_SECRET || 'astrologer_jwt_access_secret_production_secure_key_2026',
    accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
    refreshSecret: process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET || 'astrologer_jwt_refresh_secret_production_secure_key_2026',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  },
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10),
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),
  },
  ai: {
    provider: process.env.AI_PROVIDER || 'openai',
    apiKey: process.env.AI_API_KEY || process.env.OPENAI_API_KEY || process.env.GROQ_API_KEY || '',
    model: process.env.AI_MODEL || ((process.env.OPENAI_API_KEY || process.env.AI_API_KEY || '').startsWith('gsk_') ? 'llama-3.3-70b-versatile' : 'gpt-4o-mini'),
    baseUrl: process.env.AI_BASE_URL || ((process.env.OPENAI_API_KEY || process.env.AI_API_KEY || '').startsWith('gsk_') ? 'https://api.groq.com/openai/v1' : ''),
    maxTokens: parseInt(process.env.AI_MAX_TOKENS || '1000', 10),
    temperature: parseFloat(process.env.AI_TEMPERATURE || '0.7'),
    requestTimeoutMs: parseInt(process.env.AI_REQUEST_TIMEOUT || '30000', 10),
    maxContextTokens: parseInt(process.env.AI_MAX_CONTEXT_TOKENS || '4000', 10),
    chatRequestsPerMinute: parseInt(process.env.AI_CHAT_REQUESTS_PER_MINUTE || '20', 10),
    retentionDays: parseInt(process.env.CHAT_RETENTION_DAYS || '90', 10),
  },
  payments: {
    razorpayKeyId: process.env.RAZORPAY_KEY_ID || '',
    razorpayKeySecret: process.env.RAZORPAY_KEY_SECRET || '',
    razorpayWebhookSecret: process.env.RAZORPAY_WEBHOOK_SECRET || '',
  },
  email: {
    provider: process.env.EMAIL_PROVIDER || 'smtp',
    from: process.env.EMAIL_FROM || 'noreply@astrologer.ai',
    smtpHost: process.env.SMTP_HOST || '',
    smtpPort: parseInt(process.env.SMTP_PORT || '587', 10),
    smtpUser: process.env.SMTP_USER || '',
    smtpPassword: process.env.SMTP_PASSWORD || '',
  },
  storage: {
    provider: process.env.STORAGE_PROVIDER || 'local',
    localReportsDir: path.resolve(__dirname, '../../storage/reports'),
    bucket: process.env.STORAGE_BUCKET || '',
    region: process.env.STORAGE_REGION || 'us-east-1',
    accessKey: process.env.STORAGE_ACCESS_KEY || '',
    secretKey: process.env.STORAGE_SECRET_KEY || '',
    endpoint: process.env.STORAGE_ENDPOINT || '',
  },
  redis: {
    url: process.env.REDIS_URL || '',
    keyPrefix: process.env.REDIS_KEY_PREFIX || 'astrologer:',
  },
  observability: {
    logLevel: process.env.LOG_LEVEL || (process.env.NODE_ENV === 'production' ? 'info' : 'debug'),
    sentryDsn: process.env.SENTRY_DSN || '',
    environment: process.env.NODE_ENV || 'development',
    release: process.env.APP_VERSION || '1.0.0',
  },
  voice: {
    provider: process.env.VOICE_PROVIDER || 'openai',
    sttModel: process.env.VOICE_STT_MODEL || 'whisper-1',
    ttsModel: process.env.VOICE_TTS_MODEL || 'tts-1',
    ttsVoice: process.env.VOICE_TTS_VOICE || 'nova',
  },
};

/**
 * Validates startup environment variables according to deployment target.
 * In production mode, missing critical secrets fail fast.
 */
export const validateEnvironment = (envName = config.nodeEnv): ValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];

  const isProductionMode = envName === 'production' || envName === 'staging';

  if (isProductionMode) {
    if (!process.env.MONGODB_URI) {
      errors.push('MONGODB_URI is required in production/staging mode');
    }
    const accessSec = process.env.JWT_ACCESS_SECRET || process.env.JWT_SECRET;
    if (!accessSec || accessSec === 'development_key_unsecured') {
      errors.push('JWT_ACCESS_SECRET must be set to a secure, non-development secret in production');
    }
    const refreshSec = process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET;
    if (!refreshSec || refreshSec === 'development_key_unsecured') {
      errors.push('JWT_REFRESH_SECRET must be set to a secure, non-development secret in production');
    }
    if (!process.env.CLIENT_URL) {
      warnings.push('CLIENT_URL not set; defaulting to http://localhost:5173');
    }
    if (!config.payments.razorpayKeyId || !config.payments.razorpayKeySecret) {
      warnings.push('Razorpay credentials not fully configured; payments will operate in fallback mode');
    }
    if (!config.ai.apiKey) {
      warnings.push('AI_API_KEY is not configured; AI consultations will operate in mock fallback mode');
    }
    if (config.storage.provider === 'cloud' && !config.storage.bucket) {
      errors.push('STORAGE_BUCKET is required when STORAGE_PROVIDER is set to "cloud"');
    }
  } else {
    // Development / Test mode checks
    if (!config.mongodbUri) {
      warnings.push('MONGODB_URI is using fallback connection string');
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
};

/**
 * Utility to safely mask secret tokens for logging/debugging
 */
export const maskSecret = (secret?: string): string => {
  if (!secret) return '(not configured)';
  if (secret.length <= 8) return '****';
  return `${secret.slice(0, 3)}...${secret.slice(-4)}`;
};
