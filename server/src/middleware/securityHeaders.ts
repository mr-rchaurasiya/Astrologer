import { Request, Response, NextFunction } from 'express';
import { config } from '../config/environment';

export const securityHeadersMiddleware = (req: Request, res: Response, next: NextFunction) => {
  // Prevent MIME-type sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');

  // Clickjacking protection (permit Razorpay iframe embedding if needed)
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');

  // Referrer Policy
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

  // Permissions Policy (allow microphone for voice consultation)
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(self), geolocation=()');

  // HSTS in production/staging environments
  if (config.isProd || config.isStaging) {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  }

  // Content Security Policy
  const cspDirectives = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' https://checkout.razorpay.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com data:",
    "img-src 'self' data: https: blob:",
    "connect-src 'self' https://api.razorpay.com https://lumberjack.razorpay.com https://api.openai.com wss: ws:",
    "frame-src 'self' https://api.razorpay.com",
    "object-src 'none'",
    "base-uri 'self'",
  ];

  res.setHeader('Content-Security-Policy', cspDirectives.join('; '));

  next();
};
