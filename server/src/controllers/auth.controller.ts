import { Request, Response, NextFunction } from 'express';
import { User, IUserSafe } from '../models/User';
import { hashPassword, comparePassword } from '../utils/password';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken, getRefreshTokenCookieOptions } from '../utils/jwt';
import { recordAuditLog } from '../utils/audit';
import { registerSchema, loginSchema, updatePasswordSchema } from '../validators/auth.validator';
import { AppError } from '../middleware/errorHandler';

export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parseResult = registerSchema.safeParse(req.body);
    if (!parseResult.success) {
      const issue = parseResult.error.issues[0];
      return next(new AppError(issue.message, 400, 'VALIDATION_ERROR'));
    }

    const { name, email, password } = parseResult.data;

    // Check duplicate
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      await recordAuditLog('register_failure_duplicate', req, undefined, { email });
      return next(new AppError('An account with this email already exists.', 409, 'DUPLICATE_EMAIL'));
    }

    // Hash password & create user
    const passwordHash = await hashPassword(password);
    const user = await User.create({
      name,
      email,
      passwordHash,
      role: 'user',
      isActive: true,
      lastLoginAt: new Date(),
    });

    const safeUser: IUserSafe = {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
      lastLoginAt: user.lastLoginAt,
      createdAt: user.createdAt,
    };

    const accessToken = generateAccessToken(safeUser);
    const refreshToken = generateRefreshToken(safeUser.id);

    // Set HTTP-only cookie for refresh token
    res.cookie('refreshToken', refreshToken, getRefreshTokenCookieOptions());

    await recordAuditLog('register', req, user._id, { email });

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: safeUser,
        accessToken,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parseResult = loginSchema.safeParse(req.body);
    if (!parseResult.success) {
      const issue = parseResult.error.issues[0];
      return next(new AppError(issue.message, 400, 'VALIDATION_ERROR'));
    }

    const { email, password } = parseResult.data;

    // Retrieve user including hidden passwordHash
    const user = await User.findOne({ email }).select('+passwordHash +isActive');
    if (!user) {
      await recordAuditLog('login_failure_not_found', req, undefined, { email });
      return next(new AppError('Invalid email or password.', 401, 'INVALID_CREDENTIALS'));
    }

    if (!user.isActive) {
      await recordAuditLog('login_failure_inactive', req, user._id, { email });
      return next(new AppError('This user account has been deactivated.', 403, 'ACCOUNT_DEACTIVATED'));
    }

    const isMatch = await comparePassword(password, user.passwordHash);
    if (!isMatch) {
      await recordAuditLog('login_failure_password', req, user._id, { email });
      return next(new AppError('Invalid email or password.', 401, 'INVALID_CREDENTIALS'));
    }

    // Update login timestamp
    user.lastLoginAt = new Date();
    await user.save();

    const safeUser: IUserSafe = {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
      lastLoginAt: user.lastLoginAt,
      createdAt: user.createdAt,
    };

    const accessToken = generateAccessToken(safeUser);
    const refreshToken = generateRefreshToken(safeUser.id);

    res.cookie('refreshToken', refreshToken, getRefreshTokenCookieOptions());

    await recordAuditLog('login', req, user._id, { email });

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        user: safeUser,
        accessToken,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const refresh = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Read from cookies or request body
    const token = req.cookies?.refreshToken || req.body?.refreshToken;

    if (!token) {
      return next(new AppError('Refresh token is required.', 401, 'REFRESH_TOKEN_REQUIRED'));
    }

    let payload;
    try {
      payload = verifyRefreshToken(token);
    } catch (err: any) {
      return next(new AppError('Invalid or expired refresh token. Please sign in again.', 401, 'INVALID_REFRESH_TOKEN'));
    }

    const user = await User.findById(payload.sub).select('+isActive');
    if (!user || !user.isActive) {
      return next(new AppError('User session is no longer active.', 401, 'USER_INACTIVE'));
    }

    const safeUser: IUserSafe = {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
      lastLoginAt: user.lastLoginAt,
      createdAt: user.createdAt,
    };

    const newAccessToken = generateAccessToken(safeUser);
    const newRefreshToken = generateRefreshToken(safeUser.id);

    res.cookie('refreshToken', newRefreshToken, getRefreshTokenCookieOptions());

    res.status(200).json({
      success: true,
      message: 'Token refreshed successfully',
      data: {
        accessToken: newAccessToken,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const logout = async (req: Request, res: Response, next: NextFunction) => {
  try {
    res.clearCookie('refreshToken', {
      httpOnly: true,
      path: '/api/v1/auth',
    });

    if (req.user) {
      await recordAuditLog('logout', req, req.user.id);
    }

    res.status(200).json({
      success: true,
      message: 'Logged out successfully',
      data: {},
    });
  } catch (error) {
    next(error);
  }
};

export const getMe = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return next(new AppError('Authentication required.', 401, 'UNAUTHORIZED'));
    }

    res.status(200).json({
      success: true,
      message: 'Current user retrieved successfully',
      data: {
        user: req.user,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const updatePassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return next(new AppError('Authentication required.', 401, 'UNAUTHORIZED'));
    }

    const parseResult = updatePasswordSchema.safeParse(req.body);
    if (!parseResult.success) {
      const issue = parseResult.error.issues[0];
      return next(new AppError(issue.message, 400, 'VALIDATION_ERROR'));
    }

    const { currentPassword, newPassword } = parseResult.data;

    const user = await User.findById(req.user.id).select('+passwordHash');
    if (!user) {
      return next(new AppError('User not found.', 404, 'USER_NOT_FOUND'));
    }

    const isMatch = await comparePassword(currentPassword, user.passwordHash);
    if (!isMatch) {
      await recordAuditLog('password_change_failure', req, req.user.id);
      return next(new AppError('Current password does not match.', 400, 'INVALID_CURRENT_PASSWORD'));
    }

    user.passwordHash = await hashPassword(newPassword);
    await user.save();

    await recordAuditLog('password_change', req, req.user.id);

    res.status(200).json({
      success: true,
      message: 'Password updated successfully',
      data: {},
    });
  } catch (error) {
    next(error);
  }
};
