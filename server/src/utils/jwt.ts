import jwt, { SignOptions } from 'jsonwebtoken';
import { CookieOptions } from 'express';
import { config } from '../config/environment';
import { IUserSafe, UserRole } from '../models/User';

export interface TokenPayload {
  sub: string;
  role: UserRole;
  iat?: number;
  exp?: number;
}

export interface RefreshTokenPayload {
  sub: string;
  iat?: number;
  exp?: number;
}

export const generateAccessToken = (user: IUserSafe | { id: string; role: UserRole }): string => {
  const payload: TokenPayload = {
    sub: user.id,
    role: user.role,
  };

  const options: SignOptions = {
    expiresIn: config.jwt.accessExpiresIn as any,
  };

  return jwt.sign(payload, config.jwt.accessSecret, options);
};

export const generateRefreshToken = (userId: string): string => {
  const payload: RefreshTokenPayload = {
    sub: userId,
  };

  const options: SignOptions = {
    expiresIn: config.jwt.refreshExpiresIn as any,
  };

  return jwt.sign(payload, config.jwt.refreshSecret, options);
};

export const verifyAccessToken = (token: string): TokenPayload => {
  return jwt.verify(token, config.jwt.accessSecret) as TokenPayload;
};

export const verifyRefreshToken = (token: string): RefreshTokenPayload => {
  return jwt.verify(token, config.jwt.refreshSecret) as RefreshTokenPayload;
};

export const getRefreshTokenCookieOptions = (): CookieOptions => {
  return {
    httpOnly: true,
    secure: config.isProd,
    sameSite: config.isProd ? 'strict' : 'lax',
    path: '/api/v1/auth',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  };
};
