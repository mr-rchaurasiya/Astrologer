import { Request, Response, NextFunction } from 'express';
import { config } from '../config/environment';

export class AppError extends Error {
  public statusCode: number;
  public errorCode: string;
  public isOperational: boolean;
  public details?: any;

  constructor(
    message: string,
    statusCode: number = 500,
    errorCode: string = 'INTERNAL_ERROR',
    isOperational: boolean = true,
    details?: any
  ) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.isOperational = isOperational;
    this.details = details;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  constructor(message: string = 'Validation failed', details?: any) {
    super(message, 400, 'VALIDATION_ERROR', true, details);
  }
}

export class AuthError extends AppError {
  constructor(message: string = 'Authentication required') {
    super(message, 401, 'UNAUTHORIZED', true);
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string = 'Permission denied') {
    super(message, 403, 'FORBIDDEN', true);
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = 'Resource not found') {
    super(message, 404, 'NOT_FOUND', true);
  }
}

export class ConflictError extends AppError {
  constructor(message: string = 'Resource conflict') {
    super(message, 409, 'CONFLICT', true);
  }
}

export class RateLimitError extends AppError {
  constructor(message: string = 'Too many requests, please slow down') {
    super(message, 429, 'RATE_LIMIT_EXCEEDED', true);
  }
}

export class PaymentError extends AppError {
  constructor(message: string = 'Payment processing error', details?: any) {
    super(message, 400, 'PAYMENT_ERROR', true, details);
  }
}

export class AiError extends AppError {
  constructor(message: string = 'AI consultation service error', details?: any) {
    super(message, 503, 'AI_SERVICE_ERROR', true, details);
  }
}

export const notFoundHandler = (req: Request, res: Response, next: NextFunction) => {
  const error = new NotFoundError(`Cannot find endpoint ${req.method} ${req.originalUrl} on this server`);
  next(error);
};

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let statusCode = err.statusCode || (err.status ? Number(err.status) : 500);
  let errorCode = err.errorCode || (statusCode === 404 ? 'NOT_FOUND' : statusCode === 401 ? 'UNAUTHORIZED' : statusCode === 403 ? 'FORBIDDEN' : statusCode === 400 ? 'VALIDATION_ERROR' : 'INTERNAL_ERROR');
  const isProd = config.isProd;
  let message = (isProd && statusCode === 500 && !err.isOperational) ? 'An internal server error occurred' : (err.message || 'An error occurred');

  // Handle Mongoose disconnected buffering timeout gracefully
  if (err.name === 'MongooseError' && err.message?.includes('buffering timed out')) {
    statusCode = 503;
    errorCode = 'DATABASE_UNAVAILABLE';
    message = 'Database is currently offline. Please start local MongoDB or provide a valid MONGODB_URI (e.g. MongoDB Atlas) in server/.env';
  }
  const requestId = (req as any).id || req.headers['x-request-id'] || undefined;

  const responsePayload: any = {
    success: false,
    message,
    error: {
      code: errorCode,
      message,
      ...(requestId ? { requestId } : {}),
      ...(!isProd && err.stack ? { stack: err.stack } : {}),
      ...(err.details ? { details: err.details } : {}),
    },
  };

  res.status(statusCode).json(responsePayload);
};
