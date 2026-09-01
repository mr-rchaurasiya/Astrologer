import rateLimit from 'express-rate-limit';
import { config } from '../config/environment';

export const globalRateLimiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.max,
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => config.isTest,
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again after 15 minutes',
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
    },
  },
});

export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // 20 attempts per 15 min
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => config.isTest,
  message: {
    success: false,
    message: 'Too many authentication attempts, please try again after 15 minutes',
    error: {
      code: 'AUTH_RATE_LIMIT_EXCEEDED',
    },
  },
});

export const aiRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: config.ai.chatRequestsPerMinute || 30,
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => config.isTest,
  message: {
    success: false,
    message: 'Too many AI consultation requests. Please wait a moment before sending another prompt.',
    error: {
      code: 'AI_RATE_LIMIT_EXCEEDED',
    },
  },
});

export const voiceRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 15,
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => config.isTest,
  message: {
    success: false,
    message: 'Too many voice AI requests. Please slow down.',
    error: {
      code: 'VOICE_RATE_LIMIT_EXCEEDED',
    },
  },
});

export const reportRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => config.isTest,
  message: {
    success: false,
    message: 'PDF report generation limit reached. Please wait a minute before requesting another report.',
    error: {
      code: 'REPORT_RATE_LIMIT_EXCEEDED',
    },
  },
});

export const paymentRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => config.isTest,
  message: {
    success: false,
    message: 'Too many payment requests. Please try again later.',
    error: {
      code: 'PAYMENT_RATE_LIMIT_EXCEEDED',
    },
  },
});

export const publicShareRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => config.isTest,
  message: {
    success: false,
    message: 'Too many chart requests. Please wait a moment.',
    error: {
      code: 'SHARE_RATE_LIMIT_EXCEEDED',
    },
  },
});
