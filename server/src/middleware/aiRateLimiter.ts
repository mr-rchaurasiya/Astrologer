import rateLimit from 'express-rate-limit';
import { config } from '../config/environment';

export const aiRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: config.ai.chatRequestsPerMinute || 20,
  skip: () => config.isTest,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "You've reached the current AI consultation limit. Please wait a moment before sending another question.",
    error: {
      code: 'AI_RATE_LIMIT_EXCEEDED',
    },
  },
});
