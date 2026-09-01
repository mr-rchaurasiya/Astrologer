import { Request } from 'express';
import mongoose from 'mongoose';
import { AuditLog } from '../models/AuditLog';

export const recordAuditLog = async (
  action: string,
  req: Request,
  userId?: string | mongoose.Types.ObjectId,
  metadata: Record<string, any> = {}
): Promise<void> => {
  try {
    const ip = req.ip || req.headers['x-forwarded-for']?.toString() || req.socket.remoteAddress || 'unknown';
    const userAgent = req.headers['user-agent'] || 'unknown';

    // Ensure we don't log sensitive payload keys
    const safeMetadata = { ...metadata };
    delete safeMetadata.password;
    delete safeMetadata.newPassword;
    delete safeMetadata.currentPassword;
    delete safeMetadata.passwordHash;
    delete safeMetadata.token;
    delete safeMetadata.refreshToken;

    await AuditLog.create({
      userId: userId ? new mongoose.Types.ObjectId(userId.toString()) : undefined,
      action,
      metadata: safeMetadata,
      ip,
      userAgent,
      timestamp: new Date(),
    });
  } catch (err: any) {
    // Non-blocking audit failure
    console.error('Audit log failed to record:', err.message || err);
  }
};
