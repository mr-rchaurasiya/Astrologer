import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken, TokenPayload } from '../utils/jwt';
import { User, IUserSafe } from '../models/User';
import { AppError } from './errorHandler';

// Extend Express Request type
declare global {
  namespace Express {
    interface Request {
      user?: IUserSafe;
    }
  }
}

export const requireAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next(new AppError('Authentication required. Please provide a valid Bearer token.', 401, 'UNAUTHORIZED'));
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return next(new AppError('Malformed authorization header.', 401, 'MALFORMED_TOKEN'));
    }

    let payload: TokenPayload;
    try {
      payload = verifyAccessToken(token);
    } catch (err: any) {
      if (err.name === 'TokenExpiredError') {
        return next(new AppError('Access token has expired. Please refresh your session.', 401, 'TOKEN_EXPIRED'));
      }
      return next(new AppError('Invalid access token.', 401, 'INVALID_TOKEN'));
    }

    const user = await User.findById(payload.sub).select('+isActive');

    if (!user) {
      return next(new AppError('User belonging to this token no longer exists.', 401, 'USER_NOT_FOUND'));
    }

    if (!user.isActive) {
      return next(new AppError('This user account has been deactivated.', 403, 'ACCOUNT_DEACTIVATED'));
    }

    req.user = {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
      lastLoginAt: user.lastLoginAt,
      createdAt: user.createdAt,
    };

    next();
  } catch (error) {
    next(error);
  }
};

export const requireRole = (role: 'admin' | 'user') => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AppError('Authentication required.', 401, 'UNAUTHORIZED'));
    }

    if (req.user.role !== role && req.user.role !== 'admin') {
      return next(new AppError('You do not have permission to perform this action.', 403, 'FORBIDDEN'));
    }

    next();
  };
};

export const optionalAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next();
    }

    const token = authHeader.split(' ')[1];
    if (!token) return next();

    let payload: TokenPayload;
    try {
      payload = verifyAccessToken(token);
    } catch {
      return next();
    }

    const user = await User.findById(payload.sub).select('+isActive');
    if (!user || !user.isActive) return next();

    req.user = {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
      lastLoginAt: user.lastLoginAt,
      createdAt: user.createdAt,
    };

    next();
  } catch {
    next();
  }
};
